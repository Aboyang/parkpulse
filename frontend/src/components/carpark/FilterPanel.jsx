import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PreferenceToggle from './PreferenceToggle';
import RadiusSlider from './RadiusSlider';
import { ShieldOff, Zap } from 'lucide-react';

export default function FilterPanel({ erpFree, onErpChange, evCharging, onEvChange, radius, onRadiusChange, onClose, onApply }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      <div className="w-full bg-slate-900 rounded-t-3xl p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Filters</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          <PreferenceToggle
            label="ERP-Free Route"
            icon={ShieldOff}
            checked={erpFree}
            onCheckedChange={onErpChange}
          />
          <PreferenceToggle
            label="EV Charging Ports"
            icon={Zap}
            checked={evCharging}
            onCheckedChange={onEvChange}
          />
        </div>

        <RadiusSlider value={radius} onChange={onRadiusChange} />

        <Button
          onClick={onApply}
          className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
