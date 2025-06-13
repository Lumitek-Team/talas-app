"use client";

import { useState } from "react";
import { Instagram } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { PopupFollow } from "./popup-follow"; 

interface ProfileStatsProps {
  summary: {
    count_project: number;
    count_follower: number;
    count_following: number;
  };
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  userId: string;
}

export function ProfileStats({
  summary,
  instagram,
  linkedin,
  github,
  userId,
}: ProfileStatsProps) {
  const [openPopup, setOpenPopup] = useState(false);
  const [popupType, setPopupType] = useState<"followers" | "following">("followers");

  const handleOpenPopup = (type: "followers" | "following") => {
    setPopupType(type);
    setOpenPopup(true);
  };

  return (
    <>
      <div className="flex justify-between items-center text-sm text-[#ffffff] w-full mt-5 mb-5">
        {/* Kiri */}
        <div className="flex items-center gap-2">
          <span
            onClick={() => handleOpenPopup("followers")}
            className="hover:underline cursor-pointer"
          >
            {summary.count_follower} Follower
          </span>
          <span className="text-[#ffffff]">|</span>
          <span
            onClick={() => handleOpenPopup("following")}
            className="hover:underline cursor-pointer"
          >
            {summary.count_following} Following
          </span>
          <span className="text-[#ffffff]">|</span>
          <span>{summary.count_project} Project</span>
        </div>

        {/* Kanan */}
        <div className="flex items-center gap-6 text-[#ffffff]">
          {instagram && (
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {linkedin && (
            <a
              href={`https://linkedin.com/in/${linkedin}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin className="w-5 h-5" />
            </a>
          )}
          {github && (
            <a
              href={`https://github.com/${github}`}
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <PopupFollow
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        userId={userId}
        type={popupType}
      />
    </>
  );
}
