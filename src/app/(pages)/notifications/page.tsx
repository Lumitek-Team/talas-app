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

export default function NotificationPage() {
  const { user, isLoaded } = useUser();
  const [hasVisited, setHasVisited] = useState(false);
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
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

  const markAllAsRead = trpc.notification.makeReaded.useMutation({
    onSuccess: () => {
      // Refetch data after marking as read to update the UI
      refetch();
    }
  });

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
  }, [isLoaded, user, data, hasVisited]);

  const renderContent = () => {
    if (isLoading) {
      if (isLoading) {
        return <LoadingSpinner />;
      }
    }

    if (error) {
      return (
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
      );
    }

    const allNotifications = data?.pages.flatMap((page) => page.items) ?? [];

    if (!allNotifications.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BellIcon className="w-12 h-12 mb-4" />
          <p className="text-sm">No notifications</p>
        </div>
      );
    }

    const recent = allNotifications.filter((n) => !n.is_read);
    const earlier = allNotifications.filter((n) => n.is_read);

    return (
      <>
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
      </>
    );
  };

  return (
    <>
      <Sidebar activeItem="Notification" />
      <PageContainer title="Notifications" className="w-full">
        <div className="flex justify-center">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6 w-full ">
            <div className="flex-1 overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      </PageContainer>
      <FloatingActionButton />
    </>
  );
}
