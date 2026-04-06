import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import StarRating from '../components/carpark/StarRating';

export default function Rate() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const carparkId = params.get('id');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [carpark, setCarpark] = useState(location.state?.carpark || null);

  const userId = localStorage.getItem('userId'); // <-- get user ID from local storage

  // Fetch current carpark info + rating from backend
  const { data: carparkData, isLoading } = useQuery({
    queryKey: ['carpark-rate', carparkId],
    queryFn: async () => {
      const res = await axios.get(`/api/rating/${carparkId}`);
      return res.data.data;
    },
    enabled: !!carparkId, // optional: only fetch if carparkId exists
    onSuccess: (data) => {
      setCarpark((prev) => ({ ...prev, ...data }));
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not logged in');
      await axios.post('http://localhost:3000/api/rating', {
        carparkId,
        userId,
        rating,
        comment: comment || '',
      });
    },
    onSuccess: () => {
      navigate(`/SavePrompt?id=${carparkId}`, { state: { carpark } });
    },
  });

  if (!carpark) return <p>Loading carpark data...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 dark:from-blue-50 dark:to-slate-50 text-white dark:text-slate-800 flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
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
          <p className="text-slate-400 dark:text-slate-600 text-sm">{carpark.name || 'Carpark'}</p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center">
          <StarRating rating={rating} onRate={setRating} />
        </div>

        {/* Comment */}
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

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={rating === 0 || submitMutation.isLoading}
            className="w-full h-14 bg-teal-500 hover:bg-teal-600 disabled:opacity-40 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25"
          >
            {submitMutation.isLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
          <button
            onClick={() => navigate(`/SavePrompt?id=${carparkId}`, { state: { carpark } })}
            className="w-full text-center text-sm text-slate-400 dark:text-slate-600 hover:text-slate-300 dark:hover:text-slate-500 py-2"
          >
            Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
}