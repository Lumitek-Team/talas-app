// components/search/search-input.tsx
import { Search } from 'lucide-react';

export function SearchInput() {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
      <input
        type="text"
        placeholder="Search" // Placeholder text from the initial screenshot
        className="w-full rounded-2xl border border-neutral-700 bg-background py-3 pl-12 pr-4 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
      />
    </div>
  );
}
