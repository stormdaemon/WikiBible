'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isModeratorAction } from '@/app/actions';

export function ModeratorLink() {
  const [isModerator, setIsModerator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkModerator = async () => {
      const result = await isModeratorAction();
      setIsModerator(result.success && result.isModerator);
      setIsLoading(false);
    };

    checkModerator();
  }, []);

  if (isLoading || !isModerator) {
    return null;
  }

  return (
    <Link
      href="/moderation"
      className="px-2 py-1.5 text-sm xl:text-base text-purple-600 hover:text-purple-700 font-medium rounded-md hover:bg-purple-50 transition-all flex items-center gap-1"
    >
      <svg className="w-4 h-4 xl:w-5 xl:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span className="hidden xl:inline">Modération</span>
    </Link>
  );
}
