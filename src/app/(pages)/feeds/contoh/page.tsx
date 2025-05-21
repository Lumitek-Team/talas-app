"use client"

import { trpc } from "@/app/_trpc/client"
import { Button } from "@/components/ui/button"
import { ProjectOneType } from "@/lib/type"
import { cn, getPublicUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

const FeedsPage = () => {
    const { user, isLoaded } = useUser()
    const [optimisticBookmarks, setOptimisticBookmarks] = useState<Record<string, boolean>>({})
    const [optimisticLikes, setOptimisticLikes] = useState<Record<string, boolean>>({})

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = trpc.project.getAll.useInfiniteQuery(
        {
            limit: 4,
            id_user: user?.id || "",
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!user,
        }
    )

    const bookmarkMutation = trpc.bookmark.create.useMutation({
        onSuccess: () => refetch(),
    })
    const unbookmarkMutation = trpc.bookmark.delete.useMutation({
        onSuccess: () => refetch(),
    })

    const likeMutation = trpc.likeProject.like.useMutation({
        onSuccess: () => refetch(),
    })
    const unlikeMutation = trpc.likeProject.unlike.useMutation({
        onSuccess: () => refetch(),
    })

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 100
            ) {
                if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    if (!isLoaded) return <div>Loading...</div>
    if (!user) return <div>Silakan login untuk melihat feeds.</div>
    if (!data) return <div>Loading...</div>

    const handleBookmark = (project: ProjectOneType) => {
        setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: true }))
        bookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: false })),
        })
    }

    const handleUnbookmark = (project: ProjectOneType) => {
        setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: false }))
        unbookmarkMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticBookmarks((prev) => ({ ...prev, [project.id]: true })),
        })
    }

    const handleLike = (project: ProjectOneType) => {
        setOptimisticLikes((prev) => ({ ...prev, [project.id]: true }))
        likeMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticLikes((prev) => ({ ...prev, [project.id]: false })),
        })
    }

    const handleUnlike = (project: ProjectOneType) => {
        setOptimisticLikes((prev) => ({ ...prev, [project.id]: false }))
        unlikeMutation.mutate({
            id_user: user.id,
            id_project: project.id,
        }, {
            onError: () => setOptimisticLikes((prev) => ({ ...prev, [project.id]: true })),
        })
    }

    return (
        <div className={cn("flex flex-col gap-4")}>
            {data?.pages.map((page, pageIndex) => (
                <div key={pageIndex}>
                    {
                        page.projects.map((project: ProjectOneType) => {
                            const isBookmarked = optimisticBookmarks[project.id] !== undefined
                                ? optimisticBookmarks[project.id]
                                : project.is_bookmarked

                            const isLiked = optimisticLikes[project.id] !== undefined
                                ? optimisticLikes[project.id]
                                : project.is_liked

                            return (
                                <div
                                    key={project.id}
                                    className="grid grid-cols-3 gap-4 mb-4"
                                >
                                    <div className="col-span-1">
                                        {/* Replace with actual image */}
                                        {project.image1 ? (
                                            <Image width={800} height={450} src={getPublicUrl(project.image1)} alt={project.slug + " image"} />
                                        ) : (
                                            <div className="bg-gray-200 h-24 w-full"></div>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-2">
                                        <Link className="text-lg font-semibold" href={`/project/${project.slug}`}>{project.title}</Link>
                                        <Link href={`/feeds/?category=${project.category.slug}`}>{project.category.title}</Link>
                                        <p>komentar: {project.count_comments}</p>

                                        <div className="flex gap-2 w-full">
                                            {!isBookmarked ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-fit"
                                                    onClick={() => handleBookmark(project)}
                                                >
                                                    Bookmark
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    className="w-fit"
                                                    onClick={() => handleUnbookmark(project)}
                                                >
                                                    Unbookmark
                                                </Button>
                                            )}
                                            {!isLiked ? (
                                                <Button
                                                    variant="outline"
                                                    className="w-fit"
                                                    onClick={() => handleLike(project)}
                                                >
                                                    Like
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    className="w-fit"
                                                    onClick={() => handleUnlike(project)}
                                                >
                                                    Unlike
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div >
            ))}
            {isFetchingNextPage && <p>Loading more...</p>}
        </div >
    )
}

export default FeedsPage