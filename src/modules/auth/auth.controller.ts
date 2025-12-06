import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, AuthResponseDto, LoginResponseDto } from './dto/auth.dto';
import { ApiResponse } from '../../common';
import { DocsSignup, DocsLogin } from './docs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @DocsSignup()
  async signup(@Body() signupDto: SignupDto): Promise<ApiResponse<AuthResponseDto>> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @DocsLogin()
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<LoginResponseDto>> {
    return this.authService.login(loginDto);
  }
}
