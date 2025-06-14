"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { LoadingSpinner } from "@/components/ui/loading";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [isMobile, setIsMobile] = useState(false);

  const rawParams = useParams();
  const username = typeof rawParams?.username === "string" ? rawParams.username : undefined;

  const { user, isLoaded } = useUser();
  const userId = user?.id ?? "";

  const { data: myUserData, isLoading: isMyUserLoading } = trpc.user.getById.useQuery(
    { id: userId },
    { enabled: !!userId }
  );

  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError, error: profileError } = trpc.user.getByUsername.useQuery(
    { username: username! },
    { enabled: !!username }
  );

  const profileId = profileData?.data?.id;

  const { data: projectsData, isLoading: isProjectsLoading } = trpc.user.getAllProjects.useQuery(
    {
      id_user: profileId,
      limit: 100,
    },
    { enabled: !!profileId }
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isReady = isLoaded && !isMyUserLoading && !!profileData?.data;
  const isMyProfile = myUserData?.data?.username === profileData?.data?.username;

  // Always render the layout structure
  return (
    <>
      <Sidebar activeItem={isMyProfile ? "Profile" : ""} />
      <PageContainer title={isMyProfile ? "Profile" : profileData?.data ? "@" + profileData.data.username : "Profile"}>
        <div className="flex justify-center px-4">
          
          {/* Show loading when user is not loaded or profile data is loading */}
          {(!isLoaded || isMyUserLoading || isProfileLoading || (isLoaded && !profileData?.data && !isProfileError)) && (
            <LoadingSpinner />
          )}
          
          {/* Show error state when profile loading fails */}
          {isLoaded && !isMyUserLoading && isProfileError && (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-500 mb-2">Profile Not Found</h3>
                <p className="text-muted-foreground">
                  {profileError?.message || `User "${username}" not found.`}
                </p>
              </div>
            </div>
          )}
          
          {/* Show sign-in prompt when user is loaded but not authenticated */}
          {isLoaded && !user && !isProfileLoading && !isProfileError && (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground">Please sign in to view profiles.</p>
              </div>
            </div>
          )}
          
          {/* Show profile content when everything is loaded successfully */}
          {isReady && (
            <ProfileCard
              user={profileData.data}
              isMobile={isMobile}
              projects={projectsData?.data || []}
              currentUserId={myUserData?.data?.id ?? ""} 
              isMyProfile={isMyProfile}
            />
          )}
          
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
