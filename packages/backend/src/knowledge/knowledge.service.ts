import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryArticlesDto, isAdmin = false) {
    const where: any = {};

    if (!isAdmin) {
      where.status = 'published';
    } else if (query.status) {
      where.status = query.status;
    } else {
      // admin sees draft and published (not archived by default)
      where.status = { in: ['draft', 'published'] };
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string, isAdmin = false) {
    const where: any = { slug };
    if (!isAdmin) {
      where.status = 'published';
    }

    const article = await this.prisma.knowledgeArticle.findFirst({ where });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }

  async create(dto: CreateArticleDto) {
    const existing = await this.prisma.knowledgeArticle.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug already exists');

    return this.prisma.knowledgeArticle.create({ data: dto });
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.findById(id);

    if (dto.slug) {
      const existing = await this.prisma.knowledgeArticle.findFirst({
        where: { slug: dto.slug, NOT: { id } },
      });
      if (existing) throw new ConflictException('Slug already exists');
    }

    return this.prisma.knowledgeArticle.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.knowledgeArticle.delete({ where: { id } });
  }

  private async findById(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Article not found');
    return article;
  }
}