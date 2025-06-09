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

  // ✅ Tambahkan ini
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (myUserData?.data?.username && username && myUserData.data.username !== username) {
      router.push("/sign-in");
    }
  }, [myUserData?.data?.username, username, router]);

  if (!isLoaded || !userId) return null;
  if (!myUserData?.data?.username || myUserData.data?.username !== username) return null;
  if (!profileData) return <p>User not found</p>;

  return (
    <>
      <Sidebar activeItem="Profile" />
      <PageContainer title="Profile">
        <div className="flex justify-center px-4">
          <ProfileCard user={profileData.data} isMobile={isMobile} />
          
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
