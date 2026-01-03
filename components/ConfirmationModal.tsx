'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function ConfirmationModal() {
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Vérifier si le paramètre verified est présent
    if (searchParams.get('verified') === 'true') {
      setShowModal(true);

      // Nettoyer l'URL sans recharger la page
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      window.history.replaceState({}, '', url.toString());

      // Compte à rebours
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Fermer automatiquement après 15 secondes
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 15000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [searchParams]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-surface rounded-lg border-2 border-accent shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
        {/* Bouton de fermeture */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Icône Colombe */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-6">
          <svg className="h-12 w-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-serif font-bold text-primary mb-4">
          Gloire à Dieu ! ✝️
        </h2>

        {/* Message */}
        <p className="text-secondary mb-6 leading-relaxed">
          ⏳ Votre email a été confirmé avec succès.
          <br />
          Vous êtes maintenant membre à part entière de notre communauté catholique.
          <br /><br />
          <span className="text-accent font-medium">
            Que la paix du Christ soit avec vous ! 🕊️
          </span>
        </p>

        {/* Bouton */}
        <button
          onClick={() => setShowModal(false)}
          className="btn btn--primary btn--block"
        >
          Amen, entrer 🙏
        </button>

        {/* Compte à rebours visuel */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex-1 h-2 bg-secondary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 15) * 100}%` }}
            />
          </div>
          <span className="text-xs text-secondary font-medium min-w-[60px]">
            {countdown}s
          </span>
        </div>
      </div>
    </div>
  );
}
