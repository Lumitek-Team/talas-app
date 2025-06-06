"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams() as { username: string };
  const { user, isLoaded } = useUser();

  const userId = user?.id;

  const { data: myUserData } = trpc.user.getById.useQuery(
    { id: userId || "" },
    { enabled: !!userId }
  );

  const { data: profileData } = trpc.user.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  useEffect(() => {
    if (myUserData?.username && username && myUserData.username !== username) {
      router.push("/sign-in");
    }
  }, [myUserData?.username, username, router]);

  if (!isLoaded || !userId) return null;
  if (!myUserData?.username || myUserData.username !== username) return null;

  if (!profileData) return <p>User not found</p>;

  return (
    <>
      <Sidebar activeItem="Profile" />
      <PageContainer title="Profile">
        <div className="flex justify-center px-4">
          <ProfileCard user={profileData} />
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
