import { AuthGuard } from "@/components/layout/auth-guard";

export default function EditProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGuard>{children}</AuthGuard>;
}
