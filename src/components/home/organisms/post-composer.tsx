"use client";

import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PostComposerProps {
  avatarSrc: string;
  username: string;
  onSubmit: (content: string) => void;
}

export function PostComposer({ avatarSrc, username, onSubmit }: PostComposerProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content);
      setContent("");
    }
  };

  return (
    <div className="bg-card rounded-lg p-4 mb-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Avatar src={avatarSrc} alt={username} />
        <div className="flex-1">
          <input
            type="text"
            placeholder="What's going on today?"
            className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <IconButton>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </IconButton>
        </div>
        
        <Button onClick={handleSubmit}>
          Post
        </Button>
      </div>
    </div>
  );
}