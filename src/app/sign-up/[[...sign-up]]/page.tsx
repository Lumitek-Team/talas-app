import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage() {
  const user = await currentUser();

  if (user) {
    redirect("/feeds");
  }

  return <SignUpForm />;
}
