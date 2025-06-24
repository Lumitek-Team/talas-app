import React from "react";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  UserPlusIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";

type NotificationType = {
  id: string;
  title: string;
  created_at: Date | string;
  type: "like" | "comment" | "follow" | string;
  is_read: boolean;
};

type NotificationItemProps = {
  notification: NotificationType;
  onReadChange?: (id: string) => void;
};

const getNotificationIcon = (notification: NotificationType) => {
  const { type, title } = notification;
  
  switch (type?.toLowerCase()) {
    case 'like':
    case 'like_project':
      return HeartIcon;
    case 'comment':
    case 'comment_project':
      return ChatBubbleOvalLeftIcon;
    case 'follow':
    case 'follow_user':
      return UserPlusIcon;
    default:
      // If type doesn't match, check the title content for keywords
      const titleLower = title?.toLowerCase() || '';
      
      if (titleLower.includes('liked') || titleLower.includes('like')) {
        return HeartIcon;
      } else if (titleLower.includes('comment') || titleLower.includes('replied')) {
        return ChatBubbleOvalLeftIcon;
      } else if (titleLower.includes('follow') || titleLower.includes('started following')) {
        return UserPlusIcon;
      }
      
      // Default fallback
      return BellIcon;
  }
};

export function NotificationItems({
  notification,
  onReadChange,
}: NotificationItemProps) {
  const IconComponent = getNotificationIcon(notification);

  return (
    <div
      className={`px-4 py-3 flex items-start transition-all border-b border-gray-700 last:border-b-0 ${
        notification.is_read ? "opacity-70" : ""
      }`}
    >
      <div className="flex-shrink-0 mt-1 mr-4">
        <IconComponent className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className={`text-sm ${!notification.is_read ? "font-bold" : "font-medium"}`}>
          {notification.title}
        </p>
      </div>
      <div className="text-xs text-gray-400 ml-2">
        {formatDistanceToNow(new Date(notification.created_at), {
          addSuffix: true,
        })}
      </div>
    </div>
  );
}
