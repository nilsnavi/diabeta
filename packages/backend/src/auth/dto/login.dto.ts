import { IsString, IsNotEmpty } from 'class-validator';

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  initData: string;
}

// Alias for backward compatibility
export { TelegramAuthDto as LoginDto };