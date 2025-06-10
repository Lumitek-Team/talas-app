import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileButtonEdit } from "./profile-button-edit";
import { FlexHeader } from "./flex-header";
import { PhotoProfileUser } from "./profile-photo-user";
import { ContainerProject } from "@/components/profile/container-project";
import { PinnedProject } from "@/components/profile/pinned-project";
import { getPublicUrl } from "@/lib/utils";
import { CardArchive } from "../archive/card-archive";
import { CardContentArchive } from "../archive/content-archive";
import { CardHeaderArchive } from "../archive/card-header-archive";
import { ImageContainer } from "../archive/image-container";
import { CardProjectProfile } from "./card-project-profile";

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
  content: string; // <--- tambahkan ini
  image1?: string | undefined;
  created_at: string;
}

interface ProfileCardProps {
  user: User;
  userId: string;
  isMobile?: boolean;
  projects: Project[];
}

export function ProfileCard({ user, userId, isMobile = false, projects }: ProfileCardProps) {
  return (
    <div
      className={`w-full rounded-2xl space-y-4 text-white shadow ${
        isMobile ? "bg-background p-2" : "bg-card border p-8 border-white/10"
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
        <PinnedProject>
          
        </PinnedProject>
        {projects.map((project) => (
          <CardProjectProfile
            key={project.id}
            project={project}
            userId={userId}
          />
        ))}
      </ContainerProject>
    </div>
  );
}
