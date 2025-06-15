import { cn } from "@/lib/utils";

interface FilterButtonProps {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function FilterButton({ label, onClick, isActive = false }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "rounded-lg border px-4 py-2 text-sm font-medium", // Base structural and text styles
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black cursor-pointer", // Focus and cursor styles
        "transition-all duration-200 ease-in-out", // General transition for all properties (colors, transform)
        "hover:scale-110 active:scale-90", // Scale animations on hover and active
        isActive
          ? "bg-primary border-primary hover:bg-primary/90" // Active state styles
          : "bg-transparent text-neutral-200 border-neutral-600 hover:border-neutral-400 hover:bg-neutral-700/30", // Inactive state styles
        "focus:ring-card" // Focus ring color from your provided code
      )}
    >
      {label}
    </button>
  );
}
