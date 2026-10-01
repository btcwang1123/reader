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
- 🔍 書庫模糊搜尋與篩選(Fuse.js,涵蓋心得與書摘)
- 📅 年度閱讀回顧與明確日期閱讀日曆
- 🪪 書籍專屬社群分享圖片
- 🌙 詳情頁夜間閱讀模式
- 📱 行動版文章目錄
- 🧷 首頁「最近書摘」側欄
- 🔗 社群分享 meta(Open Graph / Twitter Card)
- 🗺️ sitemap.xml / robots.txt /自訂 404 頁

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
| `readingDates` | — | 實際閱讀日期陣列,供閱讀日曆使用 |
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

書庫頁以 **Fuse.js** 進行模糊全文搜尋(書名 / 作者 / 標籤 / 心得與書摘),支援錯字容錯,並可同時搭配狀態、標籤、最低評分篩選與排序。篩選條件會同步到網址列,方便分享當下的檢視。

## 書籍留言區(Giscus)

書籍詳情頁使用 Giscus 嵌入 GitHub Discussions 留言。啟用前需完成：

1. GitHub repository 設為 **Public**，並在 Settings → General → Features 啟用 **Discussions**。
2. 安裝 [Giscus GitHub App](https://github.com/apps/giscus) 到該 repository。
3. 前往 [giscus.app](https://giscus.app/zh-TW)，輸入 `btcwang1123/reader`，選擇 Discussions 分類(建議 `General`)，取得 repo/category ID。
4. GitHub repo → Settings → Secrets and variables → Actions → **Variables** → New repository variable，建立以下四個變數：`GISCUS_REPO`、`GISCUS_REPO_ID`、`GISCUS_CATEGORY`、`GISCUS_CATEGORY_ID`。部署 workflow 會自動讀取它們。
5. 若要在本機預覽，建立 `.env`(已列入 `.gitignore`，不要提交)，填入：

```dotenv
PUBLIC_GISCUS_REPO="btcwang1123/reader"
PUBLIC_GISCUS_REPO_ID="在 giscus.app 取得的 repo ID"
PUBLIC_GISCUS_CATEGORY="General"
PUBLIC_GISCUS_CATEGORY_ID="在 giscus.app 取得的 category ID"
```

重新啟動開發伺服器即可預覽留言區。部署時，GitHub Actions 會使用上述 Repository Variables；若變數尚未設定，書頁會顯示前往 repository Discussions 的連結。留言討論以書籍 slug 配對，因此留言會固定在對應書籍頁。
