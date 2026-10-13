#!/usr/bin/env node
/**
 * 依 ISBN 抓取封面存入 public/covers/(先找 Google Books,再找 Open Library)
 * 用法:node scripts/fetch-cover.mjs <isbn> [<isbn> ...]
 *   或  npm run fetch-cover -- <isbn>
 */
import { fetchCover } from './cover-core.mjs';

const isbns = process.argv.slice(2);
if (!isbns.length) {
  console.error('用法: node scripts/fetch-cover.mjs <isbn> [<isbn> ...]');
  process.exit(1);
}

let failed = 0;
for (const isbn of isbns) {
  console.log(`🔎 ${isbn}`);
  const cover = await fetchCover(isbn, console.log);
  if (cover) {
    console.log(`✅ 在該書 frontmatter 加入: cover: "${cover}"`);
  } else {
    console.log(`⚠️  找不到 ${isbn} 的封面`);
    failed += 1;
  }
}
process.exit(failed ? 1 : 0);
