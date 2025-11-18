import { RegisterAuthDto } from "../../../infrastructure/auth/dto/register-auth.dto";
import { LoginAuthDto } from "../../../infrastructure/auth/dto/login-auth.dto";

export interface AuthRepository {
  register(registerDto: RegisterAuthDto): Promise<any>;
  login(loginDto: LoginAuthDto): Promise<any>;
}
