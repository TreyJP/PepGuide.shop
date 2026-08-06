'use client';

import { Search } from 'lucide-react';

export function LibSearch({
  value,
  onChange,
  placeholder = 'Search peptides, aliases, categories…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="lib-search">
      <Search className="size-4" aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search library"
      />
    </div>
  );
}
