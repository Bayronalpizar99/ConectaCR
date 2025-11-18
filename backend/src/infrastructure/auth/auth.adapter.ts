import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthRepository } from '../../application/ports/out/auth.repository';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthAdapter implements AuthRepository {
  constructor(
    @Inject('Supabase') private readonly supabase: SupabaseClient
  ) {}

  async register(registerDto: RegisterAuthDto): Promise<any> {
    const { data, error } = await this.supabase.auth.signUp({
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
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return data;
  }
}
