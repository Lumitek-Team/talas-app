import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileButtonEdit } from "./profile-button-edit";
import { FlexHeader } from "./flex-header";
import { PhotoProfileUser } from "./profile-photo-user";
import { ContainerProject } from "@/components/profile/container-project";
import { PinnedProject } from "@/components/profile/pinned-project";
import { CardProjectProfile } from "./card-project-profile";
import { trpc } from "@/app/_trpc/client"; // pastikan ini benar

interface UserCountSummary {
  count_project: number;
  count_follower: number;
  count_following: number;
}

interface User {
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
  userId: string;
  isMobile?: boolean;
  projects: Project[];
}

export function ProfileCard({ user, userId, isMobile = false, projects }: ProfileCardProps) {
  const {
    data,
    refetch,
  } = trpc.user.getPinnedProjects.useQuery({ id_user: userId }, { refetchOnWindowFocus: false });

  // Data pinned yang didapat dari backend
  const pinnedProjects: { id: string }[] = data?.data ?? [];

  // Buat set berisi ID dari proyek yang dipinned
  const pinnedIds = new Set(pinnedProjects.map((p) => p.id));

  // Filter proyek yang dipinned dan tidak
  const pinned = projects.filter((p) => pinnedIds.has(p.id));
  const notPinned = projects.filter((p) => !pinnedIds.has(p.id));

  console.log("All projects:", projects.map(p => p.id));
  console.log("Pinned IDs:", [...pinnedIds]);

  return (
    <div className={`w-full rounded-2xl space-y-4 text-white shadow ${isMobile ? "bg-background p-2" : "bg-card border p-7 border-white/10"}`}>
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
        summary={user.count_summary ?? {
          count_project: 0,
          count_follower: 0,
          count_following: 0,
        }}
        instagram={user.instagram}
        linkedin={user.linkedin}
        github={user.github}
      />

      <ProfileButtonEdit username={user.username} />

      <ContainerProject>
        {pinned.length > 0 && (
          <PinnedProject>
            {pinned.map((project) => (
              <CardProjectProfile
                key={project.id}
                project={project}
                userId={userId}
                isPinned
                onMutateSuccess={() => refetch()}
              />
            ))}
          </PinnedProject>
        )}
        {notPinned.map((project) => (
          <CardProjectProfile
            key={project.id}
            project={project}
            userId={userId}
            onMutateSuccess={() => refetch()}
          />
        ))}
      </ContainerProject>
    </div>
  );
}


