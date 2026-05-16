import React from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  showToggle?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
}

export function IconInput({ label, icon: Icon, showToggle, toggled, onToggle, className, ...inputProps }: IconInputProps) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          {...inputProps}
          className={`pl-10 ${showToggle ? 'pr-10' : ''} h-12 bg-slate-900/50 border-slate-700 ${className ?? ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {toggled ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
