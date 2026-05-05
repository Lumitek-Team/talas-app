import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPageClient } from "@/components/landing/landing-page-client";

export default async function LandingPage() {
  const user = await currentUser();

  if (user) {
    redirect("/feeds");
  }

  return <LandingPageClient />;
}
