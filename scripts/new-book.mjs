#!/usr/bin/env node
/**
 * 互動式新增一本書
 * 執行:npm run new-book
 */
import { createInterface } from 'node:readline';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOOKS_DIR = join(__dirname, '..', 'src', 'content', 'books');

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function prompt(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log('📚 新增一本書\n');

const title = await prompt(rl, '書名: ');
const author = await prompt(rl, '作者: ');
const statusInput = (await prompt(rl, '狀態 (wantToRead / reading / finished) [finished]: ')).trim() || 'finished';
const status = ['wantToRead', 'reading', 'finished'].includes(statusInput) ? statusInput : 'finished';

let rating = '';
if (status === 'finished') {
  rating = (await prompt(rl, '評分 (1–5, 可 0.5 步進, 可留空): ')).trim();
}
const tags = (await prompt(rl, '標籤 (逗號分隔, 可留空): ')).trim();
const isbn = (await prompt(rl, 'ISBN (可留空): ')).trim();

const slug = slugify(title) || 'untitled';
const today = new Date().toISOString().slice(0, 10);

const frontmatter = [
  `---`,
  `title: "${title}"`,
  `author: "${author}"`,
  ...(isbn ? [`isbn: "${isbn}"`] : []),
  `status: ${status}`,
  ...(rating ? [`rating: ${rating}`] : []),
  ...(tags ? [`tags: [${tags.split(/[,，]/).map((t) => `"${t.trim()}"`).join(', ')}]`] : []),
  `startedAt: ${today}`,
  ...(status === 'finished' ? [`finishedAt: ${today}`] : []),
  `---`,
  ``,
  `## 心得`,
  ``,
  `(撰寫你的心得…)`,
  ``,
  `## 書摘與筆記`,
  ``,
  `- (書摘與筆記…)`
].join('\n');

const file = join(BOOKS_DIR, `${slug}.md`);
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, frontmatter, 'utf8');

console.log(`\n✅ 已建立 ${file}`);
console.log(`   封面可放置於 public/covers/${slug}.jpg,並在 frontmatter 加入 cover 欄位。`);
rl.close();
