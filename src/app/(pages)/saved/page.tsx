"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { cn, getPublicUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { BookmarkType } from "@/lib/type";

const SavedPage = () => {
    const { user, isLoaded: loadedUser } = useUser();
    const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({});

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = trpc.user.getBookmarked.useInfiniteQuery(
        {
            id: user?.id || "",
            limit: 4,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!user,
        }
    );

    const unbookmarkMutation = trpc.bookmark.delete.useMutation({
        onSuccess: () => refetch(),
    });

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (!loadedUser || !data) return <div>Loading...</div>;
    if (!user) return redirect("/sign-in");
    const isEmpty = data.pages.every((page) => page.items.length === 0);
    if (isEmpty) return <div>You have no saved projects.</div>;

    const handleUnbookmark = (bookmarkId: string, projectId: string) => {
        setOptimisticBookmarks((prev) => ({ ...prev, [projectId]: false }));
        unbookmarkMutation.mutate(
            {
                id_user: user.id,
                id_project: projectId,
            },
            {
                onError: () => setOptimisticBookmarks((prev) => ({ ...prev, [projectId]: true })),
            }
        );
    };

    return (
        <div className={cn("flex flex-col gap-4")}>
            {data.pages.map((page, pageIndex) => (
                <div key={pageIndex}>
                    {page.items.map((bookmark: BookmarkType) => {
                        const project = bookmark.project;
                        if (!project) return null;
                        const isBookmarked = optimisticBookmarks[project.id] !== undefined
                            ? optimisticBookmarks[project.id]
                            : true;

                        return (
                            isBookmarked && (
                                <div
                                    key={bookmark.id}
                                    className="grid grid-cols-3 gap-4 mb-4"
                                >
                                    <div className="col-span-1">
                                        {project.image1 ? (
                                            <Image width={800} height={450} src={getPublicUrl(project.image1)} alt={project.slug + " image"} />
                                        ) : (
                                            <div className="bg-gray-200 h-24 w-full"></div>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <Link className="text-lg font-semibold" href={`/project/${project.slug}`}>{project.title}</Link>
                                        <div className="flex gap-2 w-full">
                                            <Button
                                                variant="default"
                                                className="w-fit"
                                                onClick={() => handleUnbookmark(bookmark.id, project.id)}
                                            >
                                                Unbookmark
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        );
                    })}
                </div>
            ))}
            {isFetchingNextPage && <p>Loading more...</p>}
        </div>
    );
};

export default SavedPage;