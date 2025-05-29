import React from 'react';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  UserPlusIcon,
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

type NotificationType = {
  id: string;
  user: string;
  content: string;
  time: string;
  type: 'like' | 'comment' | 'follow' | string;
  isRead: boolean;
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

export function NotificationItems({ notification, onReadChange }: NotificationItemProps) {
  const IconComponent = iconMap[notification.type as keyof typeof iconMap] || null;

  const handleClick = () => {
    if (!notification.isRead && onReadChange) {
      onReadChange(notification.id);
    }
  };

  return (
    <div
      className={`px-4 py-3 flex items-start hover:bg-gray-900 cursor-pointer transition-all ${
        notification.isRead ? 'opacity-70' : ''
      }`}
      onClick={handleClick}
    >
      {IconComponent && (
        <div className="flex-shrink-0 mt-1 mr-4">
          <IconComponent className="w-5 h-5 text-green-500" />
        </div>
      )}
      <div className="flex-1">
        <p className={`text-sm ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
          <span className={!notification.isRead ? 'font-bold' : 'font-medium'}>
            {notification.user}
          </span>{' '}
          {notification.content}
        </p>
      </div>
      <div className="text-xs text-gray-400 ml-2">
        {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
      </div>
    </div>
  );
}