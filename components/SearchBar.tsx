'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search...' }: { onSearch: (query: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border rounded-lg"
      />
      <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">
        Search
      </button>
    </form>
  );
}
