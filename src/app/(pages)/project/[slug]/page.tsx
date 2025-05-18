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
import CommentForm from "@/components/project/CommentForm";
import CommentTree from "@/components/project/CommentTree";
import { useState } from "react";

const ProjectPage = () => {
    const { slug } = useParams() as { slug: string };
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [optimisticBookmark, setOptimisticBookmark] = useState<boolean | undefined>(undefined);

    if (user === null && isLoaded) {
        router.push("/sign-in");
        return null;
    }

    const { data: dataProject, isLoading: projectLoading, refetch: refetchProject } = trpc.project.getOne.useQuery({
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

    const bookmarkMutation = trpc.bookmark.create.useMutation({
        onSuccess: () => {
            setOptimisticBookmark(true);
        },
        onError: () => {
            setOptimisticBookmark(false);
        }
    });
    const unbookmarkMutation = trpc.bookmark.delete.useMutation({
        onSuccess: () => {
            setOptimisticBookmark(false);
        },
        onError: () => {
            setOptimisticBookmark(true);
        }
    });

    // Archive/unarchive mutations
    const archiveMutation = trpc.project.archive.useMutation({
        onSuccess: () => {
            refetchProject();
        },
        onError: (err) => alert("Failed to archive: " + err.message),
    });
    const unarchiveMutation = trpc.project.unarchive.useMutation({
        onSuccess: () => {
            refetchProject();
        },
        onError: (err) => alert("Failed to unarchive: " + err.message),
    });

    const project = dataProject as ProjectOneType;

    // Jalankan hanya jika project sudah ada dan tidak loading
    const commentsQuery = trpc.project.getComments.useQuery(
        { id: project?.id ?? "" },
        { enabled: !!project && !projectLoading }
    );

    if (projectLoading || !isLoaded) return (<div> <h1>Loading...</h1> </div>);

    if (!dataProject && !projectLoading) {
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
                id: project.id,
                id_user: user.id,
            });
        }
    };

    const isBookmarked = optimisticBookmark !== undefined
        ? optimisticBookmark
        : project.is_bookmarked;

    const handleBookmark = () => {
        setOptimisticBookmark(true);
        bookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmark(false),
        });
    };

    const handleUnbookmark = () => {
        setOptimisticBookmark(false);
        unbookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmark(true),
        });
    };

    const handleArchive = () => {
        if (confirm("Archive this project?")) {
            archiveMutation.mutate({
                id: project.id,
                id_user: user.id,
            });
        }
    };

    const handleUnarchive = () => {
        if (confirm("Unarchive this project?")) {
            unarchiveMutation.mutate({
                id: project.id,
                id_user: user.id,
            });
        }
    };

    return (
        <div>
            {(user?.id === project.project_user[0].user.id) && (
                <div className="flex justify-end gap-4 items-center">
                    {project.is_archived ? (
                        <Button
                            variant="outline"
                            onClick={handleUnarchive}
                            disabled={unarchiveMutation.isPending}
                        >
                            {unarchiveMutation.isPending ? "Unarchiving..." : "Unarchive"}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleArchive}
                            disabled={archiveMutation.isPending}
                        >
                            {archiveMutation.isPending ? "Archiving..." : "Archive"}
                        </Button>
                    )}
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
            <p>{project.project_user[0].user.name}</p>
            <div className="flex gap-2 w-full">
                {!isBookmarked ? (
                    <Button
                        variant="outline"
                        className="w-fit"
                        onClick={handleBookmark}
                    >
                        Bookmark
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        className="w-fit"
                        onClick={handleUnbookmark}
                    >
                        Unbookmark
                    </Button>
                )}
            </div>
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

            {/* comments */}
            <Separator className="mt-10 mb-4" />
            <CommentForm
                id_project={project.id}
                onSuccess={() => commentsQuery.refetch()} // refetch komentar setelah submit
            />
            <Separator className="mb-10 mt-4" />
            <div className="flex flex-col gap-4 py-8">
                {commentsQuery.isLoading && <div>Loading comments...</div>}
                {commentsQuery.data && commentsQuery.data.length === 0 && (
                    <div className="text-muted-foreground">Belum ada komentar.</div>
                )}
                {commentsQuery.data && commentsQuery.data.length > 0 && (
                    <CommentTree
                        comments={commentsQuery.data}
                        id_project={project.id}
                        onCommentAdded={() => commentsQuery.refetch()} // pass ke tree
                    />
                )}
            </div>
        </div>
    );
};

export default ProjectPage;