"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { FormWrapper } from "@/components/profile/edit/form-wraps";
import { PageContainer } from "@/components/ui/page-container";
import { PhotoProfile } from "@/components/profile/edit/photo-profile";
import { InputForm } from "@/components/profile/edit/form-edit";
import { GenderButton } from "@/components/profile/edit/button-gender";
import { ProfileRow } from "@/components/profile/edit/profile-row";
import { TextAreaForm } from "@/components/profile/edit/form-textarea";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { uploadFile, getImageUrl } from "@/lib/supabase/storage";

type genderType = "MALE" | "FEMALE";

type UserDetail = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  photo_profile: string | null;
  instagram: string | null;
  linkedin: string | null;
  github: string | null;
  gender: genderType;
  email_contact: string | null;
  count_summary: {
    count_project: number;
    count_follower: number;
    count_following: number;
  } | null;
};

export default function EditProfile() {
  const params = useParams();
  const router = useRouter();
  const usernameFromUrl = params?.username as string | undefined;
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  const {
    data: userDetail,
    isLoading: isUserDetailLoading,
    error: userDetailError,
  } = trpc.user.getByUsername.useQuery(
    { username: usernameFromUrl ?? "" },
    { enabled: !!usernameFromUrl }
  );

  const userData = userDetail?.data as UserDetail | undefined;
  const utils = trpc.useUtils();

  const updateMutation = trpc.user.update.useMutation({
    onSuccess: () => {
      if (usernameFromUrl) {
        utils.user.getByUsername.invalidate({ username: usernameFromUrl });
      }
      router.back();
    },
  });

  const [name, setName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState<genderType>("FEMALE");
  const [instagram, setInstagram] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [gitHub, setGitHub] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 690);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name ?? "");
      setUsernameInput(userData.username ?? "");
      setBio(userData.bio ?? "");
      setGender(userData.gender ?? "FEMALE");
      setInstagram(userData.instagram ?? "");
      setLinkedIn(userData.linkedin ?? "");
      setGitHub(userData.github ?? "");
    }
    if (user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [userData, user]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (file: File) => {
    if (!file || !user?.id) return;

    setPreviewUrl(URL.createObjectURL(file));

    const filePath = `profile_photos/${user.id}-${Date.now()}.${file.name.split(".").pop()}`;

    try {
      const result = await uploadFile("talas-image", filePath, file);
      const publicUrl = await getImageUrl("talas-image", result.path);
      if (publicUrl) {
        setPreviewUrl(publicUrl);
      }
    } catch (error: any) {
      console.error("Upload error:", error.message);
      alert("Upload foto gagal. Silakan coba lagi.");
      return;
    }
  };

  const handleSubmit = useCallback(() => {
    console.log("userData", userData);
console.log("user", user);
    if (!userData?.id || !user) {
      alert("Data pengguna tidak lengkap.");
      return;
    }

    if (!name.trim() || !usernameInput.trim()) {
      alert("Nama dan username wajib diisi.");
      return;
    }


    updateMutation.mutate({
      id: userData.id,
      data: {
        name: name.trim(),
        username: usernameInput.trim(),
        email_contact: email.trim(),
        bio,
        gender,
        instagram,
        linkedin: linkedIn,
        github: gitHub,
        photo_profile: previewUrl ?? userData?.photo_profile ?? undefined,
      },
    });
  }, [
    userData?.id,
    user,
    name,
    usernameInput,
    email,
    bio,
    gender,
    instagram,
    linkedIn,
    gitHub,
    previewUrl,
    updateMutation,
  ]);

  if (isUserDetailLoading) {
    return <div className="text-center p-10 text-white">Memuat data...</div>;
  }

  if (userDetailError) {
    return (
      <div className="text-center p-10 text-red-500">
        Gagal memuat data:
        <br />
        {userDetailError?.message || ""}
        <br />
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 px-4 py-2 rounded text-white hover:bg-red-700"
        >
          Muat ulang
        </button>
      </div>
    );
  }

  return (
    <>
      <Sidebar activeItem="Edit Profile" />
      <PageContainer title="Edit Profile" showBackButton>
        <div
          className={`overflow-hidden ${
            isMobile
              ? "bg-background"
              : "bg-card rounded-3xl border border-white/10 max-w-4xl mx-auto"
          }`}
        >
          <FormWrapper>
            <ProfileRow gap="gap-10">
              <PhotoProfile
                photoUrl={previewUrl || userData?.photo_profile || undefined}
                onChange={handleFileChange}
              />
              <InputForm
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ProfileRow>

            <InputForm
              label="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            <InputForm label="Email" value={email} disabled readOnly />
            <TextAreaForm
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <div className="w-full flex flex-col gap-2">
              <label className="font-semibold text-sm">Gender</label>
              <ProfileRow gap="gap-2">
                <GenderButton
                  gender="MALE"
                  selectedGender={gender}
                  onSelect={setGender}
                />
                <GenderButton
                  gender="FEMALE"
                  selectedGender={gender}
                  onSelect={setGender}
                />
              </ProfileRow>
            </div>

            <InputForm
              label="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              showAt
            />
            <InputForm
              label="LinkedIn"
              value={linkedIn}
              onChange={(e) => setLinkedIn(e.target.value)}
              showAt
            />
            <InputForm
              label="GitHub"
              value={gitHub}
              onChange={(e) => setGitHub(e.target.value)}
              showAt
            />

            <button
              onClick={handleSubmit}
              className="bg-primary text-white px-4 py-2 mt-6 rounded hover:bg-primary/80 disabled:opacity-50"
              disabled={updateMutation.isPending}
              type="button"
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
          </FormWrapper>
        </div>
      </PageContainer>

      <FloatingActionButton />
    </>
  );
}
