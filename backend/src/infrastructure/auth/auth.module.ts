import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/auth.service';
import { AuthAdapter } from './auth.adapter';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AuthUseCase',
      useClass: AuthService,
    },
    {
      provide: 'AuthRepository',
      useClass: AuthAdapter,
    },
  ],
})
export class AuthModule {}
