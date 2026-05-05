// src/app/(pages)/profile/[username]/page.tsx
// Server Component — prefetches public profile data so the page renders
// with content on the first frame, without a loading spinner.
import { createServerSideHelpers } from "@trpc/react-query/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { appRouter } from "@/app/server";
import { createContext } from "@/app/server/context";
import superjson from "superjson";
import { notFound } from "next/navigation";
import { ProfilePageView } from "@/components/profile/profile-page-view";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  // Prefetch the public profile – if it doesn't exist, send the user to 404.
  const profile = await helpers.user.getByUsername
    .fetch({ username })
    .catch(() => null);

  if (!profile?.data) notFound();

  return (
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <ProfilePageView username={username} />
    </HydrationBoundary>
  );
}