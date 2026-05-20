import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export const KNOWLEDGE_CATEGORIES = [
  'Основы диабета',
  'Гипогликемия',
  'Гипергликемия',
  'Питание',
  'ХЕ',
  'Инсулин',
  'Физическая активность',
  'Вопросы врачу',
  'Расходники',
  'Частые вопросы',
] as const;

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsIn(KNOWLEDGE_CATEGORIES)
  category: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status: 'draft' | 'published' | 'archived' = 'draft';
}