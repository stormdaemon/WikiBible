'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

import { logoutAction } from '@/app/actions';
import { ModeratorLink } from '@/components/ModeratorLink';

export default function Header({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = async () => {
    await logoutAction();
    closeMenu();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <nav className="w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - responsive sizing */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-3" onClick={closeMenu}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-accent text-white flex items-center justify-center rounded-md shrink-0">
                <svg width="16" height="16" className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="font-bold text-base sm:text-lg tracking-tight text-primary">
                WikiBible
              </span>
            </Link>
          </div>

          {/* Mobile menu button - visible only on small screens */}
          <button
            onClick={toggleMenu}
            type="button"
            className="lg:hidden p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isOpen ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Desktop/Tablet Navigation - progressive enhancement */}
          <div className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-6">
            <Link href="/bible" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all">
              Bible
            </Link>
            <Link href="/bible-contributive" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all">
              Contributive
            </Link>
            <Link href="/apocrypha" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all">
              Apocryphes
            </Link>
            <Link href="/wiki" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all">
              Wiki
            </Link>
            <Link href="/classement-contributeurs" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all flex items-center gap-1">
              🏆 Classement
            </Link>

            {/* Lien de modération - visible uniquement pour les modérateurs */}
            <ModeratorLink />

            {user ? (
              <div className="flex items-center gap-2 xl:gap-3 ml-2 xl:ml-4 pl-2 xl:pl-4 border-l border-border">
                <Link href="/wiki/new" className="btn btn--primary text-xs xl:text-sm px-3 py-2">
                  + Article
                </Link>
                <Link href="/profil" className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all flex items-center gap-1.5">
                  <svg className="w-4 h-4 xl:w-5 xl:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="hidden xl:inline">Profil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1.5 text-sm xl:text-base text-secondary hover:text-danger font-medium rounded-md hover:bg-red-50 transition-all"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3 ml-2 xl:ml-4 pl-2 xl:pl-4 border-l border-border">
                <Link href="/auth/login" className="px-3 py-1.5 text-sm xl:text-base text-secondary hover:text-accent font-medium rounded-md hover:bg-accent/5 transition-all">
                  Connexion
                </Link>
                <Link href="/auth/register" className="btn btn--primary text-xs xl:text-sm px-3 py-2">
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer - visible on screens < lg */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Mobile Menu Sidebar */}
          <div
            className="fixed inset-y-0 right-0 w-[85%] max-w-[320px] bg-white z-50 lg:hidden shadow-xl animate-scale-in overflow-y-auto"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                  <div className="w-8 h-8 bg-accent text-white flex items-center justify-center rounded-md">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M2 12h20" />
                    </svg>
                  </div>
                  <span className="font-bold text-base text-primary">WikiBible</span>
                </Link>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent-soft transition-all"
                  aria-label="Fermer le menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2 mt-2">Navigation</p>
                <Link href="/bible" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                  <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Bible
                </Link>
                <Link href="/bible-contributive" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                  <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Contributive
                </Link>
                <Link href="/apocrypha" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                  <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Apocryphes
                </Link>
                <Link href="/wiki" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                  <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Wiki
                </Link>
                <Link href="/classement-contributeurs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                  🏆 Classement
                </Link>

                {/* User Section */}
                {user ? (
                  <>
                    <div className="border-t border-border pt-3 mt-3">
                      <p className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2">Mon Compte</p>
                      <Link href="/profil" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-accent-soft transition-all" onClick={closeMenu}>
                        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profil
                      </Link>
                      <Link href="/wiki/new" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-accent-soft transition-all mt-1" onClick={closeMenu}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nouvel Article
                      </Link>
                    </div>
                    <div className="px-3 py-2.5 mt-2 bg-accent-soft rounded-lg">
                      <p className="text-xs text-secondary mb-1">Connecté :</p>
                      <p className="text-sm font-medium text-accent truncate">{user.email}</p>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-border pt-3 mt-3">
                    <p className="text-xs font-semibold text-secondary uppercase tracking-wider px-3 mb-2">Connexion</p>
                    <Link href="/auth/login" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border-2 border-border rounded-lg text-sm font-medium text-primary hover:border-accent hover:text-accent transition-all mb-2" onClick={closeMenu}>
                      Se connecter
                    </Link>
                    <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all" onClick={closeMenu}>
                      Créer un compte
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer - Logout */}
              {user && (
                <div className="border-t border-border p-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-danger font-medium hover:bg-red-50 rounded-lg transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
