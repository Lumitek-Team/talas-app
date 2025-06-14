"use client";

import { Avatar } from "@/components/ui/avatar-gatau-error";
import { useRouter } from "next/router"; 

interface PostHeaderProps {
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string;
}

export function PostHeader({ username, userRole, avatarSrc, timestamp }: PostHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex gap-3 items-center cursor-pointer" onClick={() => router.push(`profile/${username}`)}>
        <Avatar src={avatarSrc} alt={username} />
        <div className="flex flex-col">
          <h3 className="font-medium text-foreground">{username}</h3>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
      </div>
      <div className="ml-auto text-xs text-muted-foreground">
        {timestamp}
      </div>
    </div>
  );
}