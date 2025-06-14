"use client";

import { useRouter } from "next/navigation";
// import { CircleArrowOutUpRightIcon } from "lucide-react";

type ProfileButtonEditProps = {
  username: string;
};

export function ProfileButtonEdit({ username }: ProfileButtonEditProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/profile/${username}/edit`); // route dinamis berdasarkan username
  };

  return (
    <div
      onClick={handleClick}
      className="flex justify-center w-full items-center border rounded-xl border-[#ffffff] p-2 text-sm mt-6 mb-1 cursor-pointer select-none hover:bg-white/10 transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
    >
      <span className="flex gap-2 items-center text-[#ffffff] font-medium">
        Edit Profile
        {/* <CircleArrowOutUpRightIcon className="w-5 h-5" /> */}
      </span>
    </div>
  );
}

