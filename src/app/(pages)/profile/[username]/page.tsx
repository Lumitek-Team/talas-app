"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
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

  const { data: profileData } = trpc.user.getByUsername.useQuery(
    { username: username! },
    { enabled: !!username }
  );

  const profileId = profileData?.data?.id;

  const { data: projectsData } = trpc.user.getAllProjects.useQuery(
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

  if (!isReady) return null;

  // Cek apakah user login?
  const isMyProfile = myUserData?.data?.username === profileData?.data?.username;

  return (
    <>
      <Sidebar activeItem={isMyProfile ? "Profile" : ""} />
      <PageContainer title={isMyProfile ? "Profile" : "@" + profileData.data.username}>
        <div className="flex justify-center">
          <ProfileCard
            user={profileData.data}
            isMobile={isMobile}
            projects={projectsData?.data || []}
            currentUserId={myUserData?.data?.id ?? ""} 
            isMyProfile={isMyProfile}
            
          />
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
