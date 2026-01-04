'use client';

import { useState } from 'react';

interface ApocryphaFilterProps {
  onFilterChange?: (filters: { category: string; search: string }) => void;
}

export function ApocryphaFilter({ onFilterChange }: ApocryphaFilterProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Tous' },
    { value: 'deutero', label: 'Deutérocanoniques' },
    { value: 'apocrypha', label: 'Apocryphes' },
    { value: 'second_temple', label: 'Second Temple' },
    { value: 'dss', label: 'Manuscrits de la Mer Morte' },
  ];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange?.({ category, search: value });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onFilterChange?.({ category: value, search });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un texte apocryphe..."
          className="form__input"
        />
      </div>

      {/* Category Filter */}
      <div>
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="form__input"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
