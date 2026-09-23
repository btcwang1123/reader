# 閱讀心得網站 — 規格書 (Spec)

## 1. 目標與概述

一個**個人單用戶**的閱讀心得網站,用來記錄讀過的書、管理閱讀狀態、撰寫心得與書摘,並提供統計、訂閱與資料匯出。

- 純**靜態網站**(Astro),無後端伺服器、無資料庫
- 所有內容以 **Markdown 檔案**存放,既可被網站讀取,也方便備份與匯出
- 部署到任意靜態託管平台 (GitHub Pages / Cloudflare Pages / Netlify / Vercel)

## 2. 技術選型

| 項目 | 選擇 | 說明 |
|---|---|---|
| 框架 | Astro (最新穩定版, Static mode) | 內容型網站最佳選擇 |
| 內容管理 | Astro Content Collections + Zod Schema | 型別安全的 Markdown 前後端資料 |
| 樣式 | Tailwind CSS | 版型美化 |
| 界面語言 | 繁體中文 | 所有界面文字、標籤皆為繁中 |
| 搜尋 | 純前端過濾 (Fuse.js 可選) | 不需要後端 |
| RSS | `@astrojs/rss` | 建置時產生 |
| 匯出 | 建置時產出 JSON 檔 | 備份與分享 |

## 3. 資料模型

每一本書 = `src/content/books/<slug>.md`,一份 Markdown 檔 (frontmatter + body)。

### 3.1 Frontmatter 欄位

| 欄位 | 必填 | 型別 | 說明 |
|---|---|---|---|
| `title` | ✅ | string | 書名 |
| `author` | ✅ | string | 作者 |
| `slug` | | string | 預設由書名產生,可覆寫 |
| `isbn` | | string | ISBN-13 |
| `publisher` | | string | 出版社 |
| `publishedYear` | | number | 出版年 |
| `cover` | | string | 封面圖片路徑,見 §6 |
| `status` | ✅ | enum | `wantToRead` / `reading` / `finished` |
| `rating` | 條件 | 1–5,0.5 步進 | 已讀 (`finished`) 時必填 |
| `startedAt` / `finishedAt` | | date (YYYY-MM-DD) | 開始閱讀 / 完成日期 |
| `progress.currentPage` / `progress.totalPages` | 條件 | number | 正在讀時記錄目前頁數 |
| `tags` | | string[] | 分類標籤 (例: `科幻`, `小說`, `非虛構`) |
| `readingMinutes` | | number | 閱讀總時數 (以分鐘計,統計用) |

### 3.2 Body 結構 (Markdown)

```md
## 心得
(整段閱讀心得,自由 Markdown,可含標題、清單、引用、程式碼等)

## 書摘與筆記
> 「喜歡的句子摘錄……」
- 閱讀時的筆記/想法
```

## 4. 頁面與路由規劃

| 路由 | 頁面 | 內容 |
|---|---|---|
| `/` | 首頁 | 年度/累積閱讀統計亮點、目前正在讀的書、最近完成與最近心得 |
| `/books` | 書庫 | 全部書籍,支援搜尋與篩選 (狀態 / 標籤 / 評分) |
| `/books/[slug]` | 書籍詳情 | 完整書目資訊、評分、心得、書摘與筆記 |
| `/tags/[tag]` | 標籤頁 | 依標籤瀏覽書籍 (自動產生) |
| `/stats` | 統計 | 年度已讀本數、累積頁數、平均評分、評分分布、熱門作者/標籤、閱讀趨勢 |
| `/rss.xml` | RSS | 訂閱最新心得 (每篇已讀書的心得) |
| `/export` | 匯出頁 | 下載 `books.json` / Markdown 彙整檔 |
| `/about` | 關於 | (選用) 站點簡介 |

## 5. 功能規格

### 5.1 書本管理
- 新增書 = 執行 `npm run new-book` 互動式腳本,產生 Markdown 樣板
- 修改 / 刪除 = 直接編輯或刪除對應 `.md` 檔案
- 書庫以封面+書名卡片呈現,排序可切換 (最近加入 / 完成日期 / 評分)

### 5.2 閱讀狀態追蹤
- 三種狀態:想讀 (**wantToRead**)、正在讀 (**reading**)、已讀 (**finished**)
- `reading` 狀態記錄目前進度頁數
- 首頁固定顯示「**正在閱讀**」專區

### 5.3 心得與標籤
- 心得支援完整 Markdown,渲染時啟用語法高亮與 GFM 表格支援
- 標籤由 frontmatter 自動彙整,產生標籤清單與標籤頁

### 5.4 評分與統計
- 五顆星 UI (半星支援),僅已讀書籍可評分
- 統計頁 (`/stats`) 包含:
  - 累積已讀本數、**年度已讀本數** (依 `finishedAt`)、累積頁數、累積閱讀時數
  - 平均評分、評分分布 (幾顆星的各幾本)
  - 讀最多的作者、使用最多的標籤
  - 簡易閱讀趨勢圖 (每月/每年已讀本數)

### 5.5 書摘與筆記
- 詳情頁顯示「書摘與筆記」區塊,可用 `#quotes` 錨點直接跳到
- 首頁可選顯示「最近書摘」側欄

### 5.6 RSS 訂閱
- 建置時透過 `@astrojs/rss` 產生 `/rss.xml`
- 每條目 = 一本近期已讀書籍,內容為其心得摘要

### 5.7 資料匯出
- 建置時自動產生 `/export/books.json`(含所有書目欄位 + 心得原文)
- `/export` 頁面提供下載按鈕,方便備份或搬家到其他服務

### 5.8 搜尋與篩選
- 純前端搜尋:關鍵字比對書名、作者、標籤
- 書庫頁篩選器:狀態、標籤、最低評分
- 無需後端,所有人站內即時完成

## 6. 封面圖片方案

- **主要方式**:存放在 `public/covers/<isbn-or-slug>.jpg`,frontmatter 的 `cover` 指向它(離線、可控)
- **輔助工具**:`npm run fetch-cover` —— 輸入 ISBN 後從 **Open Library** 自動抓取封面存到本地,無封面則略過,不阻斷建置

## 7. 建置與部署

- `npm run build` 產出靜態檔到 `dist/`
- **部署平台:GitHub Pages** (設定 `base: '/<repo-name>/'`)(預設部署至等)
- GitHub Actions 在 push 到 `main` 後自動建置並部署到 Pages

## 8. 目錄結構草案

```
Project/Reader/
├─ src/
│  ├─ content/
│  │  ├─ config.ts            # Zod schema
│  │  └─ books/               # 每本書一個 .md
│  ├─ components/             # 卡片、篩選器、星星、統計圖等
│  ├─ layouts/                # 基礎 layout
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ books/index.astro
│  │  ├─ books/[slug].astro
│  │  ├─ tags/[tag].astro
│  │  ├─ stats.astro
│  │  ├─ export.astro
│  │  └─ rss.xml.js
│  └─ styles/
├─ public/covers/             # 封面圖
├─ scripts/
│  ├─ new-book.mjs            # 新增書互動式腳本
│  └─ fetch-cover.mjs         # ISBN 抓封面
├─ astro.config.mjs
├─ package.json
└─ SPEC.md
```

## 9. 實作里程碑

1. **M1 基礎骨架**:專案初始化、Content Schema、Layout、首頁 / 書庫 / 書籍詳情
2. **M2 進階功能**:統計頁、評分 UI、書摘區塊、搜尋篩選、標籤頁
3. **M3 工具與收尾**:新增書腳本、封面抓取、RSS、資料匯出、部署設定、示例書目、README

## 10. 已定案事項

- 界面語言:**繁體中文**
- 樣式方案:**Tailwind CSS**
- 封面:本地放置為主 + ISBN 自動抓取輔助
- 部署平台:**GitHub Pages**
- 類型:個人單用戶、Astro 純靜態站
