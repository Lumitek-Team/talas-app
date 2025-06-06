// "use client";

// import { useState, useEffect } from "react";
// import { Sidebar } from "@/components/layout/sidebar";
// import { FormWrapper } from "@/components/profile/edit/form-wraps";
// import { PageContainer } from "@/components/ui/page-container";
// import { PhotoProfile } from "@/components/profile/edit/photo-profile";
// import { InputForm } from "@/components/profile/edit/form-edit";
// import { GenderButton } from "@/components/profile/edit/button-gender";
// import { ProfileRow } from "@/components/profile/edit/profile-row";
// import { TextAreaForm } from "@/components/profile/edit/form-textarea";
// import { FloatingActionButton } from "@/components/ui/floating-action-button";
// import { trpc } from "@/app/_trpc/client";

// import { useUser } from "@clerk/nextjs";

// export default function EditProfile() {
//   const [isMobile, setIsMobile] = useState(false);

//   // Ganti username sesuai konteks user yang login atau dari route
//   const username = "muhammadpadliseptiana"; // TODO: ganti ini ambil dari session/route

//   // Query data user berdasarkan username
//   const { data: user, isLoading, error } = trpc.user.getByUsername.useQuery(
//     { username },
//     { enabled: !!username }
//   );

//   const utils = trpc.useUtils();

//   // Mutation update user pakai id dan data (kalau backend hanya support id)
//   // Jika backend support update by username, bisa ganti input di mutate
//   const updateMutation = trpc.user.update.useMutation({
//     onSuccess: () => {
//       alert("Profil berhasil diperbarui!");
//       utils.user.getByUsername.invalidate({ username });
//     },
//     onError: () => {
//       alert("Terjadi kesalahan saat menyimpan.");
//     },
//   });

//   // State form
//   const [name, setName] = useState("");
//   const [usernameInput, setUsernameInput] = useState("");
//   const [email, setEmail] = useState("");
//   const [bio, setBio] = useState("");
//   const [gender, setGender] = useState<"MALE" | "FEMALE">("FEMALE");
//   const [instagram, setInstagram] = useState("");
//   const [linkedIn, setLinkedIn] = useState("");
//   const [gitHub, setGitHub] = useState("");

//   // Responsif untuk mobile
//   useEffect(() => {
//     const handleResize = () => setIsMobile(window.innerWidth <= 690);
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Isi form saat data user sudah tersedia
//   useEffect(() => {
//     if (user) {
//       setName(user.name || "");
//       setUsernameInput(user.username || "");
//       setEmail(user.email_contact || "");
//       setBio(user.bio || "");
//       setGender(user.gender || "FEMALE");
//       setInstagram(user.instagram || "");
//       setLinkedIn(user.linkedin || "");
//       setGitHub(user.github || "");
//     }
//   }, [user]);

//   const handleSubmit = () => {
//     if (!user?.id) {
//       alert("User ID tidak ditemukan.");
//       return;
//     }

//     updateMutation.mutate({
//       id: user.id,
//       data: {
//         name,
//         username: usernameInput,
//         email_contact: email,
//         bio,
//         gender,
//         instagram,
//         linkedin: linkedIn,
//         github: gitHub,
//       },
//     });
//   };

//   if (isLoading) {
//     return <div className="text-center p-10 text-white">Memuat data...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-center p-10 text-red-500">
//         Gagal memuat data: {(error as Error).message}
//       </div>
//     );
//   }

//   return (
//     <>
//       <Sidebar activeItem="Edit Profile" />
//       <PageContainer title="Edit Profile">
//         <div
//           className={`overflow-hidden ${
//             isMobile
//               ? "bg-background"
//               : "bg-card rounded-3xl border border-white/10 max-w-4xl mx-auto"
//           }`}
//         >
//           <FormWrapper>
//             <ProfileRow gap="gap-10">
//               <PhotoProfile />
//               <InputForm
//                 label="Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//             </ProfileRow>

//             <InputForm
//               label="Username"
//               value={usernameInput}
//               onChange={(e) => setUsernameInput(e.target.value)}
//             />
//             <InputForm
//               label="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             <TextAreaForm
//               label="Bio"
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//             />

//             <div className="w-full flex flex-col gap-2">
//               <label className="font-semibold text-sm">Gender</label>
//               <ProfileRow gap="gap-2">
//                 <GenderButton
//                   gender="MALE"
//                   selectedGender={gender}
//                   onSelect={setGender}
//                 />
//                 <GenderButton
//                   gender="FEMALE"
//                   selectedGender={gender}
//                   onSelect={setGender}
//                 />
//               </ProfileRow>
//             </div>

//             <InputForm
//               label="Instagram"
//               value={instagram}
//               onChange={(e) => setInstagram(e.target.value)}
//               showAt
//             />
//             <InputForm
//               label="LinkedIn"
//               value={linkedIn}
//               onChange={(e) => setLinkedIn(e.target.value)}
//               showAt
//             />
//             <InputForm
//               label="GitHub"
//               value={gitHub}
//               onChange={(e) => setGitHub(e.target.value)}
//               showAt
//             />

//             <button
//               onClick={handleSubmit}
//               className="bg-primary text-white px-4 py-2 mt-6 rounded hover:bg-primary/80"
//               disabled={updateMutation.isLoading}
//             >
//               {updateMutation.isLoading ? "Menyimpan..." : "Save"}
//             </button>
//           </FormWrapper>
//         </div>
//       </PageContainer>

//       <FloatingActionButton />
//     </>
//   );
// }
