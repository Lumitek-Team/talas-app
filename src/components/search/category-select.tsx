// components/search/category-select.tsx
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

export function CategorySelect() {
  // These styles aim to match the FilterButton's appearance
  const selectBaseClasses = "rounded-lg border px-4 py-2 text-sm font-medium transition-colors focus:outline-none cursor-pointer w-full appearance-none";
  const inactiveStateClasses = "bg-neutral-800 text-neutral-200 border-neutral-600 hover:border-neutral-500 focus:border-primary focus:ring-primary";
  // Note: A select element cannot easily have a background color change on hover like a button
  // while maintaining the dropdown arrow. The hover:border-neutral-500 is a subtle effect.

  return (
    <div className="relative w-full">
      <select
        className={cn(selectBaseClasses, inactiveStateClasses)}
        defaultValue=""
      >
        <option value="" disabled className="text-neutral-500 bg-neutral-800">
          Select category
        </option>
        {/* Static options for UI representation */}
        <option value="technology" className="bg-neutral-700 text-neutral-200">Technology</option>
        <option value="art-design" className="bg-neutral-700 text-neutral-200">Art & Design</option>
        <option value="science" className="bg-neutral-700 text-neutral-200">Science</option>
        <option value="healthcare" className="bg-neutral-700 text-neutral-200">Healthcare</option>
        <option value="gaming" className="bg-neutral-700 text-neutral-200">Gaming</option>
        <option value="education" className="bg-neutral-700 text-neutral-200">Education</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-400 pointer-events-none" />
    </div>
  );
}
