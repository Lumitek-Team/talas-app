"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { ProjectOneType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { getPublicUrl } from "@/lib/utils";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button"

const ProjectPage = () => {
    const { slug } = useParams() as { slug: string };
    const { user } = useUser();

    const { data, isLoading } = trpc.project.getOne.useQuery({
        id: slug,
        id_user: user?.id || "",
    });

    if (isLoading) return (<div> <h1>Loading...</h1> </div>);
    const project: ProjectOneType = data;

    console.log("project user", project.project_user[0].user.id);

    return (
        <div>
            {(user?.id === project.project_user[0].user.id) && (
                <div className="flex justify-end gap-4 items-center">
                    <Link href={`/project/${slug}/edit`} className={buttonVariants({ variant: "default" })}>edit</Link>
                </div>
            )}
            <h1>{project.title}</h1>
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