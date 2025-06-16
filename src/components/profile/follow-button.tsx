"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

type ProfileFollowProps = {
  username: string;
  idCurrentUser: string;
  idTargetUser: string;
};

export function ProfileFollow({
  username,
  idCurrentUser,
  idTargetUser,
}: ProfileFollowProps) {
  const utils = trpc.useUtils();

  // Query untuk cek apakah udah follow
  const { data, isLoading: isChecking } = trpc.follow.checkIsFollowing.useQuery({
    id_follower: idCurrentUser,
    id_following: idTargetUser,
  });

  const followMutation = trpc.follow.following.useMutation({
    onSettled: () => {
      utils.user.getByUsername.invalidate({ username });
      utils.user.getAllFollowing.invalidate({ id_follower: idCurrentUser });
      utils.follow.checkIsFollowing.invalidate({
        id_follower: idCurrentUser,
        id_following: idTargetUser,
      });
    },
  });

  const unfollowMutation = trpc.follow.unfollowing.useMutation({
    onSettled: () => {
      utils.user.getByUsername.invalidate({ username });
      utils.user.getAllFollowing.invalidate({ id_follower: idCurrentUser });
      utils.follow.checkIsFollowing.invalidate({
        id_follower: idCurrentUser,
        id_following: idTargetUser,
      });
    },
  });

  const isMutating = followMutation.isPending || unfollowMutation.isPending;
  const isLoading = isChecking || isMutating;

  const handleClick = async () => {
    if (isLoading || !data) return;

    try {
      if (data.isFollowing) {
        await unfollowMutation.mutateAsync({
          id_follower: idCurrentUser,
          id_following: idTargetUser,
        });
      } else {
        await followMutation.mutateAsync({
          id_follower: idCurrentUser,
          id_following: idTargetUser,
        });
      }
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex justify-center w-full items-center border rounded-xl p-2 text-sm mt-6 mb-1 cursor-pointer select-none transition
        ${isLoading ? "border-white text-white" : data?.isFollowing ? "border-white text-white hover:bg-white/10" : "bg-primary border-primary"}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      <span className="flex gap-2 items-center text-white font-medium">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : data?.isFollowing ? (
          "Unfollow"
        ) : (
          "Follow"
        )}
      </span>
    </div>
  );
}
