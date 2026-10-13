/** 分享圖(OG 圖、書摘卡)共用的 SVG 工具 */

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

// 明確指定中文字型:CI(Linux) 用 fonts-noto-cjk,本機 Windows 退回微軟正黑體
export const CARD_FONT = "'Noto Serif CJK TC', 'Noto Sans CJK TC', 'Noto Serif TC', 'Microsoft JhengHei', serif";

export const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
})[char]!);

/** 依字寬斷行:半形字算 0.55 個全形字寬;超過行數時最後一行補上刪節號 */
export function wrapText(text: string, limit: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  let width = 0;
  for (const char of text) {
    const charWidth = /[\x00-\xff]/.test(char) ? 0.55 : 1;
    if (width + charWidth > limit && line) {
      lines.push(line);
      line = '';
      width = 0;
    }
    line += char;
    width += charWidth;
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}…`;
  }
  return lines;
}
