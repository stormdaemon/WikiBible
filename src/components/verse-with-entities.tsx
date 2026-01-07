'use client';

import React from 'react';
import { BibleTooltip } from './bible-tooltip';
import { parseBibleTextWithEntities } from '@/lib/bible-entity-parser';
import type { BibleEntity } from '@/app/actions';

interface VerseWithEntitiesProps {
  text: string;
  entities: BibleEntity[];
}

export function VerseWithEntities({ text, entities }: VerseWithEntitiesProps) {
  const parsedContent = parseBibleTextWithEntities(text, entities, BibleTooltip);

  return (
    <span className="verse-content">
      {parsedContent}
    </span>
  );
}
