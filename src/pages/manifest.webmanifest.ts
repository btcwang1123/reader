import type { APIRoute } from 'astro';

export const prerender = true;

/** PWA manifest:路徑依 base 產生,GitHub Pages 子路徑也能正確安裝 */
export const GET: APIRoute = () => {
  const BASE = import.meta.env.BASE_URL;
  const manifest = {
    name: '拾頁書室',
    short_name: '拾頁書室',
    description: '收藏讀過的書、沿途的想法，以及那些捨不得忘記的句子。',
    lang: 'zh-Hant',
    start_url: BASE,
    scope: BASE,
    display: 'standalone',
    background_color: '#f7f3eb',
    theme_color: '#292722',
    icons: [
      { src: `${BASE}icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${BASE}icon-512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${BASE}icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' }
  });
};
