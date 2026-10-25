'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const handleClick = (starIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive || !onRatingChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const isHalf = clickX < rect.width / 2;
    const selected = isHalf ? starIndex - 0.5 : starIndex;
    onRatingChange(Math.max(1, selected));
  };

  return (
    <div className="flex items-center gap-0.5 select-none">
      {Array.from({ length: maxStars }, (_, i) => {
        const starNumber = i + 1;
        const isFull = rating >= starNumber;
        const isHalf = rating >= starNumber - 0.5 && rating < starNumber;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={(e) => handleClick(starNumber, e)}
            className={`relative p-0.5 transition-transform ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} text-slate-300 stroke-slate-300 transition-colors`}
              fill="#e2e8f0"
            />

            {(isFull || isHalf) && (
              <div
                className="absolute inset-0.5 overflow-hidden transition-all pointer-events-none"
                style={{ width: isHalf ? '50%' : '100%' }}
              >
                <Star
                  className={`${sizeClasses[size]} text-amber-500 stroke-amber-500`}
                  fill="#f59e0b"
                />
              </div>
            )}
          </button>
        );
      })}
      <span
        className={`ml-1.5 text-xs font-black ${
          rating > 0 ? 'text-amber-600' : 'text-slate-400'
        }`}
      >
        {rating > 0 ? rating.toFixed(1) : '0.0'}
      </span>
    </div>
  );
};
