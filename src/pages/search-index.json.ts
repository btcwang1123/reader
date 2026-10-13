import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { excerpt } from '../utils/books';

export const prerender = true;

/** 書庫搜尋用的心得/書摘純文字索引;書庫頁第一次搜尋時才載入,避免每本書全文塞進 HTML */
export const GET: APIRoute = async () => {
  const books = await getCollection('books');
  const index = Object.fromEntries(books.map((book) => [book.id, excerpt(book.body ?? '', Infinity)]));
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
};
