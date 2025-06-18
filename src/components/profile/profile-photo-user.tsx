"use client";

import { UserRound } from "lucide-react";
import Image from "next/image";

interface PhotoProfileUserProps {
  photoUrl?: string | null;
}

export function PhotoProfileUser({ photoUrl }: PhotoProfileUserProps) {
  return (
    <div className="space-y-2">
      <div className="relative w-24 h-24">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt="User Photo"
            width={240}
            height={240}
            className="w-full h-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <UserRound className="w-12 h-12 text-black" />
          </div>
        )}
      </div>
    </div>
  );
}
