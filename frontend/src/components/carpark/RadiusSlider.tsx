import React from 'react';
import { Slider } from '@/components/ui/slider';
import { MapPin } from 'lucide-react';

export default function RadiusSlider({ value, onChange }) {
  const displayValue = value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${value} m`;

  return (
    <div className="bg-slate-800/40 dark:bg-blue-100 rounded-xl px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-teal-400 dark:text-teal-600" />
          <span className="text-sm font-medium text-slate-200 dark:text-slate-700">Search Radius</span>
        </div>
        <span className="text-sm font-semibold text-teal-400 dark:text-teal-600">{displayValue}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={200}
        max={3000}
        step={100}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-600">
        <span>200m</span>
        <span>3km</span>
      </div>
    </div>
  );
}
