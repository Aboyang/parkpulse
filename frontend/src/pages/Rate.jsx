import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { db } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import StarRating from '../components/carpark/StarRating';

export default function Rate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: carparks = [] } = useQuery({
    queryKey: ['carpark-rate', id],
    queryFn: () => db.entities.Carpark.filter({ id }),
  });

  const carpark = location.state?.carpark || carparks[0];

  const submitMutation = useMutation({
    mutationFn: async () => {
      await db.entities.CarparkRating.create({
        carpark_id: id,
        rating,
        comment: comment || undefined,
      });
      // Update carpark average rating
      const newTotal = (carpark?.total_ratings || 0) + 1;
      const newAvg = (((carpark?.average_rating || 0) * (carpark?.total_ratings || 0)) + rating) / newTotal;
      await db.entities.Carpark.update(id, {
        id,
        name: carpark?.name || 'Selected Carpark',
        latitude: carpark?.latitude,
        longitude: carpark?.longitude,
        average_rating: Math.round(newAvg * 10) / 10,
        total_ratings: newTotal,
      });
    },
    onSuccess: () => navigate(`/SavePrompt?id=${id}`, { state: { carpark } }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 dark:from-blue-50 dark:to-slate-50 text-white dark:text-slate-800 flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 bg-amber-500/20 dark:bg-amber-100 rounded-2xl flex items-center justify-center mx-auto"
          >
            <MessageSquare className="w-8 h-8 text-amber-400 dark:text-amber-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white dark:text-slate-900">Rate Your Experience</h1>
          <p className="text-slate-400 dark:text-slate-600 text-sm">{carpark?.name || 'Carpark'}</p>
        </div>

        <div className="flex justify-center">
          <StarRating rating={rating} onRate={setRating} />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
            Comments (Optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={rating === 0 || submitMutation.isPending}
            className="w-full h-14 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
          <button
            onClick={() => navigate(`/SavePrompt?id=${id}`, { state: { carpark } })}
            className="w-full text-center text-sm text-slate-400 dark:text-slate-600 hover:text-slate-300 dark:hover:text-slate-500 py-2"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
}
