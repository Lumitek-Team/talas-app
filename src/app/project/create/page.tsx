"use client"

import ProjectForm from "@/components/project/ProjectForm"

const CreatePage = () => {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-semibold">Buat Post</h1>
                <p className="text-muted-foreground">Buat postingan baru</p>
            </div>
            <ProjectForm mode="create" />
        </div>
    )
}

export default CreatePage