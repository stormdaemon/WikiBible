'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">WikiBible</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/bible" className="text-sm font-medium text-secondary hover:text-primary">Bible</Link>
          <Link href="/wiki" className="text-sm font-medium text-secondary hover:text-primary">Wiki</Link>
          <Link href="/auth/login" className="text-sm font-medium text-accent hover:underline">Connexion</Link>
          <Link href="/auth/register" className="text-sm font-medium text-secondary hover:text-primary">Inscription</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-secondary hover:text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Ouvrir le menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-surface">
          <div className="px-6 py-4 space-y-3">
            <Link
              href="/bible"
              className="block text-sm font-medium text-secondary hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Bible
            </Link>
            <Link
              href="/wiki"
              className="block text-sm font-medium text-secondary hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Wiki
            </Link>
            <Link
              href="/auth/login"
              className="block text-sm font-medium text-accent hover:underline py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="block text-sm font-medium text-secondary hover:text-primary py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inscription
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
