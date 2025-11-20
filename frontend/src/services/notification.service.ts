import { api } from '../lib/api';
import { Notification } from '../types';

export const notificationService = {
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const response = await api.get(`notifications/${userId}`);
    return response;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`notifications/${id}/read`);
  }
};
