import { Inject, Injectable } from '@nestjs/common';
import type { NotificationRepository } from './ports/out/notification.repository';
import { Notification } from '../domain/model/notification';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepository')
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    return this.notificationRepository.create(notification);
  }

  async notifyAdmins(title: string, message: string, reportId: string): Promise<void> {
    const adminIds = await this.notificationRepository.findAdmins();
    
    const notifications = adminIds.map(adminId => ({
      userId: adminId,
      reportId,
      title,
      message,
      read: false,
    }));

    await Promise.all(notifications.map(n => this.notificationRepository.create(n)));
  }

  async markAsRead(id: string): Promise<void> {
    return this.notificationRepository.markAsRead(id);
  }
}
