"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PostComposerProps {
  avatarSrc: string;
  username: string;
  className?: string;
}

export function PostComposer({ avatarSrc, username, className = "" }: PostComposerProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/create-project");
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <Avatar src={avatarSrc} alt={username} />
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