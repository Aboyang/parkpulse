import { type LucideIcon } from 'lucide-react';

interface FloatingBtnProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function FloatingBtn({ icon: Icon, onClick, className = '' }: FloatingBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-full bg-slate-800/80 dark:bg-white/80 backdrop-blur border border-slate-700/50 dark:border-slate-200/50 flex items-center justify-center hover:bg-slate-700/80 dark:hover:bg-slate-100/80 transition-colors ${className}`}
    >
      <Icon className="w-5 h-5 text-slate-200 dark:text-slate-700" />
    </button>
  );
}
