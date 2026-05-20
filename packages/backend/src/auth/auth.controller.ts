import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TelegramAuthDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  @HttpCode(HttpStatus.OK)
  loginWithTelegram(@Body() dto: TelegramAuthDto) {
    return this.authService.loginWithTelegram(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Request() req: any) {
    return this.authService.validateUser(req.user.id);
  }
}