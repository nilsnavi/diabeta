import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Public endpoints
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('articles')
  findAll(@Query() query: QueryArticlesDto) {
    return this.knowledgeService.findAll(query, false);
  }

  @Get('articles/:slug')
  findOne(@Param('slug') slug: string) {
    return this.knowledgeService.findBySlug(slug, false);
  }
}

// Admin endpoints
@UseGuards(JwtAuthGuard)
@Controller('admin/knowledge')
export class KnowledgeAdminController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('articles')
  findAll(@Query() query: QueryArticlesDto) {
    return this.knowledgeService.findAll(query, true);
  }

  @Post('articles')
  create(@Body() dto: CreateArticleDto) {
    return this.knowledgeService.create(dto);
  }

  @Patch('articles/:id')
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.knowledgeService.update(id, dto);
  }

  @Delete('articles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.knowledgeService.remove(id);
  }
}