import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (star: number) => void;
  size?: 'lg' | 'md' | 'sm';
}

export default function StarRating({ rating, onRate, size = 'lg' }: StarRatingProps) {
  const sizeClass = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate?.(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`${sizeClass} ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-600'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}