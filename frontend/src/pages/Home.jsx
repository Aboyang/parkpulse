import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Navigation, Zap, LogOut, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchBar from '../components/carpark/SearchBar';
import PreferenceToggle from '../components/carpark/PreferenceToggle';
import RadiusSlider from '../components/carpark/RadiusSlider';
import { APP_NAME, APP_TAGLINE, DEFAULT_SEARCH_RADIUS_M } from '@/lib/config';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build the search params object that Results.jsx expects. */
function buildResultsParams({ destination, coords, evCharging, radius }) {
  return new URLSearchParams({
    q:      destination.trim(),
    ev:     evCharging,
    radius,
    t:      Date.now(),
    ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
  });
}

// ─── component ──────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [destination,    setDestination]    = useState('');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [evCharging,     setEvCharging]     = useState(false);
  const [radius,         setRadius]         = useState(DEFAULT_SEARCH_RADIUS_M);

  // Auth guard on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) navigate('/Auth');
  }, [navigate]);

  const handleSearch = () => {
    if (!destination.trim()) return;

    const params = buildResultsParams({
      destination,
      coords: selectedCoords,
      evCharging,
      radius,
    });

    navigate(`/Results?${params.toString()}`);
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('token');
    try {
      if (accessToken) {
        const res = await fetch('http://localhost:3000/api/auth/logout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ accessToken }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error('Logout API error:', data.error || 'Unknown error');
        }
        navigate('/Auth');
      }
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('name');
      localStorage.removeItem('userId');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-blue-50 dark:via-slate-50 dark:to-blue-50 text-white dark:text-slate-800">
      <div className="px-5 pt-14 pb-8 max-w-lg mx-auto">

        {/* ── App header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center dark:bg-teal-100">
                <Navigation className="w-5 h-5 text-teal-400 dark:text-teal-600" />
              </div>
              <div>
                <h1 className="text-[hsl(var(--background))] text-xl font-bold tracking-tight dark:text-slate-800">
                  {APP_NAME}
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500">{APP_TAGLINE}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun  className="w-5 h-5 text-slate-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Search form ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2 block">
              Where are you heading?
            </label>
            <SearchBar
              value={destination}
              onChange={(v) => {
                setDestination(v);
                setSelectedCoords(null);
              }}
              onSelect={(coords) => setSelectedCoords(coords)}
              placeholder="Enter destination…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-wider">
              Preferences
            </label>
          </div>

          <div className="space-y-2">
            <PreferenceToggle
              label="EV Charging Ports"
              icon={Zap}
              checked={evCharging}
              onCheckedChange={setEvCharging}
            />
          </div>

          <RadiusSlider value={radius} onChange={setRadius} />

          <Button
            onClick={handleSearch}
            disabled={!destination.trim()}
            className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-base rounded-xl mt-4 shadow-lg shadow-teal-500/25 disabled:opacity-70"
          >
            <Navigation className="w-5 h-5 mr-2" />
            Find Nearby Carparks
          </Button>
        </motion.div>

        {/* ── Footer link ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => navigate('/Saved')}
            className="text-sm text-slate-400 dark:text-slate-500 hover:text-teal-400 dark:hover:text-teal-600 transition-colors underline underline-offset-4"
          >
            View Saved Carparks
          </button>
        </motion.div>

      </div>
    </div>
  );
}