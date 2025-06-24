import { Pin } from "lucide-react";
import { ReactNode } from "react";

type PinnedProjectProps = {
  children: ReactNode;
  className? : String
};

export function ContainerProject({ children, className }: PinnedProjectProps) {
  return (
    <div className="mt-2 flex flex-col gap-50 h-full">
      <div>{children}</div>
    </div>
  );
}
