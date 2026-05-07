import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPageClient } from "@/components/landing/landing-page-client";

export default async function LandingPage() {
  const user = await currentUser();

  // Authenticated users skip the landing page and go straight to feeds.
  // Guests see the landing page and can click "Explore Talas" to browse feeds freely.
  if (user) {
    redirect("/feeds");
  }

  return <LandingPageClient />;
}
