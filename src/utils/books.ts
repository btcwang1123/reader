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
