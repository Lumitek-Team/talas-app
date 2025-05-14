"use client"

import { trpc } from "@/app/_trpc/client"
import { ProjectOneType } from "@/lib/type"
import { cn, getPublicUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

const FeedsPage = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.project.getAll.useInfiniteQuery(
        {
            limit: 4,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
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

    if (!data) return <div>Loading...</div>

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
                                {/* Replace with actual image */}
                                {project.image1 ? (
                                    <Image width={800} height={450} src={getPublicUrl(project.image1)} alt={project.slug + " image"} />
                                ) : (
                                    <div className="bg-gray-200 h-24 w-full"></div>
                                )}
                            </div>
                            <div className="col-span-2">
                                <Link href={`/project/${project.slug}`}>
                                    {project.title}
                                </Link>

                            </div>
                        </div>
                    ))}
                </div>
            ))}
            {isFetchingNextPage && <p>Loading more...</p>}
        </div>
    )
}

export default FeedsPage