"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { getPublicUrl } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ProjectPage = () => {
    const { slug } = useParams() as { slug: string };
    const { user, isLoaded } = useUser();
    const router = useRouter();

    const { data, isLoading } = trpc.project.getOne.useQuery({
        id: slug,
        id_user: user?.id || "dev_user_123", // Use a default ID for development
    });

    const deleteMutation = trpc.project.delete.useMutation({
        onSuccess: () => {
            router.push("/"); // Redirect to the homepage after deletion
        },
        onError: (error) => {
            alert(`Failed to delete project: ${error.message}`);
        },
    });

    if (isLoading) return (<div> <h1>Loading...</h1> </div>);
    
    // DEVELOPMENT ONLY - Authentication check disabled
    // In production, uncomment this line:
    // if (user === null && isLoaded) return router.push("/sign-in");
    // Comment: Authentication check disabled for development purposes

    const project: ProjectOneType = data;

    // Check if we have project data
    if (!project) return (<div> <h1>Project not found</h1> </div>);

    return (
        <div>
            {(user?.id === project.project_user[0]?.user?.id) && (
                <div className="flex justify-end gap-4 items-center">
                    <Link href={`/project/${slug}/edit`} className={buttonVariants({ variant: "default" })}>edit</Link>
                    <Button variant="destructive" onClick={deleteProject}>
                        Delete
                    </Button>
                </div>
            )}
            <h1 className="text-xl font-semibold">{project.title}</h1>
            <div className="flex gap-4">
                {project.link_figma && (
                    <Link href={project.link_figma} target="_blank" className="text-sm text-accent-green hover:text-accent-green/80 transition-colors duration-200">
                        Figma
                    </Link>
                )}
                {project.link_github && (
                    <Link href={project.link_github} target="_blank" className="text-sm text-accent-green hover:text-accent-green/80 transition-colors duration-200">
                        Github
                    </Link>
                )}
            </div>

            <p>{project.category.title}</p>
            <div className="flex gap-2 flex-wrap w-full">
                {project.image1 && (
                    <>
                        <Separator />
                        <Image src={getPublicUrl(project.image1)} height={360} width={360} alt={project.title} />
                    </>
                )}
            </div>
            <div>
                <div dangerouslySetInnerHTML={{ __html: project.content }} />
            </div>
        </div>
    );
};

export default ProjectPage;