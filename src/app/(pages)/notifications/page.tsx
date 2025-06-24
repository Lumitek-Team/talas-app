"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { NotificationItems } from "@/components/notification/notifItem";
import { LoadingSpinner } from "@/components/ui/loading";
import { BellIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";


export default function NotificationPage() {
  const { user: userclerk, isLoaded } = useUser();
  const user = trpc.user.getById.useQuery(
    { id: userclerk?.id ?? "" },
    { enabled: isLoaded && !!userclerk?.id }
  ).data?.data;

  const [hasVisited, setHasVisited] = useState(false);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.user.getNotification.useInfiniteQuery(
    {
      id_user: user?.id ?? "",
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!user?.id,
    }
  );

  const requestCollaborationRaw = trpc.user.getRequestCollab.useQuery(
    user?.id ?? "", // Ensure user?.id is used safely
    { enabled: isLoaded && !!userclerk?.id && !!user?.id } // Ensure all conditions are met
  )

  const requestCollaboration = requestCollaborationRaw.data?.data ?? [];

  const markAllAsRead = trpc.notification.makeReaded.useMutation();

  useEffect(() => {
    if (!isLoaded || !user?.id || !data || hasVisited) return;

    const allNotifications = data.pages.flatMap((page) => page.items);
    const hasUnread = allNotifications.some((n) => !n.is_read);
    if (hasUnread) {
      markAllAsRead.mutate({ id_user: user.id });
      setHasVisited(true);
    } else {
      setHasVisited(false);
    }
  }, [isLoaded, user, data, hasVisited, markAllAsRead]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const allNotifications = Array.from(
    new Map(
      (data?.pages.flatMap((page) => page.items) ?? []).map((notif) => [notif.id, notif])
    ).values()
  ); // Deduplicate notifications by their id
  const recent = allNotifications.filter((n) => !n.is_read);
  const earlier = allNotifications.filter((n) => n.is_read);

  const acceptCollab = trpc.collaboration.accept.useMutation({
    onMutate: (id) => setProcessingId(id),
    onSettled: () => {
      setProcessingId(null);
      requestCollaborationRaw.refetch();
    }
  });
  const rejectCollab = trpc.collaboration.reject.useMutation({
    onMutate: (id) => setProcessingId(id),
    onSettled: () => {
      setProcessingId(null);
      requestCollaborationRaw.refetch();
    }
  });

  return (
    <>
      <Sidebar activeItem="Notification" />
      <PageContainer title="Notifications" className="w-full">
        <div className="flex justify-center">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-full ">
            <div className="flex-1 overflow-y-auto">
              {/* {renderContent()} */}
              {isLoading && (
                <LoadingSpinner />
              )}
              {error && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <BellIcon className="w-12 h-12 mb-4" />
                  <p className="text-sm mb-2">{error.message}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-green-500 pointer hover:text-green-400"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!allNotifications.length && !requestCollaboration?.length && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <BellIcon className="w-12 h-12 mb-4" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}

              {/* notification */}
              {requestCollaboration && requestCollaboration.length > 0 && (
                <section className="space-y-4 mb-6">
                  <h2 className="text-sm text-gray-400 font-medium mb-4">Request Collaboration</h2>
                  {requestCollaboration.map((request) => (
                    <div
                      className={`mb-4 flex gap-x-4 justify-between items-center`} key={request.id} >
                      <div className="flex items-center gap-x-4" >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={request.project.project_user[0]?.user.photo_profile ?? undefined} />
                          <AvatarFallback>{getInitials(request.project.project_user[0]?.user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="w-full" >
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(request.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                          <p className="font-medium text-sm w-full flex-wrap">
                            <span>{request.project.project_user[0]?.user.username}</span> invited you as a collaborator on <span>{request.project.title}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-x-4">
                        <Button
                          variant="outline"
                          size={"sm"}
                          className=""
                          onClick={() => {
                            acceptCollab.mutate(request.id);
                          }}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id && acceptCollab.isPending ? "Accepting..." : "Accept"}
                        </Button>
                        <Button
                          variant="destructive"
                          size={"sm"}
                          className=""
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
                </section>
              )}

              {recent.length > 0 && (
                <section className="space-y-4 mb-6">
                  <h2 className="text-sm text-gray-400 font-medium mb-2">Recent</h2>
                  {recent.map((notification) => (
                    <NotificationItems
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </section>
              )}

              {earlier.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-sm text-gray-400 font-medium mb-2">Previous</h2>
                  {earlier.map((notification) => (
                    <NotificationItems
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </section>
              )}

              {hasNextPage && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-green-500 text-sm hover:underline"
                  >
                    {isFetchingNextPage ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
