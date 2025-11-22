import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from '../../application/ports/out/auth.repository';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthAdapter implements AuthRepository {
  constructor(
    @Inject('Supabase') private readonly supabase: SupabaseClient,
    private readonly configService: ConfigService
  ) {}

  private getAuthClient() {
    return createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? 
      this.configService.get<string>('SUPABASE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  async register(registerDto: RegisterAuthDto): Promise<any> {
    const authClient = this.getAuthClient();
    const { data, error } = await authClient.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
      options: {
        data: {
          name: registerDto.name,
          role: 'citizen' // Asignar rol por defecto
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new ConflictException('User already exists');
      }
      throw new Error(`Error signing up: ${error.message}`);
    }
    
    return data;
  }

  async login(loginDto: LoginAuthDto): Promise<any> {
    const authClient = this.getAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return data;
  }
}
