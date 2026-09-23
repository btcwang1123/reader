# 閱讀書架 📚

個人閱讀心得網站。以 **Astro** 建置的純靜態站,內容以 **Markdown** 保存,部署於 GitHub Pages。

## 功能

- 📖 書本管理(書名/作者/ISBN/出版社/出版年/封面)
- 🚦 閱讀狀態追蹤(想讀 / 正在讀 / 已讀 + 進度頁數)
- ✍️ 心得與標籤(完整 Markdown 渲染)
- ⭐ 評分與統計(年度/累積本數、頁數、時數、評分分布、熱門作者與標籤、年度趨勢圖)
- 📝 書摘與筆記
- 🔄 RSS 訂閱最新心得
- 📦 資料匯出(books.json)
- 🔍 書庫搜尋與篩選(見下方說明)

## 快速開始

```bash
npm install
npm run dev        # 開發模式 http://localhost:4321
npm run build      # 建置靜態檔到 dist/
npm run preview    # 預覽建置結果
```

## 新增一本書

推薦用互動式腳本:

```bash
npm run new-book
```

書本會以 Markdown 檔存在 `src/content/books/<slug>.md`,每個檔案就是一本書:

```md
---
title: "三體"
author: "劉慈欣"
status: finished
rating: 4.5
tags: ["科幻", "小說"]
startedAt: 2025-01-05
finishedAt: 2025-01-20
---

## 心得
(心得內容…)

## 書摘與筆記
> (摘錄…)
```

前後端資料欄位(全部見 `src/content.config.ts`):

| 欄位 | 必填 | 說明 |
|---|---|---|
| `title`, `author` | ✅ | 書名與作者 |
| `status` | ✅ | `wantToRead` / `reading` / `finished` |
| `rating` | — | 已讀時建議填,1–5、0.5 步進 |
| `tags` | — | 標籤陣列,自動產生標籤頁 |
| `startedAt`, `finishedAt` | — | 日期 YYYY-MM-DD |
| `progress.currentPage`/`totalPages` | — | 正在讀時的進度 |
| `readingMinutes` | — | 閱讀時數,統計用 |
| `cover` | — | 封面路徑,見下 |

Markdown body 建議用 `## 心得` 與 `## 書摘與筆記` 兩個章節,網站會自動渲染。

## 封面

1. 手動:把圖片放到 `public/covers/`,於 frontmatter 填 `cover: "/covers/xxx.jpg"`
2. 自動:用 ISBN 從 Open Library 抓取
   ```bash
   npm run fetch-cover -- 9789866651406
   ```

## 部署到 GitHub Pages

1. 把此專案推為 GitHub repo(例如 `my-reading-notes`)
2. 修改 `astro.config.mjs`:
   - `base`:改為 `'/my-reading-notes/'`
   - `site`:改為 `'https://<你的帳號>.github.io/my-reading-notes/'`
3. Repo 設定 → Pages → Build and deployment 選 **GitHub Actions**
4. push 到 `main` 後,`.github/workflows/deploy.yml` 會自動建置部署

## 備份與匯出

- 所有資料都只是「檔案」,在 `src/content/books/` 底下
- 網站本身提供 `/export/books.json` 下載,方便結構化備份

## 搜尋與篩選說明

書庫頁起初提供標籤快速瀏覽;完整全文搜尋(書名/作者/標籤即時過濾)屬於 SPEC 中後續里程碑,尚未實作時請以標籤與書庫瀏覽為主。
