import React from 'react';
import { Car, Star, Clock, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CarparkCard({ carpark, distance, onClick }) {
  const availabilityPercent = (carpark.available_lots / carpark.total_capacity) * 100;
  const availabilityColor = availabilityPercent > 50 ? 'text-emerald-400' : availabilityPercent > 20 ? 'text-amber-400' : 'text-red-400';

  return (
    <div
      onClick={onClick}
      className="bg-slate-800/60 dark:bg-white dark:border-slate-200 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 space-y-3 active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-white dark:text-slate-900 font-semibold text-base truncate">{carpark.name}</h3>
          <p className="text-slate-400 dark:text-slate-600 text-sm mt-0.5">{distance} away</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-white dark:text-slate-900 text-sm font-medium">{carpark.average_rating === 0 ? 'N/A' : carpark.average_rating?.toFixed(1) || 'N/A'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          <span className={availabilityColor + ' font-semibold'}>
            {carpark.available_lots} / {carpark.total_capacity}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-600" />
          <span className="text-slate-300 dark:text-slate-700 text-xs">{carpark.operating_hours}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {carpark.erp_zone && (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">ERP Zone</Badge>
        )}
        {carpark.ev_charging && (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
            <Zap className="w-3 h-3 mr-1" />EV
          </Badge>
        )}
        {carpark.surveillance_24_7 && (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
            <Shield className="w-3 h-3 mr-1" />24/7
          </Badge>
        )}
      </div>
    </div>
  );
}
