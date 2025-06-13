// components/search/category-select.tsx
"use client";

import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  categories: { id: string; slug: string; title: string }[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}

export function CategorySelect({ categories, value, onChange, disabled = false }: CategorySelectProps) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-full appearance-none rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors focus:border-primary focus:outline-none focus:ring-primary",
          "hover:border-neutral-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "cursor-pointer" // UI ADJUSTMENT: This class makes the cursor a pointer on hover.
        )}
      >
        <option value="" className="text-neutral-500 bg-neutral-800 cursor-pointer">
          All Categories
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug} className="bg-neutral-700 text-neutral-200 cursor-pointer">
            {category.title}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 cursor-pointer" />
    </div>
  );
}