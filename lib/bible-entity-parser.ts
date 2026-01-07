import React from 'react';
import type { BibleEntity } from '@/app/actions';

/**
 * Parse un texte biblique et remplace les entités par des composants tooltip
 */
export function parseBibleTextWithEntities(
  text: string,
  entities: BibleEntity[],
  TooltipComponent: React.ComponentType<{ entity: BibleEntity; children: React.ReactNode }>
): React.ReactNode {
  if (!text || entities.length === 0) {
    return text;
  }

  // Trier les entités par longueur de nom décroissante
  // Pour éviter que "Pilate" ne soit matché avant "Ponce Pilate"
  const sortedEntities = [...entities].sort((a, b) => b.name.length - a.name.length);

  // Construire le pattern regex avec toutes les entités
  const patterns = sortedEntities.flatMap(entity => {
    const patterns = [entity.name];
    if (entity.aliases && entity.aliases.length > 0) {
      patterns.push(...entity.aliases);
    }
    return patterns.map(pattern => ({
      entity,
      pattern: pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), // Escape regex
    }));
  });

  if (patterns.length === 0) return text;

  // Créer le regex global
  const regexPattern = patterns
    .map(p => `(${p.pattern})`)
    .join('|');
  const regex = new RegExp(regexPattern, 'gi');

  // Trouver tous les matchs
  const matches = Array.from(text.matchAll(regex));

  if (matches.length === 0) return text;

  // Construire le résultat
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchedText = match[0];
    const matchIndex = match.index!;

    // Ajouter le texte avant le match
    if (matchIndex > lastIndex) {
      result.push(text.slice(lastIndex, matchIndex));
    }

    // Trouver l'entité correspondante
    const matchedPattern = patterns.find(p =>
      matchedText.toLowerCase() === p.pattern.toLowerCase()
    );

    if (matchedPattern) {
      result.push(
        React.createElement(
          TooltipComponent,
          {
            entity: matchedPattern.entity,
            key: `entity-${index}-${matchedPattern.entity.id}`,
            children: matchedText
          }
        )
      );
    } else {
      result.push(matchedText);
    }

    lastIndex = matchIndex + matchedText.length;
  });

  // Ajouter le texte restant
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}
