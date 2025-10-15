# GitHub Pages SPA 路由修復說明

## 問題描述

當使用 GitHub Pages 托管單頁應用（SPA）時，直接訪問子路由（如 `leyatalks.com/leya`）會導致 404 錯誤。這是因為 GitHub Pages 是靜態托管，它會嘗試尋找實際的文件路徑，而不是讓 React Router 處理路由。

## 解決方案

使用 **spa-github-pages** 解決方案，通過 404.html 重定向來處理所有路由。

### 實作步驟

#### 1. 創建 404.html

已在 `public/404.html` 創建重定向腳本，當訪問不存在的路徑時：
- GitHub Pages 會返回這個 404.html
- 腳本會將路徑轉換為查詢參數
- 重定向到 index.html

#### 2. 更新 index.html

在 `index.html` 的 `<head>` 中添加腳本：
- 檢查 URL 中是否有重定向標記
- 將查詢參數還原為正確的路徑
- 使用 `window.history.replaceState` 更新瀏覽器歷史記錄
- React Router 接管後續的路由處理

## 工作原理

### 訪問流程

1. **用戶訪問**: `leyatalks.com/leya/chat`
2. **GitHub Pages**: 找不到 `/leya/chat/index.html`，返回 `404.html`
3. **404.html 腳本**: 將 URL 轉換為 `leyatalks.com/?/leya/chat`
4. **重定向**: 瀏覽器重定向到新 URL
5. **index.html 載入**: 主頁面載入
6. **index.html 腳本**: 檢測到 `?/leya/chat`，還原為 `/leya/chat`
7. **React Router**: 接管路由，顯示正確頁面

### URL 轉換範例

| 原始 URL | 404.html 轉換後 | index.html 還原後 |
|----------|----------------|-------------------|
| `/leya` | `/?/leya` | `/leya` |
| `/leya/chat` | `/?/leya/chat` | `/leya/chat` |
| `/leya/login` | `/?/leya/login` | `/leya/login` |
| `/leya/stress-mind-map` | `/?/leya/stress-mind-map` | `/leya/stress-mind-map` |

## 測試

部署後測試以下 URL：

- ✅ `https://leyatalks.com/`
- ✅ `https://leyatalks.com/leya`
- ✅ `https://leyatalks.com/leya/login`
- ✅ `https://leyatalks.com/leya/chat`
- ✅ `https://leyatalks.com/leya/mood`
- ✅ `https://leyatalks.com/leya/stress-mind-map`

## 注意事項

1. **404.html 大小**: 文件必須大於 512 bytes 才能在 IE 中正常工作（當前已滿足）

2. **自定義域名**: 如果使用自定義域名（如 leyatalks.com），`pathSegmentsToKeep` 保持為 0

3. **Project Pages**: 如果使用 `username.github.io/repo-name` 格式，需要將 `pathSegmentsToKeep` 設為 1

4. **部署**: 確保 `404.html` 在構建後的輸出目錄中（Vite 會自動複製 public 目錄）

## 兼容性

- ✅ 所有現代瀏覽器
- ✅ 移動設備
- ✅ 搜尋引擎爬蟲（使用 prerendering 可以進一步優化 SEO）

## 替代方案

如果需要更好的 SEO，可以考慮：
1. 使用 Vercel、Netlify 等支持 SPA 的托管平台
2. 使用 Next.js 等支持 SSR 的框架
3. 使用 prerendering 服務

## 參考資料

- [spa-github-pages](https://github.com/rafgraph/spa-github-pages)
- [GitHub Pages 官方文檔](https://docs.github.com/en/pages)

---

**狀態**: ✅ 已實作  
**更新日期**: 2025-10-15
