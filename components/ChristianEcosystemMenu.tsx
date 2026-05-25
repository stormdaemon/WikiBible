"use client";

import { useState } from "react";

const ECOSYSTEM_LINKS = [
  {
    id: "irenee",
    label: "Institut Irénée",
    shortLabel: "Irénée",
    initials: "IR",
    href: "https://irenee-institut.org/",
  },
  {
    id: "heavenradio",
    label: "Heaven Radio",
    shortLabel: "Heaven Radio",
    initials: "HR",
    href: "https://heavenradio.fr/",
  },
  {
    id: "mission",
    label: "La Mission Catholique",
    shortLabel: "La Mission",
    initials: "LM",
    href: "https://www.lamissioncatholique.fr/",
  },
  {
    id: "ultreia",
    label: "Ultreia Event",
    shortLabel: "Ultreia",
    initials: "UE",
    href: "https://ultreiaevent.com/",
  },
  {
    id: "sos",
    label: "SOS Chrétiens d'Occident",
    shortLabel: "SOS Chrétiens",
    initials: "SOS",
    href: "https://soschretiensdoccident.fr/",
  },
  {
    id: "bapteme",
    label: "Le Baptême Catholique",
    shortLabel: "Baptême",
    initials: "BC",
    href: "https://lebaptemecatholique.fr/",
  },
] as const;

export function ChristianEcosystemMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="fixed bottom-4 left-3 z-[45] sm:bottom-auto sm:left-4 sm:top-[calc(50%+2rem)] sm:-translate-y-1/2">
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 items-center gap-2 rounded-md border border-border bg-background/95 px-3 text-xs font-black uppercase tracking-[0.14em] text-primary shadow-2xl shadow-black/35 backdrop-blur sm:hidden"
          aria-expanded={isOpen}
          aria-controls="christian-ecosystem-menu"
        >
          Sites amis
          <span aria-hidden="true" className="text-base leading-none text-accent">
            {isOpen ? "-" : "+"}
          </span>
        </button>

        <nav
          id="christian-ecosystem-menu"
          className={`${isOpen ? "flex" : "hidden"} max-w-[calc(100vw-1.5rem)] flex-col gap-2 sm:flex`}
          aria-label="Sites amis de l'écosystème chrétien"
        >
          {ECOSYSTEM_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-12 items-center rounded-r-md border border-border/70 bg-background/95 pr-3 text-primary shadow-2xl shadow-black/30 backdrop-blur transition duration-200 hover:translate-x-1 hover:border-accent hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Ouvrir ${link.label}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-accent bg-[linear-gradient(145deg,#fff3d6,#d9ad5b_54%,#7c1418)] text-[0.68rem] font-black text-background shadow-inner">
                {link.initials}
              </span>
              <span className="ml-2 max-w-[8.5rem] text-[0.72rem] font-black uppercase leading-tight tracking-[0.03em] text-primary">
                {link.shortLabel}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
