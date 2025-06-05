interface ProfileHeaderProps {
  name: string;
  username: string;
  bio: string;
  gender?: string | null;
}

export function ProfileHeader({ name, username, bio, gender }: ProfileHeaderProps) {
  const pronoun = gender === "FEMALE" ? "she/her" : gender === "MALE" ? "he/him" : "";

  return (
    <div className="mr-10">
      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-2xl font-semibold">{name}</h2>
        {pronoun && (
          <span className="text-sm italic text-[#cccccc]">({pronoun})</span>
        )}
      </div>
      <p className="text-base text-[#ffffff] mb-2">{bio || "No bio available"}</p>
      <p className="text-sm text-[#ffffff]">@{username}</p>
    </div>
  );
}
