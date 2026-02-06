'use client';

import { useState } from 'react';

interface FilterProps {
  filters: { label: string; value: string }[];
  onFilterChange: (selected: string[]) => void;
}

export default function Filter({ filters, onFilterChange }: FilterProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    setSelected(updated);
    onFilterChange(updated);
  };

  return (
    <div className="space-y-2">
      {filters.map(filter => (
        <label key={filter.value} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(filter.value)}
            onChange={() => toggle(filter.value)}
          />
          <span>{filter.label}</span>
        </label>
      ))}
    </div>
  );
}
