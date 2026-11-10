import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/db-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const notifications = await db.getInAppNotifications(userId);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll, userId } = body;

    if (markAll) {
      await db.markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ success: false, error: 'notificationId required' }, { status: 400 });
    }

    const updated = await db.markNotificationRead(notificationId);
    return NextResponse.json({ success: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update notification';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
