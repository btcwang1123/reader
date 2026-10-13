import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { CARD_WIDTH as WIDTH, CARD_HEIGHT as HEIGHT, CARD_FONT, escapeXml, wrapText } from '../../utils/card';
import { getAllQuotes, type Quote } from '../../utils/quotes';

export const prerender = true;

export async function getStaticPaths() {
  const quotes = await getAllQuotes();
  return quotes.map((quote) => ({ params: { id: quote.id }, props: { quote } }));
}

/** 書摘分享卡:1200×630,適合貼到社群或 LINE */
export const GET: APIRoute = async ({ props }) => {
  const { quote } = props as { quote: Quote };
  // 句子越長字越小,最多 5 行
  const size = quote.text.length > 70 ? 40 : quote.text.length > 36 ? 48 : 58;
  const lines = wrapText(quote.text, Math.floor(980 / size), 5);
  const lineHeight = size * 1.6;
  const top = HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2 - 30;
  const textSvg = lines.map((line, i) =>
    `<text x="110" y="${top + i * lineHeight}" font-size="${size}" font-weight="600" fill="#292722">${escapeXml(line)}</text>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="${CARD_FONT}">
    <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#fbf6ed"/><stop offset="1" stop-color="#eee5d8"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="60" y="60" width="6" height="510" rx="3" fill="#d97757" opacity=".7"/>
    <text x="96" y="150" font-size="160" fill="#f0c9a8" opacity=".75">“</text>
    ${textSvg}
    <text x="110" y="540" font-size="26" fill="#756f65">《${escapeXml(quote.book.data.title)}》 ${escapeXml(quote.book.data.author)}</text>
    <text x="1090" y="540" font-size="20" letter-spacing="4" text-anchor="end" fill="#a6482d">拾頁書室</text>
  </svg>`;

  const output = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(output), { headers: { 'Content-Type': 'image/png' } });
};
