import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
import { AnalyzeDiaryDto } from './dto/analyze-diary.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@CurrentUser() user: { id: string }, @Body() dto: ChatDto) {
    return this.aiService.chat(user.id, dto.message);
  }

  @Post('analyze-diary')
  analyzeDiary(
    @CurrentUser() user: { id: string },
    @Body() dto: AnalyzeDiaryDto,
  ) {
    return this.aiService.analyzeDiary(user.id, dto.days ?? 14);
  }

  @Get('history')
  getHistory(@CurrentUser() user: { id: string }) {
    return this.aiService.getHistory(user.id);
  }

  @Delete('history')
  deleteHistory(@CurrentUser() user: { id: string }) {
    return this.aiService.deleteHistory(user.id);
  }
}