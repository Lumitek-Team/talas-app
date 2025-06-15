type ProfileRowProps = {
  gap?: string;
  children: React.ReactNode;
};

export function FlexHeader({ children }: ProfileRowProps) {
  return (
    <div className="flex items-start justify-between ">
      {children}
    </div>
  );
}
