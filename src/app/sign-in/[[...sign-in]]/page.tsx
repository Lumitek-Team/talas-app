import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function LoginPage() {
  const user = await currentUser();

  if (user) {
    redirect("/feeds");
  }

  return <SignInForm />;
}
