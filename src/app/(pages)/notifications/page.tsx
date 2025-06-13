"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { PageContainer } from "@/components/ui/page-container";
import { NotificationItems } from '@/components/notification/notifItem';
import { BellIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

// Types
type Notification = {
  id: number;
  user: string;
  content: string;
  time: string;
  type: 'like' | 'comment' | 'follow' | string;
  isRead: boolean;
};

type NotificationGroup = {
  recent: Notification[];
  earlier: Notification[];
};

// API Service
const NotificationService = {
  fetchAll: async (): Promise<NotificationGroup> => {
    const response = await fetch('/api/notifications', {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to fetch: ${response.status} - ${errorData.message || 'Unknown error'}`
      );
    }
    return response.json();
  },

  markAsRead: async (id: number): Promise<boolean> => {
    const response = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isRead: true }),
    });

    if (!response.ok) throw new Error('Failed to update notification');
    return (await response.json()).success;
  },

  markAllAsRead: async (): Promise<boolean> => {
    const response = await fetch('/api/notifications', { method: 'PUT' });
    if (!response.ok) throw new Error('Failed to mark all as read');
    return (await response.json()).success;
  },
};

export default function NotificationPage() {
  const [state, setState] = useState<{
    notifications: NotificationGroup;
    isLoading: boolean;
    error: string | null;
  }>({
    notifications: { recent: [], earlier: [] },
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await NotificationService.fetchAll();
        const hasUnread = [...data.recent, ...data.earlier].some(n => !n.isRead);

        if (hasUnread) {
          await NotificationService.markAllAsRead();
          setState(prev => ({
            ...prev,
            notifications: {
              recent: data.recent.map(n => ({ ...n, isRead: true })),
              earlier: data.earlier.map(n => ({ ...n, isRead: true })),
            },
          }));
        } else {
          setState(prev => ({ ...prev, notifications: data }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load notifications',
        }));
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadNotifications();
  }, []);

  const handleReadChange = async (id: number) => {
    setState(prev => ({
      ...prev,
      notifications: {
        recent: prev.notifications.recent.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ),
        earlier: prev.notifications.earlier.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ),
      },
    }));

    try {
      await NotificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setState(prev => ({
      ...prev,
      notifications: {
        recent: prev.notifications.recent.map(n => ({ ...n, isRead: true })),
        earlier: prev.notifications.earlier.map(n => ({ ...n, isRead: true })),
      },
    }));

    try {
      await NotificationService.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const unreadCount = [...state.notifications.recent, ...state.notifications.earlier]
    .filter(n => !n.isRead).length;

  const renderContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-2">
            {[0, 0.1, 0.2].map(delay => (
              <div 
                key={delay}
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BellIcon className="w-12 h-12 mb-4" />
          <p className="text-sm mb-2">{state.error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm text-green-500 hover:text-green-400"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!state.notifications.recent.length && !state.notifications.earlier.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <BellIcon className="w-12 h-12 mb-4" />
          <p className="text-sm">No notifications</p>
        </div>
      );
    }

    return (
      <>
        {state.notifications.recent.length > 0 && (
          <NotificationSection 
            title="Recent"
            notifications={state.notifications.recent}
            onReadChange={handleReadChange}
          />
        )}

        {state.notifications.earlier.length > 0 && (
          <NotificationSection 
            title="Earlier"
            notifications={state.notifications.earlier}
            onReadChange={handleReadChange}
            showBorder={state.notifications.recent.length > 0}
          />
        )}
      </>
    );
  };

  return (
    <div className="h-screen bg-black text-white">
      <Sidebar activeItem="Notification" />
      <PageContainer title="Notifications" className="bg-black text-white w-full">
        <div className="flex flex-col w-full max-w-lg mx-auto">
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </PageContainer>
      <FloatingActionButton />
    </div>
  );
}

type NotificationSectionProps = {
  title: string;
  notifications: Notification[];
  onReadChange: (id: number) => void;
  showBorder?: boolean;
};

const NotificationSection = ({
  title,
  notifications,
  onReadChange,
  showBorder = false,
}: NotificationSectionProps) => (
  <div className={`py-4 ${showBorder ? 'border-t border-gray-800' : ''}`}>
    <h2 className="px-4 text-sm font-medium mb-2 text-gray-400">{title}</h2>
    {notifications.map(notification => (
      <NotificationItems
        key={notification.id}
        notification={{
          ...notification,
          id: notification.id.toString(),
        }}
        onReadChange={(id) => onReadChange(Number(id))}
      />
    ))}
  </div>
);