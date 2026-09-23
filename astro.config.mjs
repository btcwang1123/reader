// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// GitHub Pages 部署時請修改 base 為自己的 repo 名稱
// 例:repo 叫 my-reading-notes -> base: '/my-reading-notes/'
// 若用自有網域或不是 GitHub Pages,可設為 '/' 或移除此行
const base = process.env.SITE_BASE
  ? `/${process.env.SITE_BASE}`.replace(/\/\//g, '/')
  : '/reader/';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages 網址
  site: 'https://btcwang1123.github.io/reader/',
  base,
  vite: {
    plugins: [tailwindcss()]
  }
});
