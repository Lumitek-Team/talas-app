
import { ReactNode } from "react";

type PinnedProjectProps = {
  children: ReactNode;
};

export function ContainerProject({ children }: PinnedProjectProps) {
  return (
    <div className="mt-2 flex flex-col gap-50 h-full">
      <div>{children}</div>
    </div>
  );
}
