// components/search/search-input.tsx
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// FIX: Define props for the component to receive
interface SearchInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search" }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
      <input
        type="text"
        placeholder={placeholder}
        // FIX: Wire up the value and onChange props to the input element
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-neutral-700 bg-background py-3 pl-12 pr-4 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
      />
    </div>
  );
}