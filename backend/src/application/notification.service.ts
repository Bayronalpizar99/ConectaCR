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

  async markAsRead(id: string): Promise<void> {
    return this.notificationRepository.markAsRead(id);
  }
}
