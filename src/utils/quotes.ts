import { getCollection } from 'astro:content';
import { allQuotes, type Book } from './books';

export type Quote = { id: string; book: Book; text: string };

/** 全站所有書摘;id = 書的 slug + 第幾段(從 1 開始),供分享卡網址使用 */
export async function getAllQuotes(): Promise<Quote[]> {
  const books = await getCollection('books');
  return books.flatMap((book) =>
    allQuotes(book.body ?? '').map((text, index) => ({ id: `${book.id}-${index + 1}`, book, text }))
  );
}
