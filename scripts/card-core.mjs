#!/usr/bin/env node
/**
 * 分享圖核心:色彩與 SVG 繪製用的工具函式。
 */

export const COLORS = {
  paper: '#f7f3eb',
  ink: '#292722',
  clay: '#a6482d',
  orange: '#c26a47', // 分享圖上的亮橙
  sage: '#627260',
  line: '#e0d9cd'
};

export function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 把文字塗成一行行 <text> */
export function textBlock(lines, { x, y, size, fill, anchor = 'start', lineHeight = size * 1.35, weight = 600 }) {
  return lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * lineHeight}" font-family="Noto Serif TC" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escapeXml(line)}</text>`
    )
    .join('\n');
}
