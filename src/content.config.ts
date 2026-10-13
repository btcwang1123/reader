import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/_*'], // 忽略 _ 開頭的檔案(例如模板檔),不會當成書
    base: './src/content/books'
  }),
  schema: z.object({
    // 書目
    title: z.string(),
    author: z.string(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    publishedYear: z.number().optional(),
    cover: z.string().optional(),
    // 全書總頁數;未填時退回 progress.totalPages
    pages: z.number().int().positive().optional(),
    // 閱讀狀態;abandoned = 棄讀
    status: z.enum(['wantToRead', 'reading', 'finished', 'abandoned']),
    rating: z.number().min(1).max(5).multipleOf(0.5).optional(),
    startedAt: z.coerce.date().optional(),
    finishedAt: z.coerce.date().optional(),
    // 重讀紀錄:第一次讀完記在 startedAt/finishedAt,之後每讀完一次加一筆
    rereads: z
      .array(
        z.object({
          startedAt: z.coerce.date().optional(),
          finishedAt: z.coerce.date(),
          note: z.string().optional()
        })
      )
      .default([]),
    progress: z
      .object({
        currentPage: z.number(),
        totalPages: z.number()
      })
      .optional(),
    // 分類與統計
    tags: z.array(z.string()).default([]),
    readingMinutes: z.number().optional(),
    // 明確記錄的閱讀日期;不從開始/讀完日期推算
    readingDates: z.array(z.coerce.date()).optional()
  })
});

// 書單 / 系列:每份書單一個 Markdown 檔,books 依序列出書的 slug(檔名)或書名
const lists = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/_*'],
    base: './src/content/lists'
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    books: z.array(z.string()).default([])
  })
});

export const collections = { books, lists };
