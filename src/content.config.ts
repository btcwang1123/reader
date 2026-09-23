import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    // 書目
    title: z.string(),
    author: z.string(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    publishedYear: z.number().optional(),
    cover: z.string().optional(),
    // 閱讀狀態
    status: z.enum(['wantToRead', 'reading', 'finished']),
    rating: z.number().min(1).max(5).multipleOf(0.5).optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
    progress: z
      .object({
        currentPage: z.number(),
        totalPages: z.number()
      })
      .optional(),
    // 分類與統計
    tags: z.array(z.string()).default([]),
    readingMinutes: z.number().optional()
  })
});

export const collections = { books };
