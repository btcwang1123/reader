import { getCollection, type CollectionEntry } from 'astro:content';
import type { Book } from './books';

export type BookList = CollectionEntry<'lists'>;

/** 依書單 books 欄位(書的檔名 slug 或書名)找出對應書籍,保留書單順序;找不到的項目回傳 missing */
export async function resolveList(list: BookList): Promise<{ books: Book[]; missing: string[] }> {
  const all = await getCollection('books');
  const books: Book[] = [];
  const missing: string[] = [];
  for (const ref of list.data.books) {
    const book = all.find((candidate) => candidate.id === ref || candidate.data.title === ref);
    if (book) books.push(book);
    else missing.push(ref);
  }
  return { books, missing };
}

/** 收錄這本書的所有書單 */
export async function listsContaining(book: Book): Promise<BookList[]> {
  const lists = await getCollection('lists');
  return lists.filter((list) => list.data.books.some((ref) => ref === book.id || ref === book.data.title));
}
