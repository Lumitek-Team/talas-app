import { Pin } from "lucide-react";
import { ReactNode } from "react";

type PinnedProjectProps = {
  children: ReactNode;
};

export function PinnedProject({ children }: PinnedProjectProps) {
  return (
    <div className="pt-4 rounded-lg space-y-2">
      <div>{children}</div>
    </div>
  );
}
