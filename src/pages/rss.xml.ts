import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import { finished, sortByStartedDesc } from '../utils/books';

export const prerender = true;

export async function GET(context: { site: string }) {
  const all = sortByStartedDesc(await getCollection('books'));
  const done = finished(all);
  const BASE = import.meta.env.BASE_URL;

  const items = await Promise.all(
    done.map(async (b) => {
      const { remarkPluginFrontmatter } = await render(b);
      const abstract =
        remarkPluginFrontmatter.abstract ?? b.data.title;

      return {
        title: `${b.data.title} — ${b.data.author}`,
        pubDate: b.data.finishedAt ?? new Date(),
        link: `${BASE}books/${b.id}/`,
        description: abstract
      };
    })
  );

  return rss({
    title: '拾頁書室 · 新讀書心得',
    description: '最新完成的書本與心得',
    site: context.site,
    items
  });
}
