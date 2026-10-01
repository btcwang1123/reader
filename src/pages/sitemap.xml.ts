import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

/** 產出 sitemap.xml,涵蓋主要頁面與每一本書的永久網址 */
export const GET: APIRoute = async () => {
  // SITE 已含 base 路徑(例:https://user.github.io/reader/),直接接頁面路徑即可
  const site = (import.meta.env.SITE ?? '').replace(/\/$/, '');
  const books = await getCollection('books');
  const today = new Date().toISOString().slice(0, 10);

  // 書庫頁排在前面,其它靜態頁
  const pages = [
    '',
    'books/',
    'stats/',
    'timeline/',
    'calendar/',
    'about/',
    'export/'
  ].map((path) => `${site}/${path}`);

  const bookUrls = books.map((book) => `${site}/books/${book.id}/`);

  const urls = [...pages, ...bookUrls]
    .map(
      (loc) =>
        `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </url>`
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
