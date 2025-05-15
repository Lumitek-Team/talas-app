"use client"

import { trpc } from "@/app/_trpc/client";
import ProjectForm from "@/components/project/ProjectForm"
import { ProjectOneType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

const EditPage = () => {
    const { slug } = useParams() as { slug: string };
    const { user } = useUser();

    const { data, isLoading } = trpc.project.getOne.useQuery({
        id: slug,
        id_user: user?.id || "",
    });

    if (isLoading) return (<div> <h1>Loading...</h1> </div>);
    const project: ProjectOneType = data;
    return (
        <div className="container">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">Edit Post</h1>
                <p className="text-muted-foreground">Buat postingan baru</p>
            </div>
            <ProjectForm mode="edit" project={project} />
        </div>
    )
}

export default EditPage