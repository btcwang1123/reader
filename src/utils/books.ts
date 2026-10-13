import type { CollectionEntry } from 'astro:content';

export type Book = CollectionEntry<'books'>;

/** 依「開始閱讀日期」排序書籍,最新的在前 */
export function sortByStartedDesc(books: Book[]): Book[] {
  return [...books].sort(
    (a, b) =>
      (b.data.startedAt?.getTime() ?? -Infinity) -
      (a.data.startedAt?.getTime() ?? -Infinity)
  );
}

/** 所有已讀完的書籍 */
export function finished(books: Book[]): Book[] {
  return books.filter((b) => b.data.status === 'finished');
}

/** 依「讀完日期」排序書籍,最舊的在前;沒有日期的墊底 */
export function sortByFinishedAsc(books: Book[]): Book[] {
  return [...books].sort(
    (a, b) =>
      (a.data.finishedAt?.getTime() ?? Infinity) -
      (b.data.finishedAt?.getTime() ?? Infinity)
  );
}

/** 正在閱讀的書籍 */
export function reading(books: Book[]): Book[] {
  return books.filter((b) => b.data.status === 'reading');
}

/** 全書總頁數:優先 `pages`,沒有則用 `progress.totalPages` */
export function totalPagesOf(book: Book): number {
  return book.data.pages ?? book.data.progress?.totalPages ?? 0;
}

/** 日期轉 YYYY-MM-DD。frontmatter 日期以 UTC 午夜解析,取 UTC 欄位才不會因時區差一天 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 狀態的繁中標籤 */
export const STATUS_LABELS: Record<string, string> = {
  wantToRead: '想讀',
  reading: '正在讀',
  finished: '已讀',
  abandoned: '棄讀'
};

/** 狀態徽章配色(卡片與詳情頁共用) */
export const STATUS_STYLES: Record<string, string> = {
  finished: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  reading: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  wantToRead: 'bg-stone-100 text-stone-600 ring-stone-300/60',
  abandoned: 'bg-rose-50 text-rose-700 ring-rose-600/15'
};

/** 一次「讀完」事件:第一次讀完或之後的重讀 */
export type ReadEvent = { book: Book; startedAt?: Date; finishedAt: Date; reread: boolean; note?: string };

/** 所有讀完事件(含重讀),依讀完日期由舊到新 */
export function readEvents(books: Book[]): ReadEvent[] {
  const events: ReadEvent[] = [];
  for (const book of books) {
    if (book.data.status === 'finished' && book.data.finishedAt) {
      events.push({ book, startedAt: book.data.startedAt, finishedAt: book.data.finishedAt, reread: false });
    }
    for (const reread of book.data.rereads) {
      events.push({ book, startedAt: reread.startedAt, finishedAt: reread.finishedAt, reread: true, note: reread.note });
    }
  }
  return events.sort((a, b) => a.finishedAt.getTime() - b.finishedAt.getTime());
}

/** 作者頁網址片段;作者名稱含 / 時換成全形避免變成子路徑 */
export function authorSlug(author: string): string {
  return author.replace(/\//g, '／');
}

/** 每頁/天的閱讀速度;缺頁數或天數時回傳 null */
export function pagesPerDay(book: Book): number | null {
  const pages = totalPagesOf(book);
  const days = readingDays(book.data.startedAt, book.data.finishedAt);
  return pages && days ? pages / days : null;
}

/** 取出 body 中所有書摘引用(`>` blockquote),每段合併成一行純文字 */
export function allQuotes(markdown: string): string[] {
  const quotes: string[] = [];
  let running: string[] | null = null;
  for (const line of markdown.split('\n')) {
    if (/^\s{0,3}>\s?/.test(line)) {
      (running ??= []).push(line.replace(/^\s{0,3}>\s?/, '').trim());
    } else if (running) {
      quotes.push(running.join(' '));
      running = null;
    }
  }
  if (running) quotes.push(running.join(' '));
  return quotes
    .map((quote) => quote.replace(/[*_`]/g, '').trim().replace(/^「|」$/g, '').trim())
    .filter(Boolean);
}

/** 評分星星字串,支援半顆星 */
export function starString(rating: number | undefined): string {
  if (!rating) return '';
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

/** 計算閱讀天數(含頭尾兩天);缺任一日期則回傳 null */
export function readingDays(startedAt?: Date, finishedAt?: Date): number | null {
  if (!startedAt || !finishedAt) return null;
  const diff = finishedAt.getTime() - startedAt.getTime();
  if (diff < 0) return null;
  return Math.floor(diff / 86_400_000) + 1;
}

/** 從 body 抽出第一段書摘引用(`>` blockquote)的純文字;沒有的話回傳 null */
export function firstQuote(markdown: string): string | null {
  return allQuotes(markdown)[0] ?? null;
}

/** 從 Markdown 心得取出純文字摘要,去除標題/引用/清單等符號 */
export function excerpt(markdown: string, maxLength = 120): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // 程式碼區塊
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, ' ') // 標題行
    .replace(/^\s{0,3}>\s?/gm, '') // 引用符號
    .replace(/^\s{0,3}[-*+]\s+/gm, '') // 清單符號
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 圖片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 連結保留文字
    .replace(/[*_`~]/g, '') // 行內強調符號
    .replace(/^---+$/gm, ' ') // 分隔線
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
