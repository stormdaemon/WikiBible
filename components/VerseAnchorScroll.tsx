'use client';

import { useEffect } from 'react';

/**
 * Composant qui gère le scroll automatique vers l'ancre de verset
 * en centrant l'élément dans la vue.
 * Gère le cas où les versets sont chargés de manière asynchrone.
 */
export function VerseAnchorScroll() {
  useEffect(() => {
    // Fonction pour scroller vers un élément et l'animer
    const scrollToElement = (element: HTMLElement) => {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

      window.scrollTo({
        top: Math.max(middle, 0),
        behavior: 'smooth'
      });

      // Ajouter un effet visuel temporaire
      element.classList.add('ring-4', 'ring-accent', 'ring-opacity-50');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-accent', 'ring-opacity-50');
      }, 2000);
    };

    // Fonction pour scroller vers l'ancre en centrant l'élément
    const scrollToHash = (event?: Event) => {
      const verseIdFromEvent = event instanceof CustomEvent ? event.detail?.verseId : undefined;
      const hash = window.location.hash;
      if (!hash && !verseIdFromEvent) return;

      const verseId = verseIdFromEvent || hash.substring(1); // Enlever le #
      const element = document.getElementById(verseId);

      if (element) {
        // Élément trouvé immédiatement, attendre un peu pour le rendu
        setTimeout(() => scrollToElement(element), 300);
      } else {
        // Élément pas encore rendu (chargement async), utiliser un polling
        let attempts = 0;
        const maxAttempts = 20; // 20 tentatives max
        const interval = 200; // 200ms entre chaque tentative

        const pollForElement = setInterval(() => {
          attempts++;
          const el = document.getElementById(verseId);

          if (el) {
            clearInterval(pollForElement);
            // Petit délai supplémentaire pour s'assurer que le layout est stable
            setTimeout(() => scrollToElement(el), 100);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollForElement);
            console.warn(`[VerseAnchorScroll] Élément #${verseId} non trouvé après ${maxAttempts} tentatives`);
          }
        }, interval);
      }
    };

    // Scroll au chargement initial
    scrollToHash();

    // Écouter les changements de hash
    window.addEventListener('hashchange', scrollToHash);
    window.addEventListener('wikibible:verse-anchor-scroll', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      window.removeEventListener('wikibible:verse-anchor-scroll', scrollToHash);
    };
  }, []);

  return null;
}
