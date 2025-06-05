"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/ui/page-container";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProfileCard } from "@/components/profile/profile-card";
import { useUser } from "@clerk/nextjs"

export default function ProfilePage() {
  const { username } = useParams() as { username: string };
  const { user } = useUser();
  console.log(user)

  const { data, isLoading, error } = trpc.user.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  if (!data) return <p>User not found</p>;

  return (
    <>
      <Sidebar activeItem="Profile" />
      <PageContainer title="Profile">
        <div className="flex justify-center px-4">
          <ProfileCard user={data} />
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
