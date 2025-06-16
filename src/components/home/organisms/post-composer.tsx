// components/home/molecules/post-composer.tsx
"use client";

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { getPublicUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostComposerProps {
  avatarSrc: string;
  username: string;
  className?: string;
}

export function PostComposer({ avatarSrc, username, className = "" }: PostComposerProps) {
  const router = useRouter();
  const { user } = useUser();

  // Fetch the latest user data from your database
  const { data: userProfile } = trpc.user.getById.useQuery(
    { id: user?.id ?? "" },
    { enabled: !!user?.id }
  );

  const handleRedirect = () => {
    router.push("/create-project");
  };

  // Use database photo if available, otherwise fallback to Clerk's imageUrl
  const currentAvatarSrc = userProfile?.data?.photo_profile
    ? getPublicUrl(userProfile.data.photo_profile)
    : avatarSrc;

  // Use database name/username if available, otherwise use Clerk's data
  const currentUsername = userProfile?.data?.name || userProfile?.data?.username || username;

  return (
    <div className={`p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={currentAvatarSrc} alt={currentUsername} />
          <AvatarFallback>{currentUsername?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <input
            type="text"
            placeholder="What's your new creation?"
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground cursor-pointer"
            onClick={handleRedirect}
            readOnly
          />
        </div>
        <Button
          onClick={handleRedirect}
          className="rounded-full px-6 bg-primary text-white hover:bg-primary-foreground ml-3"
        >
          Post
        </Button>
      </div>
    </div>
  );
}