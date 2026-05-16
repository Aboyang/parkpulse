import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ONEMAP_SEARCH_URL = 'https://www.onemap.gov.sg/api/common/elastic/search';

// onSelect receives { label, lat, lng } when a suggestion is picked
export default function SearchBar({ value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!value || value.length < 2) { setSuggestions([]); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const url = `${ONEMAP_SEARCH_URL}?searchVal=${encodeURIComponent(value)}&returnGeom=Y&getAddrDetails=N&pageNum=1`;
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions((data?.results || []).slice(0, 6));
        setShowSuggestions(true);
      } catch (_) {
        setSuggestions([]);
      }
    }, 300);
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result) => {
    const label = result.SEARCHVAL || result.ADDRESS || result.BUILDING;
    const lat = parseFloat(result.LATITUDE);
    const lng = parseFloat(result.LONGITUDE);
    onChange(label);
    if (onSelect) onSelect({ label, lat, lng });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 z-10" />
      <Input
        value={value}
        onChange={(e) => { onChange(e.target.value); if (onSelect) onSelect(null); setShowSuggestions(true); }}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder || "Search destination..."}
        className="pl-11 h-12 bg-slate-800/50 dark:bg-white dark:border-slate-200 dark:text-slate-900 dark:placeholder:text-slate-400 border-slate-700 text-white placeholder:text-slate-400 rounded-xl text-base"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 dark:bg-white dark:border-slate-200 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-xl">
          {suggestions.map((r, i) => (
            <button
              key={i}
              onMouseDown={() => handleSelect(r)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 dark:hover:bg-slate-100 dark:border-slate-200 dark:text-slate-900 transition-colors border-b border-slate-700/50 last:border-0"
            >
              <MapPin className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" />
              <span className="text-sm text-white dark:text-slate-900 truncate">
                {r.SEARCHVAL || r.ADDRESS || r.BUILDING}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
