import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Trash2, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSavedCarparks, useDeleteSavedCarpark } from '@/hooks/use-favorites';
import { useCarparkAvailabilities } from '@/hooks/use-carpark-availability';
import { useCarparkRatings } from '@/hooks/use-rating';

export default function Saved() {
  const navigate = useNavigate();
  const userId   = localStorage.getItem('userId');

  const savedQuery = useSavedCarparks(userId);
  const saved      = savedQuery.data ?? [];

  const savedIds            = saved.map((c) => c.carparkId);
  const availabilitiesQuery = useCarparkAvailabilities(savedIds);
  const ratingsQuery        = useCarparkRatings(savedIds);

  const availabilities = availabilitiesQuery.data ?? {};
  const ratings        = ratingsQuery.data        ?? {};

  const deleteMutation = useDeleteSavedCarpark();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="px-5 pt-12 pb-8 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/Home')} className="p-2 -ml-2 rounded-xl hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold">Saved Carparks</h1>
        </div>

        {savedQuery.isLoading ? (
          <LoadingSpinner />
        ) : saved.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400">No saved carparks yet</p>
            <Button
              onClick={() => navigate('/Home')}
              variant="outline"
              className="border-slate-700 text-slate-300"
            >
              Find Carparks
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {saved.map((item, i) => (
                <motion.div
                  key={item.carparkId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                      <Bookmark className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.carparkName}</p>
                      <p className="text-slate-500 text-xs">
                        {availabilitiesQuery.isLoading
                          ? 'Loading lots...'
                          : `Available Lots: ${availabilities[item.carparkId]}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() =>
                        navigate(`/Carpark?id=${item.carparkId}`, {
                          state: {
                            carpark: {
                              id:              item.carparkId,
                              name:            item.carparkName,
                              latitude:        item.latitude,
                              longitude:       item.longitude,
                              operating_hours: item.operating_hours,
                              available_lots:  availabilities[item.carparkId] ?? 'No data',
                              average_rating:  ratings[item.carparkId]?.averageRating,
                              total_ratings:   ratings[item.carparkId]?.totalRatings,
                            },
                          },
                        })
                      }
                      className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <Navigation className="w-4 h-4 text-teal-400" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate({ userId, carparkId: item.carparkId })}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
