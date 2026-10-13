import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

/** 產出 sitemap.xml,涵蓋主要頁面、每一本書、標籤頁與年度回顧 */
export const GET: APIRoute = async () => {
  // SITE 已含 base 路徑(例:https://user.github.io/reader/),直接接頁面路徑即可
  const site = (import.meta.env.SITE ?? '').replace(/\/$/, '');
  const books = await getCollection('books');
  const tags = [...new Set(books.flatMap((book) => book.data.tags))];
  // 與 recap/[year].astro 的 getStaticPaths 相同條件
  const years = [...new Set(books.flatMap((book) => book.data.finishedAt ? [book.data.finishedAt.getFullYear()] : []))];

  // 書庫頁排在前面,其它靜態頁
  const pages = [
    '',
    'books/',
    'stats/',
    'timeline/',
    'calendar/',
    'about/',
    'export/',
    ...books.map((book) => `books/${encodeURIComponent(book.id)}/`),
    ...tags.map((tag) => `tags/${encodeURIComponent(tag)}/`),
    ...years.map((year) => `recap/${year}/`)
  ];

  // 不輸出 lastmod:建置日期不代表內容真的更新,錯誤的 lastmod 反而會被搜尋引擎忽略
  const urls = pages.map((path) => `  <url>\n    <loc>${site}/${path}</loc>\n  </url>`).join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
