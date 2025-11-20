import { Notification } from "../../../domain/model/notification";

export interface NotificationRepository {
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  findByUserId(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}
