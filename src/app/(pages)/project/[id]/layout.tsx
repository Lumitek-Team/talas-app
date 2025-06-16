export async function generateMetadata() {
    return {
        title: `Talas - Project Details`,
        description: "A  web-based social media platform designed to showcase software engineering projects. Talas enables users to share, explore, and interact with innovative project portfolios in a modern and engaging way. Built for collaboration, inspiration, and growth in the tech community.",
    };
}

export default async function FeedsLayout({
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