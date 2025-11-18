import { Controller, Post, Body, Inject } from '@nestjs/common';
import type { AuthUseCase } from '../../application/ports/in/auth.use-case';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AuthUseCase')
    private readonly authUseCase: AuthUseCase,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterAuthDto) {
    return this.authUseCase.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginAuthDto) {
    return this.authUseCase.login(loginDto);
  }
}
