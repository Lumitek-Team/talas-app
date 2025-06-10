"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  const rawParams = useParams();
  const username = typeof rawParams?.username === "string" ? rawParams.username : undefined;

  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const { data: myUserData, isLoading: isMyUserLoading } = trpc.user.getById.useQuery(
    { id: userId || "" },
    { enabled: !!userId }
  );

  const correctUsername = myUserData?.data?.username;

  const isUsernameReady = isLoaded && userId && !isMyUserLoading && !!correctUsername;
  const isUsernameMatch = correctUsername === username;

  // 🔁 Redirect jika username di URL tidak sesuai dengan username yang valid
  useEffect(() => {
    if (isUsernameReady && username && !isUsernameMatch) {
      router.replace(`/profile/${correctUsername}`);
    }
  }, [isUsernameReady, isUsernameMatch, correctUsername, username, router]);

  const { data: profileData } = trpc.user.getByUsername.useQuery(
    { username: username! },
    { enabled: !!isUsernameReady && !!isUsernameMatch }
  );

  const { data: projectsData } = trpc.user.getAllProjects.useQuery(
    {
      id_user: userId!,
      limit: 100,
      excludePinned: true,
    },
    { enabled: !!isUsernameReady && !!isUsernameMatch }
  );

  // 📱 Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🧹 Jangan render sampai username valid dan cocok
  if (!isUsernameReady || !isUsernameMatch) return null;

  if (!profileData?.data) return <p className="text-center mt-10">User not found</p>;

  return (
    <>
      <Sidebar activeItem="Profile" />
      <PageContainer title="Profile">
        <div className="flex justify-center px-4">
          <ProfileCard
            user={profileData.data}
            isMobile={isMobile}
            projects={projectsData?.data || []}
            userId={userId!}
          />
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
