import { currentUser } from "@clerk/nextjs/server";
import { getTrpcCaller } from "../_trpc/server";

export default async function SignedInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (user) {
    const {
      id,
      emailAddresses,
      firstName,
      lastName,
      externalAccounts,
      imageUrl,
    } = user;

    const trpc = await getTrpcCaller();
    try {
      await trpc.user.syncWithSupabase({
        id: id,
        name: `${firstName} ${lastName}`,
        email: emailAddresses[0].emailAddress,
        auth_type: externalAccounts[0]?.provider || "unknown",
        photo_profile: imageUrl,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to sync user with Supabase:", error);
      }
      // Allow page to load even if sync fails - user can still browse
    }
  }
  return <div>{children}</div>;
}
