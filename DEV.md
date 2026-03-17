# 開發環境（做法一）

開發時需同時啟動 **Vite 前端** 與 **Express API**，並用瀏覽器開 Vite 的網址。

## 步驟

1. **終端一：API 伺服器（port 3000）**
   ```bash
   npm run dev:server
   ```
2. **終端二：Vite 前端（port 5173）**
   ```bash
   npm run dev
   ```
3. 瀏覽器開啟：**http://localhost:5173**  
   - 前台：首頁、建案、重劃區、關於我們等  
   - 後台：http://localhost:5173/admin（登入後可管理網站設定、建案、重劃區、建設公司、名稱對應表）

## 說明

- Vite 會把 `/api` 的請求 proxy 到 `http://localhost:3000`，故後台與前台呼叫的 `/api/admin/*`、`/api/public/site-content` 都會由 Express 處理。
- 開發時 Express 只提供 API，不提供靜態檔；靜態與 SPA 由 Vite 負責。
- 正式環境：`npm run build` 後執行 `npm run start`，單一 process 同時提供 API 與靜態檔。
