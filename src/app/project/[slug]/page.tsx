"use client"

import { trpc } from "@/app/_trpc/client"
import { ProjectOneType } from "@/lib/type"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"

interface ProjectPageProps {
    params: { slug: string }
}

const ProjectPage: React.FC<ProjectPageProps> = ({ params }: ProjectPageProps) => {
    const { user } = useUser()

    const { data, isLoading } = trpc.project.getOne.useQuery({
        id: params.slug,
        id_user: user?.id || "",
    })

    const project: ProjectOneType = data;

    if (isLoading) return (<div> <h1>Loading...</h1> </div>)

    return (
        <div>
            <h1>{project.title}</h1>
            <div className="flex gap-2 flex-wrap w-full">
                <Image src={project.image1 ?? ""} height={360} width={360} alt={project.title + " image"} />
            </div>
            <div>
                <div dangerouslySetInnerHTML={{ __html: project.content }} />
            </div>
        </div>
    )
}

export default ProjectPage