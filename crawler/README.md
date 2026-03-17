# 萬用爬蟲 (Universal Crawler)

可設定「要的條件」、「不要的條件」、儲存位置與檔案格式的通用爬蟲工具。

## 三種使用方式

| 方式 | 說明 |
|------|------|
| **網頁版** | 專案執行後前往「房產實用工具」→「萬用爬蟲」，填表執行並**下載 JSON/CSV** 至本機。 |
| **Mac 桌面版** | 在 `electron-app/` 執行 `npm install` 與 `npm start`，可**選擇儲存資料夾**，結果直接寫入。 |
| **CLI** | `pnpm crawler` 或 `node crawler/cli.js --config crawler/config.json --out-dir ./out --format csv`。 |

## 功能總覽

| 類別 | 功能 |
|------|------|
| **搜尋條件 (include)** | 多組 URL 規則、多組內容規則（關鍵字、數值區間、正則等） |
| **排除條件 (exclude)** | 多組 URL 規則、多組內容規則，符合即排除 |
| **儲存** | 自訂目錄、檔名、格式（JSON / CSV / NDJSON） |
| **擴充** | 請求延遲、重試、逾時、最大頁數、User-Agent 等 |

## 快速開始

1. **安裝依賴**（專案根目錄已含 axios，需補裝 cheerio）  
   ```bash
   pnpm add cheerio
   ```

2. **建立設定檔**  
   複製範例並依需求修改：  
   ```bash
   cp crawler/config.example.json crawler/config.json
   ```

3. **執行爬蟲**  
   ```bash
   pnpm crawler
   ```
   或指定設定檔與輸出：  
   ```bash
   pnpm crawler --config crawler/config.json --out-dir ./output --format csv
   ```

## 設定說明

### 必填

- **`entryUrls`**：起始網址陣列，爬蟲會從這裡開始並依 `selectors.listLink` 發現更多連結。

### 搜尋條件 (include) — 都要符合才會保留

- **`include.urlPatterns`**：URL 正則或字串，**至少符合一個**才會進入；不設則不篩 URL。
- **`include.contentRules`**：內容規則陣列，**全部符合**才保留。每筆規則可為：
  - `{ "field": "欄位名", "match": "關鍵字", "type": "includes" }`  
    `type` 可為：`includes`、`startsWith`、`endsWith`、`equals`、`regex`
  - `{ "field": "欄位名", "min": 100, "max": 10000 }`  
    數值區間（該欄位會自動轉成數字比對）

### 不要的條件 (exclude) — 符合任一即排除

- **`exclude.urlPatterns`**：URL 正則或字串，符合任一即排除。
- **`exclude.contentRules`**：內容規則（格式同 include），符合任一即排除。

### 儲存位置與檔案格式

- **`output.dir`**：儲存目錄（可為相對或絕對路徑）。
- **`output.filename`**：檔名（不含副檔名時會依 format 自動加）。
- **`output.format`**：`json` | `csv` | `ndjson`。

### 選擇器 (selectors)

- **`selectors.listLink`**：列表頁上「詳情連結」的 CSS 選擇器（如 `a.item-link`），用於發現下一批 URL。
- **`selectors.fields`**：從每個頁面擷取的欄位，鍵為欄位名、值為 CSS 選擇器。  
  例：`{ "title": "h1", "content": ".content", "price": ".price" }`  
  擷取結果會自動帶上 `url` 欄位。

### 選項 (options)

- **`maxPages`**：最多擷取頁數（預設 100）。
- **`delayMs`**：每頁間隔毫秒（預設 1000）。
- **`timeoutMs`**：單一請求逾時毫秒（預設 15000）。
- **`retries`**：失敗重試次數（預設 3）。
- **`userAgent`**：請求標頭 User-Agent。

## 可再擴充的功能建議

1. **排程執行**：用 cron 或 node-cron 定時跑爬蟲。
2. **代理 (Proxy)**：支援 HTTP/SOCKS 代理，避免 IP 被封。
3. **Cookie / 登入**：支援從檔案或環境變數讀入 Cookie，爬需登入的站。
4. **Headless 瀏覽器**：對 SPA 或需執行 JS 的頁面，可選用 Puppeteer/Playwright 渲染後再擷取。
5. **增量爬取**：記錄已爬過的 URL 或雜湊，下次只爬新資料。
6. **重複過濾**：依指定欄位（如 ID、URL）去重。
7. **日誌與錯誤檔**：將錯誤 URL 或失敗原因寫入獨立檔案，方便重跑。
8. **進度存檔**：支援中斷後從上次佇列/進度續爬。
9. **多種輸出**：同一次爬取同時輸出 JSON + CSV，或依條件分檔。
10. **簡單 UI**：用現有 React 專案加一頁「爬蟲設定表單」，填表後呼叫後端執行並下載結果。

以上可依需求逐步加在現有 `crawler/` 與 `lib/` 結構上，不影響現有 include/exclude 與輸出格式邏輯。
