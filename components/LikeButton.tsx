'use client';

import { useActionState, useEffect, useState } from 'react';
import { toggleLikeAction } from '@/app/actions';

interface LikeButtonProps {
  contributionType: 'link' | 'annotation' | 'external_source' | 'wiki_article';
  contributionId: string;
  initialLiked: boolean;
  initialCount: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-1 text-xs gap-1',
  md: 'px-3 py-1.5 text-sm gap-1.5',
  lg: 'px-4 py-2 text-base gap-2',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 20,
};

export function LikeButton({
  contributionType,
  contributionId,
  initialLiked,
  initialCount,
  showCount = true,
  size = 'md',
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animate, setAnimate] = useState(false);
  const [state, formAction, pending] = useActionState(
    toggleLikeAction,
    { liked: initialLiked, new_count: initialCount }
  );

  // Update state when server action completes
  useEffect(() => {
    if (state?.success && state.liked !== undefined) {
      setIsLiked(state.liked);
      if (state.new_count !== undefined) {
        setCount(state.new_count);
      }
    }
  }, [state]);

  const handleClick = () => {
    setAnimate(true);
    // Reset animation after it completes
    setTimeout(() => setAnimate(false), 500);
  };

  const iconSize = iconSizes[size];

  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="contribution_type" value={contributionType} />
      <input type="hidden" name="contribution_id" value={contributionId} />

      <button
        type="submit"
        onClick={handleClick}
        disabled={pending}
        className={`
          inline-flex items-center justify-center
          ${sizeClasses[size]}
          rounded-lg font-medium transition-all
          hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${isLiked
            ? 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
          }
          ${animate && isLiked ? 'animate-pulse' : ''}
        `}
        title={isLiked ? "Je n'aime plus" : "J'aime"}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 2}
          className={animate && isLiked ? 'animate-bounce' : ''}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {showCount && (
          <span className="font-semibold">
            {pending ? '...' : count}
          </span>
        )}
      </button>
    </form>
  );
}
