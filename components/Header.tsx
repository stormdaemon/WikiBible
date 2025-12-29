'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

export default function Header({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight text-primary">WikiBible</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/bible" className="text-secondary hover:text-primary font-medium">Bible</Link>
            <Link href="/wiki" className="text-secondary hover:text-primary font-medium">Wiki</Link>

            {user ? (
              <Link href="/wiki/new" className="btn btn--primary text-sm px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
                + Nouvel Article
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-secondary hover:text-primary font-medium">Connexion</Link>
                <Link href="/auth/register" className="btn btn--primary text-sm px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">Inscription</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-primary hover:bg-slate-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {/* Icon map (menu) / X (close) */}
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-white" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/bible" className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Bible
            </Link>
            <Link href="/wiki" className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-slate-50" onClick={() => setIsOpen(false)}>
              Wiki
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-border">
            {user ? (
              <div className="px-2">
                <Link href="/wiki/new" className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                  + Nouvel Article
                </Link>
                <div className="mt-3 px-2 text-center text-sm text-secondary">
                  Connecté en tant que {user.email}
                </div>
              </div>
            ) : (
              <div className="px-2 space-y-3">
                <Link href="/auth/login" className="block w-full text-center px-4 py-2 border border-slate-300 text-base font-medium rounded-md text-secondary bg-white hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Connexion
                </Link>
                <Link href="/auth/register" className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90" onClick={() => setIsOpen(false)}>
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
