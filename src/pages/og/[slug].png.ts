import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const prerender = true;

const WIDTH = 1200;
const HEIGHT = 630;
const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[char]!);

function wrapText(text: string, limit: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  let width = 0;
  for (const char of text) {
    const charWidth = /[\x00-\xff]/.test(char) ? 0.55 : 1;
    if (width + charWidth > limit && line) {
      lines.push(line);
      line = '';
      width = 0;
    }
    line += char;
    width += charWidth;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}…`;
  }
  return lines;
}

export async function getStaticPaths() {
  const books = await getCollection('books');
  return books.map((book) => ({ params: { slug: book.id }, props: { book } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { book } = props as { book: Awaited<ReturnType<typeof getCollection<'books'>>>[number] };
  const titleLines = wrapText(book.data.title, 16, 2);
  const titleSvg = titleLines.map((line, i) =>
    `<text x="96" y="${282 + i * 78}" font-size="64" font-weight="700" fill="#292722">${escapeXml(line)}</text>`
  ).join('');
  const stars = book.data.rating ? '★'.repeat(Math.floor(book.data.rating)) + (book.data.rating % 1 ? '½' : '') : '';
  const fallbackCover = `<g><rect x="820" y="72" width="270" height="410" rx="16" fill="#3c332d"/><rect x="842" y="72" width="12" height="410" fill="#a6482d"/><text x="955" y="270" text-anchor="middle" font-size="32" fill="#f7f3eb">${escapeXml(book.data.title.slice(0, 12))}</text></g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#fbf6ed"/><stop offset="1" stop-color="#eee5d8"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/><circle cx="1120" cy="65" r="170" fill="#e8d9c6" opacity=".42"/><path d="M0 540Q320 480 640 550T1200 520V630H0Z" fill="#a6482d" opacity=".08"/>
    <text x="96" y="108" font-size="22" letter-spacing="5" fill="#a6482d">拾頁書室 · 閱讀紀錄</text>
    ${titleSvg}<text x="100" y="${titleLines.length > 1 ? 445 : 390}" font-size="24" fill="#756f65">${escapeXml(book.data.author)}</text>
    <text x="100" y="500" font-size="27" fill="#c26a47">${escapeXml(stars)}</text>
    ${book.data.cover ? '' : fallbackCover}<text x="820" y="530" font-size="18" fill="#756f65">閱讀心得・書摘與筆記</text>
  </svg>`;

  let output = await sharp(Buffer.from(svg)).png().toBuffer();
  if (book.data.cover?.startsWith('/')) {
    try {
      const coverBuffer = await readFile(resolve(process.cwd(), 'public', book.data.cover.replace(/^\/+/, '')));
      const cover = await sharp(coverBuffer).resize(270, 410, { fit: 'cover' }).png().toBuffer();
      output = await sharp(output).composite([{ input: cover, left: 820, top: 72 }]).png().toBuffer();
    } catch {
      // 缺少本地封面時保留書名封面樣式
    }
  }

  return new Response(output, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
};
