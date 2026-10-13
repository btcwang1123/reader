#!/usr/bin/env node
/**
 * 由 public/favicon.svg 產生 PWA 圖示:public/icon-192.png、icon-512.png、icon-maskable-512.png
 * 用法:node scripts/pwa-icons.mjs(換 favicon 後重跑一次即可)
 */
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

for (const size of [192, 512]) {
  await sharp(svg, { density: 512 }).resize(size, size).png().toFile(out(`icon-${size}.png`));
}

// maskable:圖示縮到中間 80% 安全區,外圈補底色,避免被 Android 裁成圓形時切到
const inner = await sharp(svg, { density: 512 }).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: '#292722' } })
  .composite([{ input: inner, left: 51, top: 51 }])
  .png()
  .toFile(out('icon-maskable-512.png'));

console.log('✅ 已產生 public/icon-192.png、icon-512.png、icon-maskable-512.png');
