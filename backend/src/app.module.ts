import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReportModule } from './infrastructure/report.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { NotificationModule } from './infrastructure/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables de entorno estén disponibles en toda la app
    }),
    ReportModule,
    AuthModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}


