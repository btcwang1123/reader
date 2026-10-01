import { getCollection, type CollectionEntry } from 'astro:content';

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

/** 狀態的繁中標籤 */
export const STATUS_LABELS: Record<string, string> = {
  wantToRead: '想讀',
  reading: '正在讀',
  finished: '已讀'
};

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
  const lines = markdown.split('\n');
  let inQuote = false;
  let running = '';
  for (const line of lines) {
    if (/^\s{0,3}>\s?/.test(line)) {
      inQuote = true;
      running += line.replace(/^\s{0,3}>\s?/, '').trim() + ' ';
    } else if (inQuote) {
      break;
    }
  }
  running = running.trim().replace(/^「|」$/g, '').trim();
  return running || null;
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
