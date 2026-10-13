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
 *  --status   finished | reading | wantToRead | abandoned (預設 finished)
 *  --rating   X.X,1–5 可半星(已讀時建議)
 *  --tags     "科幻,小說"(逗號分隔,可省略)
 *  --isbn     ISBN(可省略;有填會自動抓封面)
 *  --no-cover 不要自動抓封面
 *  --started  YYYY-MM-DD(reading 時預設今天;finished 時不填就不寫)
 *  --finished YYYY-MM-DD(finished 時預設今天)
 *  --pages    全書總頁數(統計累積頁數用,可省略)
 *  --currentPage / --totalPages 正在讀時的進度(兩者需成對)
 *  --minutes  閱讀時數,分鐘(可省略)
 *  --force    同名檔案已存在時仍覆寫
 *  --help     顯示這份說明
 */
import { createInterface } from 'node:readline';
import { existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchCover } from './cover-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOOKS_DIR = join(__dirname, '..', 'src', 'content', 'books');

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const VALID_STATUS = ['finished', 'reading', 'wantToRead', 'abandoned'];

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const m = argv[i].match(/^--([a-zA-Z-]+)$/);
    if (!m) continue;
    const key = m[1];
    const val = argv[i + 1];
    if (key === 'help' || key === 'force' || key === 'no-cover') {
      opts[key] = true;
    } else if (val !== undefined && !val.startsWith('--')) {
      opts[key] = val;
      i++;
    }
  }
  return opts;
}

/** YAML 雙引號字串:跳脫反斜線與雙引號,避免書名含 " 時 frontmatter 壞掉 */
function yamlStr(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** 本地時區的今天(toISOString 是 UTC,台灣早上 8 點前會變成昨天) */
function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function buildFrontmatter(d) {
  const today = localToday();
  const status = VALID_STATUS.includes(d.status) ? d.status : 'finished';
  const lines = [
    '---',
    `title: ${yamlStr(d.title)}`,
    `author: ${yamlStr(d.author)}`
  ];
  if (d.isbn) lines.push(`isbn: ${yamlStr(d.isbn)}`);
  if (d.cover) lines.push(`cover: ${yamlStr(d.cover)}`);
  if (d.publisher) lines.push(`publisher: ${yamlStr(d.publisher)}`);
  if (d.publishedYear) lines.push(`publishedYear: ${d.publishedYear}`);
  lines.push(`status: ${status}`);
  if (d.rating) lines.push(`rating: ${d.rating}`);
  if (d.tags) {
    const arr = d.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (arr.length) lines.push(`tags: [${arr.map(yamlStr).join(', ')}]`);
  }
  if (d.pages) lines.push(`pages: ${d.pages}`);
  if (d.currentPage && d.totalPages) {
    lines.push('progress:');
    lines.push(`  currentPage: ${d.currentPage}`);
    lines.push(`  totalPages: ${d.totalPages}`);
  }
  // 已讀的書不預設開始日期:補登舊書時填今天會讓「花費天數」變成 1 天、編年史全擠在同一天
  if (d.started) lines.push(`startedAt: ${d.started}`);
  else if (status === 'reading') lines.push(`startedAt: ${today}`);
  if (status === 'finished') lines.push(`finishedAt: ${d.finished || today}`);
  if (d.minutes) lines.push(`readingMinutes: ${d.minutes}`);
  lines.push('---', '', '## 心得', '', '(撰寫你的心得…)', '', '## 書摘與筆記', '', '- (書摘與筆記…)');
  return `${lines.join('\n')}\n`;
}

async function writeBook(d, { force = false, cover = true } = {}) {
  const slug = slugify(d.title) || 'untitled';
  const file = join(BOOKS_DIR, `${slug}.md`);
  if (existsSync(file) && !force) {
    console.error(`❌ ${file} 已存在,為避免覆蓋既有心得已停止。確定要覆寫請加 --force。`);
    process.exit(1);
  }
  if (d.isbn && cover) {
    console.log('\n🔎 依 ISBN 抓封面…');
    d.cover = await fetchCover(d.isbn, console.log);
  }
  writeFileSync(file, buildFrontmatter(d), 'utf8');
  console.log(`\n✅ 已建立 ${file}`);
  if (!d.cover) console.log('   封面可放置於 public/covers/,並在 frontmatter 加入 cover 欄位。');
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
  await writeBook({
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
    pages: opts.pages,
    minutes: opts.minutes
  }, { force: opts.force, cover: !opts['no-cover'] });
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
    ((await q('狀態 (finished / reading / wantToRead / abandoned)[finished]: ')).trim() || 'finished');
  const rating =
    status === 'finished' ? (await q('評分 (1–5, 可半星, 可略過): ')).trim() : '';
  const tags = (await q('標籤 (逗號分隔, 可略過): ')).trim();
  const isbn = (await q('ISBN (可略過): ')).trim();
  const pages = (await q('總頁數 (可略過): ')).trim();
  rl.close();
  await writeBook({ title, author, status, rating, tags, isbn, pages });
} else {
  // 無 TTY 且無參數 -> 印說明
  console.log('⚠️  目前沒有可輸入的終端機。請改用參數模式:');
  console.log('  node scripts/new-book.mjs --title "書名" --author "作者" [選項]');
  console.log('  或 --help 看完整說明');
  process.exit(1);
}
