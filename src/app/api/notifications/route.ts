import { NextRequest, NextResponse } from 'next/server';

// Type definitions
interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow';
  user: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface NotificationsDB {
  recent: Notification[];
  earlier: Notification[];
}

interface UpdateNotificationRequest {
  id: number;
  isRead: boolean;
}

interface ApiResponse {
  success?: boolean;
  error?: string;
}

// Database mock
const notificationsDB: NotificationsDB = {
  recent: [
    {
      id: 1,
      type: 'like',
      user: 'Nadia',
      content: 'liked your project "Next-Gen Portfolio Website"',
      time: new Date().toISOString(),
      isRead: false
    },
    {
      id: 2,
      type: 'comment',
      user: 'Andi',
      content: 'commented on your project "E-commerce Dashboard": "Great design, clean and modern!"',
      time: new Date().toISOString(),
      isRead: true
    }
  ],
  earlier: [
    {
      id: 3,
      type: 'follow',
      user: 'Rafi',
      content: 'started following you',
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true
    }
  ]
};

// Helpers
const categorizeNotifications = (allNotifications: Notification[]): NotificationsDB => {
  const now = new Date();
  const result: NotificationsDB = { recent: [], earlier: [] };

  allNotifications.forEach(notif => {
    const notifTime = new Date(notif.time);
    const diffInHours = (now.getTime() - notifTime.getTime()) / (1000 * 60 * 60);
    diffInHours < 24 ? result.recent.push(notif) : result.earlier.push(notif);
  });

  return result;
};

const updateNotificationStatus = (id: number, isRead: boolean): boolean => {
  let found = false;

  const updateIfMatch = (notif: Notification): Notification => {
    if (notif.id === id) {
      found = true;
      return { ...notif, isRead };
    }
    return notif;
  };

  notificationsDB.recent = notificationsDB.recent.map(updateIfMatch);
  if (!found) {
    notificationsDB.earlier = notificationsDB.earlier.map(updateIfMatch);
  }

  return found;
};

// Handlers
export async function GET(): Promise<NextResponse<NotificationsDB | ApiResponse>> {
  try {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const allNotifications = [...notificationsDB.recent, ...notificationsDB.earlier];
    return NextResponse.json(categorizeNotifications(allNotifications));
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const data: UpdateNotificationRequest = await request.json();
    
    if (!data.id || typeof data.isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    if (!updateNotificationStatus(data.id, data.isRead)) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function PUT(): Promise<NextResponse<ApiResponse>> {
  try {
    const markAllAsRead = (notifs: Notification[]) => notifs.map(n => ({ ...n, isRead: true }));
    
    notificationsDB.recent = markAllAsRead(notificationsDB.recent);
    notificationsDB.earlier = markAllAsRead(notificationsDB.earlier);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}