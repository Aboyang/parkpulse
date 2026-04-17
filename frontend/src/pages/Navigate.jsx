import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import {
  Crosshair,
  VolumeX,
  Volume2,
  X,
  Navigation as NavIcon,
  ArrowLeft,
  CornerDownLeft,
  CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';

// ─── Icons ───────────────────────────────────────────────────────────────────

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(59,130,246,0.6)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const destIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#14b8a6;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(20,184,166,0.6)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchUserPosition() {
  try {
    const res = await fetch('http://localhost:3000/api/location');
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.lat != null && data?.lng != null) return [data.lat, data.lng];
    return null;
  } catch {
    return null;
  }
}

async function fetchRoute(start, end) {
  const res = await fetch('http://localhost:3000/api/navigate/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end }),
  });
  if (!res.ok) throw new Error('Route fetch failed');
  return res.json(); // { pts, steps, totalDist }
}

function getDistanceM(a, b) {
  const R  = 6371e3;
  const p1 = (a[0] * Math.PI) / 180;
  const p2 = (b[0] * Math.PI) / 180;
  const dp = ((b[0] - a[0]) * Math.PI) / 180;
  const dl = ((b[1] - a[1]) * Math.PI) / 180;
  const x  = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true, duration: 0.5 });
  }, [center?.[0], center?.[1]]);
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000;

export default function Navigate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const [muted,          setMuted]          = useState(false);
  const [arrived,        setArrived]        = useState(false);
  const [userPos,        setUserPos]        = useState(null);
  const [route,          setRoute]          = useState([]);
  const [navSteps,       setNavSteps]       = useState([]);
  const [locationStatus, setLocationStatus] = useState('requesting');

  const pollRef            = useRef(null);
  const mutedRef           = useRef(false);
  const totalDistRef       = useRef(0);
  const spokenStepIndexRef = useRef(-1);
  const stepsRef           = useRef([]);

  const carpark     = location.state?.carpark;
  const destination = carpark ? [carpark.latitude, carpark.longitude] : null;

  useEffect(() => { mutedRef.current = muted; }, [muted]);

  function speak(text) {
    if (mutedRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt   = new SpeechSynthesisUtterance(text);
    utt.lang    = 'en-SG';
    utt.rate    = 1.0;
    utt.pitch   = 1.0;
    window.speechSynthesis.speak(utt);
  }

  // ── Init: get position → fetch route → start polling ──────────────────────
  useEffect(() => {
    if (!destination) return;

    let cancelled = false;

    const init = async () => {
      setLocationStatus('requesting');
      const pos = await fetchUserPosition();
      if (cancelled) return;

      if (!pos) { setLocationStatus('denied'); return; }

      setLocationStatus('granted');

      try {
        const { pts, steps, totalDist } = await fetchRoute(pos, destination);
        if (cancelled) return;

        totalDistRef.current = totalDist;
        stepsRef.current     = steps;
        setRoute(pts);
        setNavSteps(steps);
        setUserPos(pos);
      } catch {
        setLocationStatus('denied');
        return;
      }

      pollRef.current = setInterval(async () => {
        const updated = await fetchUserPosition();
        if (!cancelled && updated) setUserPos(updated);
      }, POLL_INTERVAL_MS);
    };

    init();

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [destination?.[0], destination?.[1]]);

  // ── Retry ──────────────────────────────────────────────────────────────────
  const handleRetry = async () => {
    setLocationStatus('requesting');
    const pos = await fetchUserPosition();
    if (!pos) { setLocationStatus('denied'); return; }

    setLocationStatus('granted');
    const { pts, steps, totalDist } = await fetchRoute(pos, destination);
    totalDistRef.current = totalDist;
    stepsRef.current     = steps;
    setRoute(pts);
    setNavSteps(steps);
    setUserPos(pos);

    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const updated = await fetchUserPosition();
      if (updated) setUserPos(updated);
    }, POLL_INTERVAL_MS);
  };

  // ── Arrival check ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userPos || !destination || arrived) return;
    if (getDistanceM(userPos, destination) < 40) setArrived(true);
  }, [userPos]);

  useEffect(() => {
    if (arrived) {
      speak('You have arrived at your destination');
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [arrived]);

  // ── Remaining distance ─────────────────────────────────────────────────────
  const remainingDist = route.length > 1 && userPos
    ? (() => {
        let minD = Infinity, closestIdx = 0;
        route.forEach((p, i) => {
          const d = getDistanceM(userPos, p);
          if (d < minD) { minD = d; closestIdx = i; }
        });
        return route
          .slice(closestIdx)
          .reduce((sum, p, i, arr) => (i === 0 ? 0 : sum + getDistanceM(arr[i - 1], p)), 0);
      })()
    : (totalDistRef.current || 0);

  const remainingMin = remainingDist > 0 ? Math.max(1, Math.round(remainingDist / (45000 / 60))) : 1;
  const etaStr       = new Date(Date.now() + remainingMin * 60000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ── Current nav step ───────────────────────────────────────────────────────
  const currentStepIndex = (() => {
    if (!navSteps.length || !userPos) return 0;
    let lastPassedIdx = 0;
    for (let i = 0; i < navSteps.length; i++) {
      if (!navSteps[i].location) continue;
      if (getDistanceM(userPos, navSteps[i].location) < 40) lastPassedIdx = i;
    }
    const next = lastPassedIdx + 1;
    return next < navSteps.length ? next : lastPassedIdx;
  })();

  const currentStep = navSteps[currentStepIndex] || { text: 'Calculating…', icon: 'straight' };

  const ManeuverIcon =
    currentStep.icon === 'left'  ? CornerDownLeft  :
    currentStep.icon === 'right' ? CornerDownRight :
    currentStep.icon === 'uturn' ? ArrowLeft       :
    NavIcon;

  useEffect(() => {
    if (!currentStep.text || currentStepIndex === spokenStepIndexRef.current) return;
    spokenStepIndexRef.current = currentStepIndex;
    speak(currentStep.text);
  }, [currentStepIndex]);

  // ── Tile URL ───────────────────────────────────────────────────────────────
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  // ── Loading / error screens ────────────────────────────────────────────────
  if (!carpark || !userPos || route.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 dark:bg-blue-50 flex flex-col items-center justify-center gap-6 px-8 text-white dark:text-slate-800">
        {locationStatus === 'requesting' && (
          <>
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center">
              <Crosshair className="w-8 h-8 text-teal-400 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">Acquiring Your Location</p>
              <p className="text-slate-400 dark:text-slate-600 text-sm">Fetching your position…</p>
            </div>
            <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
          </>
        )}

        {locationStatus === 'granted' && (
          <>
            <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
            <p className="text-slate-300 dark:text-slate-700 text-sm">Calculating route…</p>
          </>
        )}

        {locationStatus === 'denied' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <Crosshair className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">Could Not Get Location</p>
              <p className="text-slate-400 dark:text-slate-600 text-sm">
                The location service returned no data. Make sure your backend is running.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-colors"
            >
              Try Again
            </button>
            <button onClick={() => navigate(-1)} className="text-slate-500 text-sm underline">
              Go back
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Split route into completed / remaining segments ────────────────────────
  const closestRouteIdx = (() => {
    let minD = Infinity, idx = 0;
    route.forEach((p, i) => {
      const d = getDistanceM(userPos, p);
      if (d < minD) { minD = d; idx = i; }
    });
    return idx;
  })();
  const completedRoute = route.slice(0, closestRouteIdx + 1);
  const remainingRoute = route.slice(closestRouteIdx);

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-slate-900 dark:bg-blue-50 text-white dark:text-slate-800 relative overflow-hidden">

      {/* ── Turn instruction banner ── */}
      <AnimatePresence>
        {!arrived && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="absolute top-0 left-0 right-0 z-[1000] bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl border-b border-slate-700/50 dark:border-slate-200/50 px-5 pt-12 pb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 dark:bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                <ManeuverIcon className="w-5 h-5 text-teal-400 dark:text-teal-600" />
              </div>
              <div>
                <p className="text-white dark:text-slate-900 font-semibold text-sm leading-tight">
                  {currentStep.text}
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-xs mt-0.5">{carpark.name}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Arrival overlay ── */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-[1001] bg-slate-900/95 dark:bg-white/95 backdrop-blur-xl flex items-center justify-center px-8"
          >
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-teal-500/20 dark:bg-teal-100 rounded-full flex items-center justify-center mx-auto"
              >
                <NavIcon className="w-10 h-10 text-teal-400 dark:text-teal-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white dark:text-slate-900">You have arrived</h2>
                <p className="text-slate-400 dark:text-slate-600 mt-1">at your destination</p>
                <p className="text-teal-400 dark:text-teal-600 font-medium mt-2">{carpark.name}</p>
              </div>
              <button
                onClick={() => navigate(`/Rate?id=${carpark.id}`, { state: { carpark } })}
                className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-colors"
              >
                Rate This Carpark
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Map ── */}
      <div className="h-full w-full">
        <MapContainer
          center={userPos}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} />
          <MapUpdater center={userPos} />

          {/* Greyed-out completed segment */}
          {completedRoute.length >= 2 && (
            <Polyline
              positions={completedRoute}
              pathOptions={{ color: '#475569', weight: 5, opacity: 0.5 }}
            />
          )}

          {/* Active remaining segment */}
          {remainingRoute.length >= 2 && (
            <Polyline
              positions={remainingRoute}
              pathOptions={{ color: '#2dd4bf', weight: 5, opacity: 1 }}
            />
          )}

          <Marker position={userPos}    icon={userIcon} />
          <Marker position={destination} icon={destIcon} />
        </MapContainer>
      </div>

      {/* ── Floating controls ── */}
      {!arrived && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-2">
          <FloatingBtn icon={Crosshair} onClick={() => {}} />
          <FloatingBtn
            icon={muted ? VolumeX : Volume2}
            onClick={() => setMuted(m => !m)}
          />
          <FloatingBtn
            icon={X}
            onClick={() => navigate(`/Rate?id=${carpark.id}`, { state: { carpark } })}
            className="bg-red-500/20 hover:bg-red-500/30"
          />
        </div>
      )}

      {/* ── Bottom bar: time / distance / ETA ── */}
      {!arrived && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-[1000] bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl border-t border-slate-700/50 dark:border-slate-200/50 px-6 py-5"
        >
          <div className="flex items-center justify-between max-w-lg mx-auto">

            <div className="text-center">
              <p className="text-xl font-bold text-white dark:text-slate-900">{remainingMin} min</p>
              <p className="text-xs text-slate-400 dark:text-slate-600">Time</p>
            </div>

            <div className="h-8 w-px bg-slate-700 dark:bg-slate-200" />

            <div className="text-center">
              <p className="text-xl font-bold text-white dark:text-slate-900">
                {remainingDist >= 1000
                  ? `${(remainingDist / 1000).toFixed(1)} km`
                  : `${Math.round(remainingDist)} m`}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-600">Distance</p>
            </div>

            <div className="h-8 w-px bg-slate-700 dark:bg-slate-200" />

            <div className="text-center">
              <p className="text-xl font-bold text-teal-400 dark:text-teal-600">{etaStr}</p>
              <p className="text-xs text-slate-400 dark:text-slate-600">ETA</p>
            </div>

          </div>
        </motion.div>
      )}

    </div>
  );
}

// ─── Floating button ──────────────────────────────────────────────────────────

function FloatingBtn({ icon: Icon, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-full bg-slate-800/80 dark:bg-white/80 backdrop-blur border border-slate-700/50 dark:border-slate-200/50 flex items-center justify-center hover:bg-slate-700/80 dark:hover:bg-slate-100/80 transition-colors ${className}`}
    >
      <Icon className="w-5 h-5 text-slate-200 dark:text-slate-700" />
    </button>
  );
}