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
        id_user: user?.id || "",
    });

    const deleteMutation = trpc.project.delete.useMutation({
        onSuccess: () => {
            router.push("/feeds/contoh");
        },
        onError: (error) => {
            alert(`Failed to delete project: ${error.message}`);
        },
    });

    if (isLoading || !isLoaded) return (<div> <h1>Loading...</h1> </div>);
    if (user === null && isLoaded) return router.push("/sign-in");

    if (!data && !isLoading) {
        // return 404
        return (
            <div>
                <h1 className="text-3xl font-semibold">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist.</p>
                <Link href="/feeds/contoh" className={buttonVariants({ variant: "default" })}>
                    Back to Feeds
                </Link>
            </div>
        );
    }

    const deleteProject = () => {
        if (confirm("Are you sure you want to delete this project?")) {
            deleteMutation.mutate({
                id: data.id,
                id_user: user.id,
            });
        }
    };

    const project: ProjectOneType = data;

    return (
        <div>
            {(user?.id === project.project_user[0].user.id) && (
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