type ProfileRowProps = {
  gap?: string;
  children: React.ReactNode;
};

export function ProfileRow({ children, gap }: ProfileRowProps) {
  return (
    <div className={`flex items-center ${gap}`}>
      {children}
    </div>
  );
}
