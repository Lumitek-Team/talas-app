"use client"

import { trpc } from "@/app/_trpc/client"
import { ProjectOneType } from "@/lib/type"
import { cn, getPublicUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"

const ArchivePage = () => {
    const { user, isLoaded } = useUser()

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.project.getArchived.useInfiniteQuery(
        {
            limit: 4,
            id_user: user?.id || "",
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!user,
        }
    )

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
    if (!user) return <div>Silakan login untuk melihat arsip.</div>
    if (!data) return <div>Loading...</div>

    const isEmpty =
        !data.pages ||
        data.pages.length === 0 ||
        data.pages.every((page) => !page.projects || page.projects.length === 0);

    if (isEmpty) return <div>data not found</div>;

    return (
        <div className={cn("flex flex-col gap-4")}>
            {data?.pages.map((page, pageIndex) => (
                <div key={pageIndex}>
                    {page.projects.map((project: ProjectOneType) => (
                        <div
                            key={project.id}
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
                                <Link href={`/feeds/?category=${project.category.slug}`}>{project.category.title}</Link>
                                <p>komentar: {project.count_comments}</p>
                                {/* Tidak ada tombol bookmark */}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
            {isFetchingNextPage && <p>Loading more...</p>}
        </div>
    )
}

export default ArchivePage