import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationRepository } from '../../../application/ports/out/notification.repository';
import { Notification } from '../../../domain/model/notification';

@Injectable()
export class NotificationAdapter implements NotificationRepository {
  constructor(
    @Inject('Supabase') private readonly supabase: SupabaseClient
  ) {}

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const payload = {
      user_id: notification.userId,
      report_id: notification.reportId,
      title: notification.title,
      message: notification.message,
      read: notification.read,
    };

    const { data, error } = await this.supabase
      .from('notifications')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating notification in Supabase: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications from Supabase: ${error.message}`);
    }

    return (data ?? []).map((item) => this.mapToDomain(item));
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      throw new Error(`Error marking notification as read in Supabase: ${error.message}`);
    }
  }

  private mapToDomain(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      reportId: row.report_id,
      title: row.title,
      message: row.message,
      read: row.read,
      createdAt: row.created_at,
    };
  }
}
