'use client';

import React, { useState, useRef } from 'react';
import { VerseWithEntities } from './verse-with-entities';
import { EntitySelector } from './entity-selector';
import type { BibleEntity } from '@/app/actions';

interface InteractiveVerseProps {
  verseId: string;
  text: string;
  entities: BibleEntity[];
  onEntityAdded?: (entity: BibleEntity) => void;
}

export function InteractiveVerse({ verseId, text, entities, onEntityAdded }: InteractiveVerseProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [localEntities, setLocalEntities] = useState<BibleEntity[]>(entities);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText && selectedText.length > 0) {
      setSelectedText(selectedText);
      setShowSelector(true);
      setSelectionRange(selection?.getRangeAt(0)?.cloneRange() || null);
    } else {
      setShowSelector(false);
      setSelectedText('');
    }
  };

  const handleEntityCreated = (newEntity: BibleEntity) => {
    setLocalEntities([...localEntities, newEntity]);
    setShowSelector(false);
    setSelectedText('');
    if (onEntityAdded) {
      onEntityAdded(newEntity);
    }
  };

  return (
    <div className="relative">
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="select-auto"
      >
        <VerseWithEntities text={text} entities={localEntities} />
      </div>

      {showSelector && selectedText && (
        <EntitySelector
          selectedText={selectedText}
          verseId={verseId}
          onClose={() => {
            setShowSelector(false);
            setSelectedText('');
          }}
          onEntityCreated={handleEntityCreated}
        />
      )}
    </div>
  );
}
