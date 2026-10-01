#!/usr/bin/env node
/**
 * 產生網站分享圖(OG image) 1200×630 -> public/share-cover.jpg
 * 用法:
 *   node scripts/share-card.mjs
 *   SITE_TITLE="xxx" node scripts/share-card.mjs   覆寫主標題
 */
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { COLORS, textBlock } from './card-core.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const W = 1200;
const H = 630;
const MAIN = process.env.SITE_TITLE ?? '拾頁書室';
const TAG = '閱讀,是借別人的眼睛,再看一次自己的世界';

function svg() {
  const stack = [
    // 背景(污點留給內層,白底墊層避免黑色污點透到文字)
    `<rect width="${W}" height="${H}" fill="${COLORS.paper}"/>`,
    `<rect width="${W}" height="${H}" fill="url(#blob)"/>`,
    // 一疊書本
    `<g transform="translate(930,258) rotate(-6)">
      <rect x="0" y="0" width="96" height="236" rx="8" fill="#7a4a2a"/>
      <rect x="10" y="0" width="18" height="236" rx="7" fill="#8a5a36"/>
      <circle cx="66" cy="40" r="14" fill="#f2e9d8"/>
      <circle cx="66" cy="40" r="10" fill="none" stroke="#7a4a2a" stroke-width="2" opacity=".5"/>
      <rect x="-10" y="42" width="116" height="200" rx="8" fill="#8a5a36"/>
      <rect x="14" y="58" width="16" height="188" rx="7" fill="#9a6a46"/>
    </g>`,
    // 下方裝飾線與幾何
    `<path d="M0 540 C 300 500, 480 580, 760 540 S 1080 560, 1200 520 L 1200 630 L 0 630 Z" fill="${COLORS.clay}" opacity="0.08"/>`,
    `<circle cx="1120" cy="120" r="130" fill="none" stroke="${COLORS.line}" stroke-width="2" opacity=".7"/>`
  ];

  const bodyLeft = 96;
  const titleY = 300;
  const mainLines = textBlock([MAIN], {
    x: bodyLeft, y: titleY, size: 84, fill: COLORS.ink, anchor: 'start', weight: 800
  });
  const tagLines = textBlock([TAG], {
    x: bodyLeft, y: titleY + 150, size: 26, fill: COLORS.sage, anchor: 'start', weight: 500
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="blob" cx="18%" cy="12%" r="60%">
      <stop offset="0%" stop-color="#ffe3a4" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${COLORS.paper}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${stack.join('\n  ')}
  ${mainLines}
  ${tagLines}
</svg>`;
}

const outFile = join(__dirname, '..', 'public', 'share-cover.jpg');

try {
  // sharp 可直接吃 SVG 字串並輸出 jpg,不需要暫存檔或額外工具
  await sharp(Buffer.from(svg())).jpeg({ quality: 88 }).toFile(outFile);
  console.log('✅ 已產生分享圖 public/share-cover.jpg');
} catch (err) {
  console.error('❌ 產生失敗:', err.message);
  process.exit(1);
}
