import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SupabaseStorageService } from './supabase-storage.service';

@Module({
  providers: [
    {
      provide: 'Supabase',
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey =
          configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ??
          configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase URL or Key not found in environment variables');
        }

        return createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        });
      },
      inject: [ConfigService],
    },
    SupabaseStorageService,
  ],
  exports: ['Supabase', SupabaseStorageService],
})
export class SupabaseModule {}
