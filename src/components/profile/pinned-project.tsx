import { Pin } from "lucide-react";
import { ReactNode } from "react";

type PinnedProjectProps = {
  children: ReactNode;
};

export function PinnedProject({ children }: PinnedProjectProps) {
  return (
    <div className="pt-4 rounded-lg space-y-2">
      <div className="flex justify-between items-center text-sm text-green-500">
        <span className="flex items-center gap-1">
          <Pin size={16} />
          Pinned project
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}
