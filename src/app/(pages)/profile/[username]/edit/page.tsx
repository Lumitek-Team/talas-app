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
import { useUser, useAuth } from "@clerk/nextjs";
import { useToast } from "@/contexts/toast-context";
import { debounce } from "@/lib/utils";
import { deleteImages, uploadImage } from "@/lib/imageUtils";
// import { uploadFile, getImageUrl } from "@/lib/supabase/storage";
// import { getPublicUrl, uploadImage } from "@/lib/utils";

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
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    data: loggedInUserDetail,
    isLoading: isLoggedInUserLoading,
    error: loggedInUserError,
  } = trpc.user.getById.useQuery(
    { id: user?.id ?? "" },
    { enabled: isLoaded && !!user?.id },
  );

  const {
    data: userDetail,
    isLoading: isUserDetailLoading,
    error: userDetailError,
  } = trpc.user.getByUsername.useQuery(
    { username: usernameFromUrl ?? "" },
    { enabled: !!usernameFromUrl },
  );

  const userData = userDetail?.data as UserDetail | undefined;
  const utils = trpc.useUtils();

  const updateMutation = trpc.user.update.useMutation({
    onSuccess: (updatedUser) => {
      console.log("Berhasil update user!");
      utils.user.getByUsername.invalidate({ username: usernameFromUrl });
      if (updatedUser.data.username !== usernameFromUrl) {
        router.replace(`/profile/${updatedUser.data.username}`);
      } else {
        router.back();
      }
    },
    onError: (error) => {
      console.error("Gagal update user:", error);
      showToast("Gagal menyimpan data. Silakan coba lagi.", "error");
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [debouncedUsername, setDebouncedUsername] = useState(usernameInput);
  const [isUsernameDirty, setIsUsernameDirty] = useState(false);

  // Debounce username input
  useEffect(() => {
    const handler = debounce((val: string) => setDebouncedUsername(val), 400);
    handler(usernameInput);
    return () => {
      handler.cancel?.(); // if using lodash.debounce, otherwise ignore
    };
  }, [usernameInput]);

  // Deteksi perubahan username dari nilai awal
  useEffect(() => {
    if (userData) {
      setIsUsernameDirty(usernameInput !== userData.username);
    }
  }, [usernameInput, userData]);

  // Cek akses pengguna
  useEffect(() => {
    if (
      !isUserDetailLoading &&
      !isLoggedInUserLoading &&
      !isRedirecting &&
      user &&
      userDetail?.data?.id &&
      loggedInUserDetail?.data?.id &&
      userDetail.data.id !== loggedInUserDetail.data.id &&
      loggedInUserDetail.data.username
    ) {
      setIsRedirecting(true);
      router.replace(`/profile/${loggedInUserDetail.data.username}/edit`);
    }
  }, [
    isUserDetailLoading,
    isLoggedInUserLoading,
    isRedirecting,
    user,
    userDetail?.data?.id,
    loggedInUserDetail?.data?.id,
    loggedInUserDetail?.data?.username,
    router,
  ]);

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
      setGender(userData.gender);
      setInstagram(userData.instagram ?? "");
      setLinkedIn(userData.linkedin ?? "");
      setGitHub(userData.github ?? "");
      setPreviewUrl(userData.photo_profile ?? null);
    }
    if (!email && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [userData, user, email]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file: File) => {
    if (!file) return;

    // Create a temporary preview
    const previewObjectUrl = URL.createObjectURL(file);
    setPreviewUrl(previewObjectUrl);
    setSelectedFile(file); // Store the selected file for later upload
  };

  // Cek username unik saat input berubah (pakai debouncedUsername)
  const { data: usernameCheckData, isLoading: isUsernameCheckLoading } =
    trpc.user.getByUsername.useQuery(
      { username: debouncedUsername },
      {
        enabled:
          !!debouncedUsername && debouncedUsername !== userData?.username, // hanya cek jika berubah
      },
    );

  useEffect(() => {
    if (
      debouncedUsername &&
      debouncedUsername !== userData?.username &&
      usernameCheckData?.data?.id &&
      usernameCheckData.data.id !== userData?.id
    ) {
      setUsernameError("Username sudah digunakan.");
    } else {
      setUsernameError(null);
    }
  }, [debouncedUsername, userData, usernameCheckData]);

  const handleSubmit = useCallback(async () => {
    if (!userData) {
      showToast("Data pengguna tidak lengkap.", "error");
      return;
    }

    if (!name || !usernameInput) {
      showToast("Nama dan username wajib diisi.", "error");
      return;
    }

    if (usernameError) {
      showToast(usernameError, "error");
      return;
    }

    let uploadedImagePath: string | undefined = undefined;

    if (selectedFile) {
      try {
        let token: string | null = null;
        try {
          token = await getToken({ template: "supabase" });
        } catch (e) {
          console.error("Clerk 'supabase' template acquisition failed:", e);
        }

        uploadedImagePath = await uploadImage(selectedFile, "profile_photos", token || undefined);

        if (userData.photo_profile) {
          await deleteImages([userData.photo_profile], token || undefined);
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        showToast("Failed to upload profile image. Please try again.", "error");
        return;
      }
    }

    updateMutation.mutate({
      id: userData.id,
      data: {
        name: name.trim(),
        username: usernameInput.trim(),
        email_contact: email?.trim() || undefined,
        bio: bio?.trim() || undefined,
        gender,
        instagram: instagram?.trim() || undefined,
        linkedin: linkedIn?.trim() || undefined,
        github: gitHub?.trim() || undefined,
        photo_profile: uploadedImagePath || userData.photo_profile || undefined,
      },
    });
  }, [
    userData,

    name,
    usernameInput,
    email,
    bio,
    gender,
    instagram,
    linkedIn,
    gitHub,
    selectedFile,
    updateMutation,
    usernameError,
    getToken,
    showToast,
  ]);

  // Fallback saat redirect
  if (isRedirecting) return null;

  if (!isLoaded || isUserDetailLoading || isLoggedInUserLoading) {
    return <div className="text-center p-10 text-white">Memuat data...</div>;
  }

  if (userDetailError || loggedInUserError) {
    return (
      <div className="text-center p-10 text-red-500">
        Gagal memuat data:
        <br />
        {userDetailError?.message || loggedInUserError?.message}
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
                photoUrl={previewUrl || undefined}
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
            {usernameError && (
              <div className="text-red-500 text-xs mt-1">{usernameError}</div>
            )}
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
              className="bg-primary text-white px-4 py-2 mt-6 rounded disabled:opacity-50 hover:bg-primary-foreground cursor-pointer"
              disabled={
                updateMutation.isPending ||
                !!usernameError ||
                (isUsernameDirty && (isUsernameCheckLoading || !!usernameError))
              }
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
