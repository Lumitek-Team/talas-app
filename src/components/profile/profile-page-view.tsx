"use client";

import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { STALE } from "@/lib/query-config";

interface ProfilePageViewProps {
  username: string;
}

export function ProfilePageView({ username }: ProfilePageViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? "";

  // Current viewer's data (protected – only fetched when signed in)
  const { data: myUserData, isLoading: isMyUserLoading } = trpc.user.getById.useQuery(
    { id: userId },
    { enabled: !!userId, staleTime: STALE.LONG },
  );

  // Profile data (public – already hydrated from the server)
  const { data: profileData, isLoading: isProfileLoading } = trpc.user.getByUsername.useQuery(
    { username },
    { staleTime: STALE.LONG },
  );

  const profileId = profileData?.data?.id;

  const { data: projectsData, isLoading: isProjectsLoading } = trpc.user.getAllProjects.useQuery(
    { id_user: profileId, limit: 100 },
    { enabled: !!profileId, staleTime: STALE.MEDIUM },
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wait for Clerk and profile data
  const isLoading = !isLoaded || isProfileLoading || (!!userId && isMyUserLoading);
  const isProjectsLoading_ = isProjectsLoading;

  if (isLoading) {
    return (
      <>
        <Sidebar activeItem="" />
        <PageContainer title="Profile">
          <ProfileSkeleton />
        </PageContainer>
        <FloatingActionButton />
      </>
    );
  }

  if (!profileData?.data) {
    return (
      <>
        <Sidebar activeItem="" />
        <PageContainer title="Profile Not Found">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Profile not found</p>
          </div>
        </PageContainer>
        <FloatingActionButton />
      </>
    );
  }

  const isMyProfile = myUserData?.data?.username === profileData.data.username;

  return (
    <>
      <Sidebar activeItem={isMyProfile ? "Profile" : ""} />
      <PageContainer title={isMyProfile ? "Profile" : "@" + profileData.data.username}>
        <div className="flex justify-center">
          <ProfileCard
            user={profileData.data}
            isMobile={isMobile}
            projects={isProjectsLoading_ ? [] : (projectsData?.data || [])}
            currentUserId={myUserData?.data?.id ?? ""}
            isMyProfile={isMyProfile}
          />
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
