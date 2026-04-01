import React from 'react';
import { Switch } from '@/components/ui/switch';

export default function PreferenceToggle({ label, icon: Icon, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-800/40 dark:bg-blue-100 rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-teal-400 dark:text-teal-600" />}
        <span className="text-sm font-medium text-slate-200 dark:text-slate-700">{label}</span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#2A9D90] dark:data-[state=checked]:bg-teal-500 data-[state=unchecked]:bg-red-500 dark:data-[state=unchecked]:bg-red-400"
      />
    </div>
  );
}
