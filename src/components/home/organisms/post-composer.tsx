"use client";

import { Avatar } from "@/components/ui/avatar";
// IconButton is no longer used in this simplified layout
// import { IconButton } from "@/components/ui/icon-button"; 
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PostComposerProps {
  avatarSrc: string;
  username: string;
  onSubmit: (content: string) => void;
  className?: string;
}

export function PostComposer({ avatarSrc, username, onSubmit, className = "" }: PostComposerProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-3"> {/* Removed bg-accent and mb-4 as it's now a single line */}
        <Avatar src={avatarSrc} alt={username} />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Apa yang baru?"
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSubmit}
          className="rounded-full px-6 bg-primary text-white hover:bg-primary-foreground ml-3" // Added ml-3 for spacing
        >
          Post
        </Button>
      </div>
    </div>
  );
}