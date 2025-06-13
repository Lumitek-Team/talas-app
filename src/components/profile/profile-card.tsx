import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileButtonEdit } from "./profile-button-edit";
import { FlexHeader } from "./flex-header";
import { PhotoProfileUser } from "./profile-photo-user";
import { ContainerProject } from "@/components/profile/container-project";
import { PinnedProject } from "@/components/profile/pinned-project";
import { CardProjectProfile } from "./card-project-profile";
import { trpc } from "@/app/_trpc/client";
import { ProfileFollow } from "./follow-button";
import { useState, useEffect } from "react"

interface UserCountSummary {
  count_project: number;
  count_follower: number;
  count_following: number;
}

interface User {
  id: string;
  username: string;
  name: string;
  bio?: string | null;
  photo_profile?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  gender?: string | null;
  email_contact?: string | null;
  count_summary: UserCountSummary | null;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  content: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image5?: string;
  created_at: string;
}

interface ProfileCardProps {
  user: User;
  currentUserId: string;
  isMobile?: boolean;
  projects: Project[];
  isMyProfile: boolean;
}

export function ProfileCard({
  user,
  currentUserId,
  isMobile = false,
  projects,
  isMyProfile,
}: ProfileCardProps) {
  const pinnedUserId = isMyProfile ? currentUserId : user.id;

  const { data: pinnedData, refetch, isLoading } = trpc.user.getPinnedProjects.useQuery(
    { id_user: pinnedUserId },
    {
      refetchOnWindowFocus: false,
      enabled: !!pinnedUserId,
    }
  );

  const { data: followingData, isLoading: isFollowingLoading } =
  trpc.user.getAllFollowing.useQuery(
    { id_follower: currentUserId }, 
    {
      enabled: !isMyProfile && !!currentUserId, 
    }
  );
  const pinnedProjects: { id: string }[] = pinnedData?.data ?? [];
  const pinnedIds = new Set(pinnedProjects.map((p) => p.id));

  const pinned = projects.filter((p) => pinnedIds.has(p.id));
  const notPinned = projects.filter((p) => !pinnedIds.has(p.id));

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isMyProfile && followingData?.data) {
      const found = followingData.data.some((u) => u.username === user.username);
      setIsFollowing(found);
    }
  }, [followingData, user.username, isMyProfile]);

  return (
    <div
      className={`w-full rounded-2xl space-y-4 text-white ${
        isMobile ? "bg-background p-2" : "bg-card border p-7 border-white/10"
      }`}
    >
      <FlexHeader>
        <ProfileHeader
          name={user.name}
          username={user.username}
          bio={user.bio || ""}
          gender={user.gender}
        />
        <PhotoProfileUser photoUrl={user.photo_profile || undefined} />
      </FlexHeader>

      <ProfileStats
        summary={
          user.count_summary ?? {
            count_project: 0,
            count_follower: 0,
            count_following: 0,
          }
        }
        instagram={user.instagram}
        linkedin={user.linkedin}
        github={user.github}
        userId={user.id}
      />

      {/* Tombol Edit atau Follow */}
      {isMyProfile ? (
        <ProfileButtonEdit username={user.username} />
      ) : typeof isFollowing === "boolean" ? (
        <ProfileFollow
          key={user.id}
          username={user.username}
          idCurrentUser={currentUserId}
          idTargetUser={user.id}
        />
      ) : (
        <div className="text-sm text-muted-foreground text-center mt-6 mb-6">
          Checking follow status...
        </div>
      )}

      {/* Projek */}
      <ContainerProject>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <PinnedProject>
                {pinned.map((project) => (
                  <CardProjectProfile
                    key={project.id}
                    project={project}
                    userId={currentUserId}
                    isPinned
                    onMutateSuccess={() => refetch()}
                    isMyProfile={isMyProfile}
                  />
                ))}
              </PinnedProject>
            )}
            {notPinned.map((project) => (
              <CardProjectProfile
                key={project.id}
                project={project}
                userId={currentUserId}
                onMutateSuccess={() => refetch()}
                isMyProfile={isMyProfile}
              />
            ))}
          </>
        )}
      </ContainerProject>
    </div>
  );
}
