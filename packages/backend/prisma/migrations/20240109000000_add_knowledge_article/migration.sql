-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('draft', 'published', 'archived');

-- DropOldKnowledgeArticle (if existed with different shape)
DROP TABLE IF EXISTS "KnowledgeArticle";

-- CreateTable
CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "ArticleStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_slug_idx" ON "KnowledgeArticle"("slug");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_category_idx" ON "KnowledgeArticle"("category");

-- CreateIndex
CREATE INDEX "KnowledgeArticle_status_idx" ON "KnowledgeArticle"("status");