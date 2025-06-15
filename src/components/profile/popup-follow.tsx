"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import Link from "next/link";

type TypeFollow = "followers" | "following";

type User = {
  username: string;
  name: string;
  photo_profile?: string | null;
};

type PopupFollowProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: TypeFollow;
};

export function PopupFollow({ open, onClose, userId, type }: PopupFollowProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isPending, setIsPending] = useState(false);

  const getFollowers = trpc.user.getAllFollower.useQuery(
    { id_following: userId },
    { enabled: false }
  );

  const getFollowings = trpc.user.getAllFollowing.useQuery(
    { id_follower: userId },
    { enabled: false }
  );

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setIsPending(true);
        if (type === "followers") {
          const res = await getFollowers.refetch();
          setUsers(res.data?.data ?? []);
        } else {
          const res = await getFollowings.refetch();
          setUsers(res.data?.data ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch follow data", error);
      } finally {
        setIsPending(false);
      }
    };

    fetchData();
  }, [open, type]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] w-[90%] max-w-md p-6 pt-4 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white text-lg text-center font-semibold">
            {type === "followers" ? "Followers" : "Following"}
          </h2>
          <button onClick={onClose} className="text-white hover:opacity-70 text-xl">
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {isPending ? (
            <p className="text-white text-sm text-center animate-pulse">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-white text-sm text-center">No users found.</p>
          ) : (
            users.map((user, index) => (
              <Link
                key={index}
                href={`/profile/${user.username}`}
                className="block"
                onClick={onClose} 
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-3 mt-2 hover:bg-white/5 px-2 py-1  transition">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    {user.photo_profile ? (
                      <Image
                        src={user.photo_profile}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-white text-xs">👤</span>
                    )}
                  </div>

                  {/* User info */}
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/50 text-xs">@{user.username}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
