# 網站與後台安全建議

以下為降低後台與整體網站被攻擊風險的實務做法，可依優先順序逐步實施。

---

## 一、已具備的防護

- **後台需登入**：`/api/admin/*` 在 `adminAuth` 之後的路由皆需有效 token，未認證會回 401。
- **業務權限**：僅 `status === "approved"` 的業務可登入；owner 與 agent 權限分離（如建案指派、維護總覽僅 owner）。

---

## 二、建議強化的項目

### 1. 上線環境使用 HTTPS

- **目的**：避免連線被竊聽、竄改（含 cookie／token）。
- **做法**：正式環境以反向代理（Nginx、Caddy、雲端 LB）掛 SSL，對外只開 443；本機或內網開發可維持 HTTP。

### 2. 後台路徑與入口

- **目的**：降低被掃描、暴力嘗試的機率。
- **做法**：若可行，將後台路徑改為較不直覺（例如 `/manage` 或自訂前綴）；或至少避免在對外文案暴露後台網址。登入頁可加「圖形驗證碼」或 rate limit，防止暴力破解密碼。

### 3. API 輸入驗證與消毒

- **目的**：防止注入、惡意 payload、過大請求。
- **做法**：
  - 所有來自前端的參數（body、query、params）做型別與格式檢查（長度、必填、列舉值）。
  - 建案／建設公司／重劃區等文字欄位可限制長度並過濾危險字元。
  - 檔案上傳：限制副檔名、MIME、檔案大小，並避免執行上傳目錄內的檔案。

### 4. Rate limiting（頻率限制）

- **目的**：防止暴力嘗試、DDoS、單一 IP 濫用 API。
- **做法**：在 Express 前層加 `express-rate-limit`（或 Nginx 的 limit_req），對 `/api/admin/login`、`/api/admin/register` 與整體 `/api` 設每 IP 每分鐘請求上限；登入失敗可額外延長鎖定或加重限制。

### 5. 安全表頭（Security Headers）

- **目的**：減少 XSS、clickjacking、MIME sniff 等風險。
- **做法**：使用 `helmet` 中介軟體，或至少設定：
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`（或 SAMEORIGIN，依需求）
  - `Content-Security-Policy`（可先從較寬鬆政策開始再收緊）

### 6. CORS

- **目的**：避免未授權網域對你的 API 發起瀏覽器請求。
- **做法**：正式環境不要用 `*`；只允許你的前端網域（例如 `https://yoursite.com`）。開發環境可允許 `localhost`。

### 7. 敏感資料與環境變數

- **目的**：避免 token、密碼、API key 進版控或外洩。
- **做法**：JWT secret、資料庫連線字串、第三方 API key 一律放在環境變數（`.env`），並將 `.env` 加入 `.gitignore`；正式機用密鑰管理服務或主機環境變數注入。

### 8. 依賴更新與日誌

- **目的**：降低已知漏洞與便於事後追查。
- **做法**：定期執行 `npm audit`、更新依賴；對登入失敗、權限不足、異常請求寫入日誌（不含密碼），便於監控與調查。

---

## 三、實作優先順序（建議）

| 優先 | 項目 | 說明 |
|------|------|------|
| 高 | HTTPS | 上線必備 |
| 高 | 環境變數／JWT secret | 避免密鑰進版控 |
| 中 | Rate limit（登入／註冊） | 防暴力嘗試 |
| 中 | API 輸入驗證 | 防注入與惡意 payload |
| 中 | Security headers (helmet) | 低成本、效益高 |
| 低 | CORS 收緊 | 正式環境限定來源 |
| 低 | 登入驗證碼／後台路徑隱藏 | 視需求 |

以上為原則性建議，實際實作時可依主機環境（Nginx／雲端）與維運能力分階段進行。
