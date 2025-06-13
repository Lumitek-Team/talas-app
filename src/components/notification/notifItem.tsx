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

const iconMap = {
  like: HeartIcon,
  comment: ChatBubbleOvalLeftIcon,
  follow: UserPlusIcon,
};

export function NotificationItems({
  notification,
  onReadChange,
}: NotificationItemProps) {
  const IconComponent =
    iconMap[notification.type as keyof typeof iconMap] || BellIcon;

  const handleClick = () => {
    if (!notification.is_read && onReadChange) {
      onReadChange(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 flex items-start hover:bg-gray-900 cursor-pointer transition-all ${
        notification.is_read ? "opacity-70" : ""
      }`}
    >
      <div className="flex-shrink-0 mt-1 mr-4">
        <IconComponent className="w-5 h-5 text-green-500" />
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
