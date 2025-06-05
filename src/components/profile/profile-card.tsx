"use client";

import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileButtonEdit } from "./profile-button-edit";
import { PinnedProject } from "./pinned-project";
import { FlexHeader } from "./flex-header";
import { PhotoProfileUser } from "./profile-photo-user";

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

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="bg-card w-full p-8 rounded-2xl border border-white/10 space-y-4 text-white shadow">
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
        summary={user.count_summary ?? { count_project: 0, count_follower: 0, count_following: 0 }}
        instagram={user.instagram}
        linkedin={user.linkedin}
        github={user.github}
      />
      <ProfileButtonEdit
        username={user.username}
      />
      {/* <PinnedProject username={user.username} /> */}
    </div>
  );
}
