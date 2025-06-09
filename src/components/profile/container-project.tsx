import { Pin } from "lucide-react";
import { ReactNode } from "react";

type PinnedProjectProps = {
  children: ReactNode;
};

export function ContainerProject({ children }: PinnedProjectProps) {
  return (
    <div className="rounded-lg space-y-2">
      <div>{children}</div>
    </div>
  );
}
