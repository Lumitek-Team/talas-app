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
import { Metadata } from "next";
import { getPublicUrl } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  });

  const profile = await helpers.user.getByUsername.fetch({ username }).catch(() => null);

  if (!profile?.data) {
    return {
      title: "Profile Not Found | Talas",
    };
  }

  const name = profile.data.name || profile.data.username;
  const title = `${name} (@${profile.data.username}) | Talas`;
  const description = `View ${name}'s portfolio and projects on Talas.`;
  const image = profile.data.photo_profile ? getPublicUrl(profile.data.photo_profile) : "/img/dummy/profile-photo-dummy.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "profile",
      username: profile.data.username,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [image],
    },
  };
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