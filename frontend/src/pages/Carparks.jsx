import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, SlidersHorizontal, MapPin, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CarparkCard from '../components/carpark/CarparkCard';
import MiniMap from '../components/carpark/MiniMap';
import FilterPanel from '../components/carpark/FilterPanel';
import { DEFAULT_CENTER } from '@/lib/config';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDistance(meters) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

const SORT_OPTIONS = [
  { key: 'distance',     label: 'Distance'    },
  { key: 'availability', label: 'Availability' },
];

// ─── component ──────────────────────────────────────────────────────────────

export default function Carparks() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Parse URL params ───────────────────────────────────────────────────────
  const query     = searchParams.get('q')  || '';
  const timestamp = searchParams.get('t')  || '';
  const paramLat  = parseFloat(searchParams.get('lat'));
  const paramLng  = parseFloat(searchParams.get('lng'));
  const hasParamCoords = !isNaN(paramLat) && !isNaN(paramLng);

  // ── Local state ───────────────────────────────────────────────────────────
  const [center,       setCenter]       = useState(null);
  const [geocoding,    setGeocoding]    = useState(true);
  const [showFilters,  setShowFilters]  = useState(false);
  const [erpFree,      setErpFree]      = useState(searchParams.get('erp') === 'true');
  const [evCharge,     setEvCharge]     = useState(searchParams.get('ev')  === 'true');
  const [filterRadius, setFilterRadius] = useState(parseInt(searchParams.get('radius')) || 3000);
  const [sortBy,       setSortBy]       = useState('distance');

  // ── Resolve map center ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setCenter(null);
    setGeocoding(true);

    const resolve = () => {
      const coords = hasParamCoords
        ? { lat: paramLat, lng: paramLng }
        : { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] };

      if (!cancelled) {
        setCenter([coords.lat, coords.lng]);
        setGeocoding(false);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [timestamp]);

  // ── Fetch carparks ────────────────────────────────────────────────────────
  const { data: allCarparks = [], isLoading: loadingCarparks } = useQuery({
    queryKey: ['local-carparks', query, timestamp, filterRadius, evCharge],
    queryFn:  async () => {
      try {
        const params = {};
        if (query)        params.address     = query;
        if (filterRadius) params.radius      = filterRadius;
        if (evCharge)     params.ev_charging = true;

        const res      = await axios.get('http://localhost:3000/api/carparks', { params });
        const carparks = res.data.carparks || [];

        return carparks.map((cp) => ({
          id:                   cp.carpark_no,
          name:                 cp.name,
          distance:             cp.distance,
          latitude:             cp.location?.latitude  ?? 0,
          longitude:            cp.location?.longitude ?? 0,
          available_lots:       cp.available_lots,
          total_capacity:       cp.total_capacity,
          operating_hours:      cp.operating_hours,
          free_parking:         cp.free_parking,
          free_parking_details: cp.free_parking_details,
          payment:              cp.payment,
          ev_charging:          cp.ev_charging,
          average_rating:       cp.average_rating,
          total_ratings:        cp.total_ratings,
        }));
      } catch (err) {
        console.error('Error fetching carparks:', err.message);
        return [];
      }
    },
    staleTime: 5  * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!center || !allCarparks.length) return [];

    return allCarparks
      .filter((cp) => {
        if (cp.distanceFromCenter > filterRadius) return false;
        if (erpFree  && cp.erp_zone)    return false;
        if (evCharge && !cp.ev_charging) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'availability') {
          const aRatio = a.total_capacity > 0 ? a.available_lots / a.total_capacity : 0;
          const bRatio = b.total_capacity > 0 ? b.available_lots / b.total_capacity : 0;
          return bRatio - aRatio;
        }
        return a.distance - b.distance;
      })
      .slice(0, 50);
  }, [allCarparks, center, filterRadius, erpFree, evCharge, sortBy]);

  const loading = geocoding || loadingCarparks;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-blue-50 dark:via-slate-50 dark:to-blue-50 text-white dark:text-slate-800">
      <div className="px-5 pt-12 pb-6 max-w-lg mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/Home')}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold">Nearby Carparks</h2>
            {query && (
              <p className="text-xs text-teal-400 flex items-center justify-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {query}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* ── Mini map ── */}
        {center && (
          <MiniMap
            carparks={filtered}
            center={center}
            onMarkerClick={(cp) =>
              navigate(`/Carpark?id=${encodeURIComponent(cp.id)}`, {
                state: { carpark: cp },
              })
            }
          />
        )}

        {/* ── Count + sort row ── */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <p className="text-xs text-slate-400">
            {loading
              ? 'Loading live data…'
              : `${filtered.length} carpark${filtered.length !== 1 ? 's' : ''} within ${formatDistance(filterRadius)}`}
          </p>

          {!loading && (
            <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-0.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                    sortBy === opt.key
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {sortBy === opt.key && <ArrowUpDown className="w-2.5 h-2.5" />}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Carpark list ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-teal-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            <AnimatePresence>
              {filtered.map((cp, i) => (
                <motion.div
                  key={cp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <CarparkCard
                    carpark={cp}
                    distance={formatDistance(cp.distance)}
                    onClick={() =>
                      navigate(`/Carpark?id=${encodeURIComponent(cp.id)}`, {
                        state: { carpark: cp },
                      })
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                <p className="text-lg mb-2">No carparks found</p>
                <p className="text-sm">Try adjusting your filters or search radius</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Filter panel ── */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            erpFree={erpFree}
            onErpChange={setErpFree}
            evCharging={evCharge}
            onEvChange={setEvCharge}
            radius={filterRadius}
            onRadiusChange={setFilterRadius}
            onClose={() => setShowFilters(false)}
            onApply={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}