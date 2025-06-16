export async function generateMetadata() {
    return {
        title: `Talas - Sign in to your account`,
        description: "A  web-based social media platform designed to showcase software engineering projects. Talas enables users to share, explore, and interact with innovative project portfolios in a modern and engaging way. Built for collaboration, inspiration, and growth in the tech community.",
    };
}

export default async function SignInLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            {children}
        </>
    )
}