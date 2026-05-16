import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatBlockProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function StatBlock({ icon: Icon, label, children, className }: StatBlockProps) {
  return (
    <div className="bg-slate-700/30 dark:bg-slate-200/30 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
        <span className="text-xs text-slate-400 dark:text-slate-600">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${className}`}>{children}</p>
    </div>
  );
}
