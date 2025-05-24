"use client"

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const NotificationPage = () => {
    const { user, isLoaded: loadedUser } = useUser();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.user.getNotification.useInfiniteQuery(
        {
            id_user: user?.id || "",
            limit: 4,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
            enabled: !!user,
        }
    );

    const [processingId, setProcessingId] = useState<string | null>(null);

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

    const requestCollab = trpc.user.getRequestCollab.useQuery(user ? user.id : "")
    const acceptCollab = trpc.collaboration.accept.useMutation({
        onMutate: (id) => setProcessingId(id),
        onSettled: () => {
            setProcessingId(null);
            requestCollab.refetch();
        }
    });
    const rejectCollab = trpc.collaboration.reject.useMutation({
        onMutate: (id) => setProcessingId(id),
        onSettled: () => {
            setProcessingId(null);
            requestCollab.refetch();
        }
    });
    if (!loadedUser || !data) return <div>Loading...</div>;
    if (!user) return redirect("/sign-in");

    const isEmpty = data.pages.every((page) => page.items.length === 0);
    return (
        <div>
            <p className="font-bold text-lg">Request Collab</p>
            {requestCollab.data?.map((request) => (
                <div
                    key={request.id}
                    className="bg-zinc-800 px-8 py-4"
                >
                    <p>
                        <span className="font-semibold">{request.project.project_user[0].user.username}</span> invite you as collaborator on <span className="font-semibold">{request.project.title}</span>
                    </p>
                    <div className="flex gap-x-4">
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                acceptCollab.mutate(request.id);
                            }}
                            disabled={processingId === request.id}
                        >
                            {processingId === request.id && acceptCollab.isPending ? "Accepting..." : "Accept"}
                        </Button>
                        <Button
                            variant="destructive"
                            className="mt-4"
                            onClick={() => {
                                rejectCollab.mutate(request.id);
                            }}
                            disabled={processingId === request.id}
                        >
                            {processingId === request.id && rejectCollab.isPending ? "Rejecting..." : "Reject"}
                        </Button>
                    </div>
                </div>
            ))}
            <p className="font-bold text-lg">Notifikasi</p>
            {isEmpty ? <p>You have no notifications.</p> : (

                <div className={cn("flex flex-col gap-4")}>

                    {data.pages.map((page, pageIndex) => (
                        <div key={pageIndex}>
                            {page.items.map((notification) => {
                                if (!notification) return null;

                                return (
                                    <div
                                        key={notification.id}
                                    >
                                        <div
                                            className={notification.is_read ? "bg-zinc-900 px-8 py-32" : "bg-zinc-800 px-8 py-80"}
                                        >
                                            <p>{notification.title}</p>
                                        </div>
                                        <Separator className="my-2" />
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    {isFetchingNextPage && <p>Loading more...</p>}
                </div>
            )}

        </div>
    )
}

export default NotificationPage