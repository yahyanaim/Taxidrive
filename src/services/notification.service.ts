import {
  Notification,
  NotificationChannel,
  NotificationType,
} from '@prisma/client';

import { prisma } from '../db/prisma';

export const notificationService = {
  create(input: {
    userId: string;
    type: NotificationType;
    channel: NotificationChannel;
    title: string;
    body: string;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        channel: input.channel,
        title: input.title,
        body: input.body,
      },
    });
  },

  listForUser(userId: string, params?: { unreadOnly?: boolean; take?: number; skip?: number }) {
    const { unreadOnly = false, take = 50, skip = 0 } = params ?? {};

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { readAt: null } : {}),
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });
  },

  markRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  },
};
