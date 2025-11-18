import { Inject, Injectable } from '@nestjs/common';
import type { AuthUseCase } from './ports/in/auth.use-case';
import type { AuthRepository } from './ports/out/auth.repository';
import { RegisterAuthDto } from '../infrastructure/auth/dto/register-auth.dto';
import { LoginAuthDto } from '../infrastructure/auth/dto/login-auth.dto';

@Injectable()
export class AuthService implements AuthUseCase {
  constructor(
    @Inject('AuthRepository')
    private readonly authRepository: AuthRepository,
  ) {}

  register(registerDto: RegisterAuthDto): Promise<any> {
    return this.authRepository.register(registerDto);
  }

  login(loginDto: LoginAuthDto): Promise<any> {
    return this.authRepository.login(loginDto);
  }
}
