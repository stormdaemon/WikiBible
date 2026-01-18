'use client';

import { useState } from 'react';
import { ContributeVerseModal } from '@/components/ContributeVerseModal';

interface ContributionButtonProps {
  verseId: string;
  bookName: string;
  chapter: number;
  verse: number;
  translation: string;
  isAuthenticated: boolean;
  isMissing?: boolean;
  mode?: 'replace' | 'add';
  bookId?: string;
  onSuccess?: () => void;
}

export function ContributionButton({
  verseId,
  bookName,
  chapter,
  verse,
  translation,
  isAuthenticated,
  isMissing = false,
  mode = 'add',
  bookId,
  onSuccess,
}: ContributionButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <a
        href="/auth/login"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Contribuer
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg transition-colors text-sm font-medium ${
          isMissing
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-accent hover:bg-accent/90'
        }`}
      >
        {isMissing ? (
          <>✏️ Remplir</>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Contribuer
          </>
        )}
      </button>

      {showModal && (
        <ContributeVerseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          verseId={verseId}
          bookName={bookName}
          chapter={chapter}
          verse={verse}
          translation={translation}
          bookId={bookId}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
