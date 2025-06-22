"use client";

import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostHeaderProps {
  username: string;
  userRole: string;
  avatarSrc: string;
  timestamp: string;
  countCollaborators?: number; // Optional prop for collaborator count
}

export function PostHeader({ username, userRole, avatarSrc, timestamp, countCollaborators }: PostHeaderProps) {
  const other = countCollaborators && countCollaborators > 0 ? ` & ${countCollaborators} lainnya` : '';

  return (
    <div className="flex items-center gap-3 mb-4">
      <Link href={`/profile/${userRole}`} className="flex flex-row gap-3 items-center cursor-pointer">
        <Avatar className="">
          <AvatarImage src={avatarSrc} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <h3 className="font-medium text-foreground">{username} <span>{other}</span></h3>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
      </Link>
      <div className="ml-auto text-xs text-muted-foreground">
        {timestamp}
      </div>
    </div>
  );
}