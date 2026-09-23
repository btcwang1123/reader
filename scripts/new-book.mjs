#!/usr/bin/env node
/**
 * 新增一本書
 *
 * 兩種用法:
 *  1) 互動式(在終端機直接跑):node scripts/new-book.mjs
 *  2) 參數式(適合無互動輸入的環境):node scripts/new-book.mjs --title "三體" --author "劉慈欣" [...]
 *
 * 參數式選項:
 *  --title    書名(必填)
 *  --author   作者(必填)
 *  --status   finished | reading | wantToRead (預設 finished)
 *  --rating   X.X,1–5 可半星(已讀時建議)
 *  --tags     "科幻,小說"(逗號分隔,可省略)
 *  --isbn     ISBN(可省略)
 *  --started  YYYY-MM-DD(預設今天)
 *  --finished YYYY-MM-DD(finished 時預設今天)
 *  --currentPage / --totalPages 正在讀時的進度(兩者需成對)
 *  --minutes  閱讀時數,分鐘(可省略)
 *  --help     顯示這份說明
 */
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';
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

const VALID_STATUS = ['finished', 'reading', 'wantToRead'];

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([a-zA-Z]+)$/);
    if (!m) continue;
    const key = m[1];
    const val = argv[i + 1];
    if (key === 'help') {
      opts[key] = true;
    } else if (val !== undefined && !val.startsWith('--')) {
      opts[key] = val;
      i++;
    }
  }
  return opts;
}

function buildFrontmatter(d) {
  const today = new Date().toISOString().slice(0, 10);
  const status = VALID_STATUS.includes(d.status) ? d.status : 'finished';
  const lines = [
    '---',
    `title: "${d.title}"`,
    `author: "${d.author}"`
  ];
  if (d.isbn) lines.push(`isbn: "${d.isbn}"`);
  if (d.publisher) lines.push(`publisher: "${d.publisher}"`);
  if (d.publishedYear) lines.push(`publishedYear: ${d.publishedYear}`);
  lines.push(`status: ${status}`);
  if (d.rating) lines.push(`rating: ${d.rating}`);
  if (d.tags) {
    const arr = d.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (arr.length) lines.push(`tags: [${arr.map((t) => `"${t}"`).join(', ')}]`);
  }
  if (d.currentPage && d.totalPages) {
    lines.push('progress:');
    lines.push(`  currentPage: ${d.currentPage}`);
    lines.push(`  totalPages: ${d.totalPages}`);
  }
  lines.push(`startedAt: ${d.started || today}`);
  if (status === 'finished') lines.push(`finishedAt: ${d.finished || today}`);
  if (d.minutes) lines.push(`readingMinutes: ${d.minutes}`);
  lines.push('---', '', '## 心得', '', '(撰寫你的心得…)', '', '## 書摘與筆記', '', '- (書摘與筆記…)');
  return `${lines.join('\n')}\n`;
}

function writeBook(d) {
  const slug = slugify(d.title) || 'untitled';
  const file = join(BOOKS_DIR, `${slug}.md`);
  writeFileSync(file, buildFrontmatter(d), 'utf8');
  console.log(`\n✅ 已建立 ${file}`);
  console.log('   封面可放置於 public/covers/,並在 frontmatter 加入 cover 欄位。');
}

// ---------- 主流程 ----------
const opts = parseArgs(process.argv.slice(2));

if (opts.help) {
  console.log('📚 新增一本書 — 用法:');
  console.log(' 互動: node scripts/new-book.mjs');
  console.log(' 參數: node scripts/new-book.mjs --title "書名" --author "作者" [--status finished] [--rating 4.5] [--tags "科幻,小說"] [--isbn ...] [--minutes ...]');
  process.exit(0);
}

if (opts.title && opts.author) {
  // 參數式
  writeBook({
    title: opts.title,
    author: opts.author,
    status: opts.status,
    rating: opts.rating,
    tags: opts.tags,
    isbn: opts.isbn,
    publisher: opts.publisher,
    publishedYear: opts.publishedYear,
    started: opts.started,
    finished: opts.finished,
    currentPage: opts.currentPage,
    totalPages: opts.totalPages,
    minutes: opts.minutes
  });
} else if (process.stdin.isTTY) {
  // 互動式(僅真的有可輸入的終端機時)
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const q = (s) => new Promise((r) => rl.question(s, r));
  console.log('📚 新增一本書(直接 Enter 可略過選填項目)\n');
  const title = (await q('書名: ')).trim();
  const author = (await q('作者: ')).trim();
  if (!title || !author) {
    console.error('❌ 書名與作者為必填。');
    rl.close();
    process.exit(1);
  }
  const status =
    ((await q('狀態 (finished / reading / wantToRead)[finished]: ')).trim() || 'finished');
  const rating =
    status === 'finished' ? (await q('評分 (1–5, 可半星, 可略過): ')).trim() : '';
  const tags = (await q('標籤 (逗號分隔, 可略過): ')).trim();
  const isbn = (await q('ISBN (可略過): ')).trim();
  rl.close();
  writeBook({ title, author, status, rating, tags, isbn });
} else {
  // 無 TTY 且無參數 -> 印說明
  console.log('⚠️  目前沒有可輸入的終端機。請改用參數模式:');
  console.log('  node scripts/new-book.mjs --title "書名" --author "作者" [選項]');
  console.log('  或 --help 看完整說明');
  process.exit(1);
}
