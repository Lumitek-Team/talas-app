import { currentUser } from "@clerk/nextjs/server";
import { getTrpcCaller } from "../_trpc/server";

export default async function SignedInLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const user = await currentUser();

    if (user) {
        const { id, emailAddresses, firstName, lastName, externalAccounts, imageUrl } = user;

        const trpc = await getTrpcCaller();
        await trpc.user.syncWithSupabase({
            id: id,
            name: `${firstName} ${lastName}`,
            email: emailAddresses[0].emailAddress,
            auth_type: externalAccounts[0]?.provider || "unknown",
            photo_profile: imageUrl,
        });
    }
    return (
        <div>
            <div className="w-full bg-white text-zinc-900 text-center py-2">
                <p className="font-semibold">Halo, {user?.emailAddresses[0].emailAddress}</p>
            </div>
            {children}
        </div>
    )
}