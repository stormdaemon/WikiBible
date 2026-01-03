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
    <div className="apocrypha-filter apocrypha-filter--flex flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="apocrypha-filter__search apocrypha-filter__search--flex-1 flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un texte apocryphe..."
          className="apocrypha-filter__input apocrypha-filter__input--w-full w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Category Filter */}
      <div className="apocrypha-filter__category">
        <select
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="apocrypha-filter__select apocrypha-filter__select--px-4 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white"
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
