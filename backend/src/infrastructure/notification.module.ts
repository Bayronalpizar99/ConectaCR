import { Module } from '@nestjs/common';
import { NotificationController } from './driving-adapters/http/notification.controller';
import { NotificationService } from '../application/notification.service';
import { NotificationAdapter } from './driven-adapters/supabase/notification.adapter';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    {
      provide: 'NotificationRepository',
      useClass: NotificationAdapter,
    },
  ],
  exports: ['NotificationRepository', NotificationService],
})
export class NotificationModule {}
