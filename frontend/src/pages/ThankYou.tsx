import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, Home } from 'lucide-react';

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 dark:from-blue-50 dark:to-slate-50 text-white dark:text-slate-800 flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 bg-emerald-500/20 dark:bg-emerald-100 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400 dark:text-emerald-600" />
        </motion.div>

        <div>
          <h1 className="text-2xl font-bold text-white dark:text-slate-900">Thank You!</h1>
          <p className="text-slate-400 dark:text-slate-600 text-sm mt-2">Thank you for your feedback!</p>
        </div>

        <Button
          onClick={() => navigate('/Home')}
          className="w-full h-14 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </Button>
      </motion.div>
    </div>
  );
}
