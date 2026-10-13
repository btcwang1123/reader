import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { finished, excerpt } from '../utils/books';
import BookContent from '../components/BookContent.astro';

export const prerender = true;

export async function GET(context: { site: string }) {
  const done = finished(await getCollection('books')).sort(
    (a, b) => (b.data.finishedAt?.getTime() ?? 0) - (a.data.finishedAt?.getTime() ?? 0)
  );
  const BASE = import.meta.env.BASE_URL;
  // 用 Astro 的 Markdown 管線算出完整心得 HTML,和網站上看到的一樣
  const container = await AstroContainer.create();

  const items = await Promise.all(
    done.map(async (b) => ({
      title: `${b.data.title} — ${b.data.author}`,
      pubDate: b.data.finishedAt ?? new Date(),
      link: `${BASE}books/${b.id}/`,
      description: excerpt(b.body ?? '', 160) || b.data.title,
      content: await container.renderToString(BookContent, { props: { book: b } }),
      categories: b.data.tags
    }))
  );

  return rss({
    title: '拾頁書室 · 新讀書心得',
    description: '最新完成的書本與心得',
    site: context.site,
    items
  });
}
