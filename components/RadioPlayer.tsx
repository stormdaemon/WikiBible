'use client';

import { useState, useRef, useEffect } from 'react';

export function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Info Radio */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-md overflow-hidden">
              <img
                src="https://heavenradio.fr/assets/png/HR_LOGO-h3iEjxvO.png"
                alt="Heaven Radio"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Heaven Radio</p>
              <p className="text-xs text-slate-600">100% Louange et Adoration</p>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setVolume(Math.max(0, volume - 0.1))}
                className="p-1.5 hover:bg-amber-200 rounded-md transition-colors"
                aria-label="Baisser le volume"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-700"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-700"
                aria-label="Volume"
              />
              <button
                onClick={() => setVolume(Math.min(1, volume + 0.1))}
                className="p-1.5 hover:bg-amber-200 rounded-md transition-colors"
                aria-label="Augmenter le volume"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-700"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </button>
            </div>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <span className="hidden sm:inline">Pause</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span className="hidden sm:inline">Écouter</span>
                </>
              )}
            </button>
          </div>

          {/* Audio element */}
          <audio
            ref={audioRef}
            src="https://listen.radioking.com/radio/666997/stream/730963"
            onEnded={() => setIsPlaying(false)}
            onError={() => setIsPlaying(false)}
          />
        </div>
      </div>
    </div>
  );
}
