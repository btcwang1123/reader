#!/usr/bin/env node
/**
 * 依 ISBN 從 Open Library 抓取封面存入 public/covers/
 * 用法:node scripts/fetch-cover.mjs <isbn>
 *   或  npm run fetch-cover -- <isbn>
 */
import { mkdir, writeFile } from 'node:fs/promises';

const [isbn] = process.argv.slice(2);
if (!isbn) {
  console.error('用法: node scripts/fetch-cover.mjs <isbn>');
  process.exit(1);
}

// default=false:沒有封面時回 404,而不是回傳一張 1×1 的空白圖
const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
const dir = new URL('../public/covers/', import.meta.url);
const out = new URL(`${isbn}.jpg`, dir);

try {
  const res = await fetch(url);
  if (!res.ok || !res.headers.get('content-type')?.includes('image')) {
    console.log(`⚠️  找不到 ${isbn} 的封面 (HTTP ${res.status})`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dir, { recursive: true });
  await writeFile(out, buf);
  console.log(`✅ 已存到 public/covers/${isbn}.jpg (${(buf.length / 1024).toFixed(1)} KB)`);
  console.log(`   在該書 frontmatter 加入: cover: "/covers/${isbn}.jpg"`);
} catch (err) {
  console.error('❌ 抓取失敗:', err.message);
  process.exit(1);
}
