'use client';

import { useEffect } from 'react';

/**
 * Composant qui gère le scroll automatique vers l'ancre de verset
 * en centrant l'élément dans la vue
 */
export function VerseAnchorScroll() {
  useEffect(() => {
    // Fonction pour scroller vers l'ancre en centrant l'élément
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const verseId = hash.substring(1); // Enlever le #
      const element = document.getElementById(verseId);

      if (element) {
        // Attendre que le rendu soit terminé
        setTimeout(() => {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

          window.scrollTo({
            top: middle,
            behavior: 'smooth'
          });

          // Ajouter un effet visuel temporaire
          element.classList.add('ring-4', 'ring-accent', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-accent', 'ring-opacity-50');
          }, 2000);
        }, 300);
      }
    };

    // Scroll au chargement initial
    scrollToHash();

    // Écouter les changements de hash
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

  return null;
}
