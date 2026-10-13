/**
 * 依 ISBN 抓封面的共用邏輯(fetch-cover 與 new-book 都會用)
 *
 * 來源依序嘗試:
 *  1. Google Books 封面(不需 API key,台灣書收錄較多)
 *  2. Open Library
 * 抓到後統一縮成寬 600px 的 JPG,存到 public/covers/<isbn>.jpg
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const COVERS_DIR = new URL('../public/covers/', import.meta.url);

/** Google Books 沒有封面時回傳的「image not available」佔位圖固定是 575×750 的 PNG */
function isGooglePlaceholder(meta) {
  return meta.format === 'png' && meta.width === 575 && meta.height === 750;
}

async function tryGoogle(isbn) {
  const res = await fetch(`https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=0`);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  // 太小的通常是 1×1 或縮圖,當作沒有
  if (isGooglePlaceholder(meta) || (meta.width ?? 0) < 100) return null;
  return buf;
}

async function tryOpenLibrary(isbn) {
  // default=false:沒有封面時回 404,而不是回傳一張 1×1 的空白圖
  const res = await fetch(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`);
  if (!res.ok || !res.headers.get('content-type')?.includes('image')) return null;
  return Buffer.from(await res.arrayBuffer());
}

/**
 * 抓封面並存檔;成功回傳 frontmatter 用的路徑(例:/covers/978xxx.jpg),失敗回傳 null
 * @param {string} isbn
 * @param {(message: string) => void} [log]
 */
export async function fetchCover(isbn, log = () => {}) {
  const clean = String(isbn).replace(/[^0-9Xx]/g, '');
  for (const [name, source] of [['Google Books', tryGoogle], ['Open Library', tryOpenLibrary]]) {
    try {
      const buf = await source(clean);
      if (!buf) {
        log(`   ${name}: 沒有封面`);
        continue;
      }
      const jpg = await sharp(buf).resize({ width: 600, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      await mkdir(COVERS_DIR, { recursive: true });
      await writeFile(new URL(`${clean}.jpg`, COVERS_DIR), jpg);
      log(`   ${name}: 已存到 public/covers/${clean}.jpg (${(jpg.length / 1024).toFixed(1)} KB)`);
      return `/covers/${clean}.jpg`;
    } catch (err) {
      log(`   ${name}: 抓取失敗 (${err.cause?.code ?? err.message})`);
    }
  }
  return null;
}
