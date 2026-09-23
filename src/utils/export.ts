import { getCollection } from 'astro:content';

/** 產生可供備份/匯出的完整書籍資料 */
export async function getExportData() {
  const all = await getCollection('books');
  // SITE 已包含 base 路徑,再接上頁面路徑即可(不要重複加 BASE_URL)
  const site = (import.meta.env.SITE ?? '').replace(/\/$/, '');
  const BASE = import.meta.env.BASE_URL;

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    books: all.map((b) => ({
      slug: b.id,
      title: b.data.title,
      author: b.data.author,
      isbn: b.data.isbn,
      publisher: b.data.publisher,
      publishedYear: b.data.publishedYear,
      cover: b.data.cover,
      status: b.data.status,
      rating: b.data.rating,
      startedAt: b.data.startedAt?.toISOString().slice(0, 10),
      finishedAt: b.data.finishedAt?.toISOString().slice(0, 10),
      progress: b.data.progress,
      readingMinutes: b.data.readingMinutes,
      tags: b.data.tags,
      url: site ? `${site}/books/${b.id}/` : `${BASE}books/${b.id}/`
    }))
  };
}
