# 台中建案平台 — 檔案功能／語法說明與後台評估

## 一、資料夾中每個檔案的功能與編輯語法

### 1. 根目錄設定檔

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `package.json` | 專案依賴、scripts、pnpm 設定 | **JSON**。修改 `dependencies` / `scripts` 後執行 `pnpm install`。 |
| `tsconfig.json` | TypeScript 編譯設定（路徑、strict 等） | **JSON**。改完存檔即生效，必要時重開 IDE。 |
| `tsconfig.node.json` | Node 端（Vite）TS 設定 | **JSON**。同上。 |
| `vite.config.ts` | Vite 建置、alias、plugin、dev server | **TypeScript**。改完重跑 `pnpm dev`。 |
| `components.json` | shadcn/ui 元件設定（路徑、style 等） | **JSON**。新增元件時會參考。 |

---

### 2. 前端入口與全域

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/index.html` | SPA 單頁 HTML、meta、title、字型、analytics | **HTML**。title/description 可直接改文字；script 用 `%VITE_*%` 需在 .env 定義。 |
| `client/src/main.tsx` | React 掛載點、載入全域 CSS | **TSX**。通常不需改。 |
| `client/src/App.tsx` | 路由外層、Provider、Navbar/Footer/CompareDock/Line 按鈕 | **TSX**。新增頁面要在這裡的 `<Route>` 加一筆。 |
| `client/src/index.css` | Tailwind + CSS 變數、theme、container、品牌樣式 | **CSS**。顏色/字型改 `:root` 或 `@theme` 變數。 |

---

### 3. 資料檔（後台要改的核心）

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/src/data/projects.json` | **建案主資料**。含 `source`、`updated`、`owner`、`total_projects`、`projects[]`。每個建案欄位見下方「建案欄位一覽」。 | **JSON**。嚴格 JSON 語法；陣列順序可調整；新增建案需補齊 `id`（唯一）、並與 `lib/types.ts` 的 `Project` 介面一致。 |
| `client/src/data/zones.json` | **重劃區主資料**。陣列，每筆：`zone_name`、`development_type`、`core_features`、`in_depth_analysis`、`key_facilities`。 | **JSON**。`zone_name` 為唯一識別；`key_facilities` 多行字串，格式為「類別：項目1、項目2」。 |
| `client/src/data/builders.json` | **建設公司主資料**。陣列，每筆：`builder_name`、`parent_group`、`core_slogan`、`in_depth_analysis`、`construction_partner`、`after_sales_service`、`classic_style`。 | **JSON**。`builder_name` 為唯一識別，需與對應表一致。 |
| `client/src/data/zone_name_map.json` | **重劃區名稱對應**。建案裡的「重劃區」欄位值 → `zones.json` 的 `zone_name`。 | **JSON**。鍵值對 `{ "建案用名稱": "zones 標準名稱" }`。新增重劃區或別名時要維護。 |
| `client/src/data/builderNameMap.json` | **建設公司名稱對應**。建案裡的「建設公司」欄位值 → `builders.json` 的 `builder_name`。 | **JSON**。鍵值對 `{ "建案用名稱/別名": "builders 標準名稱" }`。 |

**建案單筆物件欄位一覽（projects.json 內 `projects[]` 的一筆）：**

- 必備／常用：`id`（數字唯一）、`建案名稱`、`建設公司`、`行政區`、`重劃區`、`建案位置`、`基地面積坪`、`建築結構`、`floors`（物件）、`units`（物件）、`戶梯配置`、`房型規劃`（陣列）、`parking`（物件）、`完工日期`、`公設配置`、`交通`、`學區`、`商圈`、`綠地`、`連結`、`備註`、`tags`（陣列）
- Phase 2 擴充：`construction_group`、`room_types_standard`（陣列）、`elevator_ratio`（數字）、`elevator_grade`、`community_size`
- 文案／AI：`slogans`（物件，五類標語）、`description_500`

---

### 4. 型別與常數（後台需對齊）

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/src/lib/types.ts` | `Project`、`ProjectsData`、`DISTRICTS`、`ZONES`、`ELEVATOR_GRADES`、`COMMUNITY_SIZE_INFO`、`CONSTRUCTION_GROUPS`、`STANDARD_ROOM_TYPES`、`isDataIncomplete`、`getDataCompleteness` 等 | **TypeScript**。新增列舉或常數時，後台表單選項要同步（例如行政區、重劃區、電梯評級、社區規模）。 |
| `client/src/lib/sloganCategories.ts` | 五大標語分類的樣式與 icon（地段價值、品牌建築等） | **TypeScript**。若新增標語分類需改這裡與 types 的 SLOGAN_CATEGORIES。 |
| `client/src/lib/utils.ts` | `cn()` 等共用工具 | **TypeScript**。一般不改。 |
| `client/src/const.ts` | OAuth 登入 URL、re-export shared 常數 | **TypeScript**。若不做登入可不改。 |
| `shared/const.ts` | Cookie 名稱、一年毫秒數等 | **TypeScript**。常數定義。 |

---

### 5. 頁面（Pages）

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/src/pages/Home.tsx` | 首頁：Hero、熱區快選、精選建案、關於學韜、CTA | **TSX**。改文案、圖片 URL、精選建案名單、HOT_ZONES。 |
| `client/src/pages/Projects.tsx` | 建案總覽：篩選、排序、卡片列表 | **TSX**。篩選邏輯在 `useProjects`；版面與篩選 UI 在此。 |
| `client/src/pages/ProjectDetail.tsx` | 建案詳情：標題、建設公司、五大標語、規格、電梯/社區卡、生活資訊 | **TSX**。顯示邏輯與欄位對應。 |
| `client/src/pages/Compare.tsx` | 建案比較：橫向表格、五大標語與基本/生活機能 | **TSX**。比較欄位與表格結構。 |
| `client/src/pages/About.tsx` | 關於我們、店點、服務理念、平台說明 | **TSX**。文案與聯絡資訊。 |
| `client/src/pages/ZoneList.tsx` | 重劃區列表：依開發類型分組、搜尋 | **TSX**。資料來自 `zones.json`。 |
| `client/src/pages/ZoneDetail.tsx` | 重劃區詳情：深度分析、關鍵設施、本區建案列表 | **TSX**。依 `zone_name` 與 `zone_name_map` 對應建案。 |
| `client/src/pages/NotFound.tsx` | 404 頁 | **TSX**。文案與按鈕。 |

---

### 6. 元件（Components）

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/src/components/Navbar.tsx` | 頂部導航、Logo、選單、Line CTA、比較數量 | **TSX**。連結與按鈕。 |
| `client/src/components/Footer.tsx` | 底部品牌、聯絡方式、快速連結、免責聲明 | **TSX**。文案與連結。 |
| `client/src/components/ProjectCard.tsx` | 建案卡片：標題、建設公司、行政區/重劃區、標語、規格、比較按鈕 | **TSX**。卡片版面與欄位。 |
| `client/src/components/CompareDock.tsx` | 底部比較列：已選建案、清除、開始比較 | **TSX**。 |
| `client/src/components/FloatingContactBar.tsx` | 右下浮動：Line、電話、回頂部 | **TSX**。 |
| `client/src/components/LineFloatingButton.tsx` | 右下 Line 按鈕（與 CompareDock 錯開） | **TSX**。 |
| `client/src/components/CommunitySizeCard.tsx` | 社區規模卡：優缺點、說明 | **TSX**。 |
| `client/src/components/ElevatorGradeCard.tsx` | 電梯比卡：評級、尺度條 | **TSX**。 |
| `client/src/components/FloatingContactBar.tsx` | 建案詳情頁浮動聯絡欄 | **TSX**。 |
| `client/src/components/Map.tsx` | Google Maps 地圖（目前未使用） | **TSX**。需 API key 與 mapId。 |
| `client/src/components/ErrorBoundary.tsx` | 錯誤邊界、錯誤訊息與重新載入 | **TSX**。可改為中文文案。 |
| `client/src/components/ManusDialog.tsx` | Manus AI 對話（若啟用） | **TSX**。 |
| `client/src/components/ui/*.tsx` | shadcn 共用 UI（Button、Card、Select 等） | **TSX**。一般只改樣式或 props，不建議改結構。 |

---

### 7. Context 與 Hooks

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `client/src/contexts/CompareContext.tsx` | 比較清單狀態、localStorage 持久化、最多 5 筆 | **TSX**。若要改上限改 `MAX_COMPARE`。 |
| `client/src/contexts/ThemeContext.tsx` | 亮/暗主題、localStorage、是否可切換 | **TSX**。 |
| `client/src/hooks/useProjects.ts` | 從 `projects.json` 讀取、篩選、排序、builder/房型/電梯/社區選項 | **TSX**。篩選邏輯在此；資料來源固定為 `@/data/projects.json`。 |
| `client/src/hooks/useRedevelopmentZones.ts` | 讀取 `zones.json`、`zone_name_map`、依重劃區篩建案 | **TSX**。 |
| `client/src/hooks/useBuilder.ts` | 依建設公司名稱查 `builders.json`（經 builderNameMap） | **TSX**。 |
| `client/src/hooks/useRandomSlogans.ts` | 從建案 slogans 抽 3 條顯示（穩定亂序） | **TSX**。 |
| `client/src/hooks/useMobile.tsx` | 是否為行動裝置 | **TSX**。 |
| `client/src/hooks/usePersistFn.ts` | 穩定 callback 參考 | **TSX**。 |
| `client/src/hooks/useComposition.ts` | 複合欄位（若有用到） | **TSX**。 |

---

### 8. 後端

| 檔案 | 功能 | 編輯語法／格式 |
|------|------|----------------|
| `server/index.ts` | Express 靜態檔、SPA fallback、port | **TypeScript**。新增 API 時在此加 `app.get/post('/api/...', ...)`。 |

---

## 二、後台需求：新增/修改 建案／重劃區／建設公司

### 2.1 現狀摘要

- **資料來源**：全部來自前端靜態 JSON（`projects.json`、`zones.json`、`builders.json`、`zone_name_map.json`、`builderNameMap.json`）。
- **目前沒有**：資料庫、後端 CRUD API、登入權限、後台 UI。
- **前端讀取**：Vite 建置時把 JSON 打包進去，執行時直接 `import`，沒有透過 HTTP API。

因此「後台」= 要能**安全地新增/修改**這幾份 JSON，並讓前台下次載入時用到新資料。

---

### 2.2 三種實作方向

| 方案 | 作法 | 難度 | 可執行性 | 備註 |
|------|------|------|----------|------|
| **A. 純前端 + 手動改 JSON** | 不用後台，用編輯器或簡易腳本改 JSON，重新 build 部署。 | ⭐ 極低 | ✅ 立即可做 | 不適合非技術人員；易出錯（漏逗號、編碼）。 |
| **B. 簡易後台 + 寫回 JSON 檔** | 新增後台 SPA + Express API：讀寫專案目錄下的 JSON 檔，部署時這些檔一起上線。 | ⭐⭐ 中 | ✅ 可行 | 需處理：同時寫入、備份、權限（誰能呼叫 API）。 |
| **C. 資料庫 + API + 前台改吃 API** | 建案/重劃區/建設公司存進 DB（如 SQLite/Postgres），後台與前台都透過 API 存取；可選「建置時從 API 產出靜態 JSON」或「前台即時 fetch」。 | ⭐⭐⭐ 中高 | ✅ 可執行，工較多 | 架構最穩、易擴充、易做權限與稽核。 |

---

### 2.3 難度與可執行性評估（方案 B／C）

#### 方案 B：後台寫回 JSON

- **難度**：中等（約 3–5 天，視表單完整度）
- **要做的**：
  1. **後端**：在 `server/index.ts` 加 API，例如  
     - `GET /api/admin/projects`、`GET /api/admin/projects/:id`  
     - `POST/PUT /api/admin/projects`（寫入 `client/src/data/projects.json`）  
     - 同理 `zones`、`builders`、`zone_name_map`、`builderNameMap`  
     寫檔用 `fs.writeFileSync`（或非同步版），路徑指向專案內 data 目錄。
  2. **權限**：用簡單 API Key 或 Session（例如登入頁只給你知道的密碼），在 middleware 檢查，通過才允許寫入。
  3. **後台 SPA**：新路由如 `/admin`（或獨立子網域），表單欄位對齊：
     - **建案**：對照 `Project` 型別與上面「建案欄位一覽」逐欄表單（可分頁/分群：基本、樓層戶數、生活機能、標語、Phase2 欄位）。
     - **重劃區**：`zone_name`、`development_type`、`core_features`、`in_depth_analysis`、`key_facilities`（多行或結構化）。
     - **建設公司**：`builder_name`、`parent_group`、`core_slogan`、`in_depth_analysis`、`construction_partner`、`after_sales_service`、`classic_style`。
  4. **對應表**：後台加「重劃區對應」「建設公司對應」管理，寫入 `zone_name_map.json`、`builderNameMap.json`。
- **風險**：多人或同時存檔可能覆寫；建議存檔前讀取最新檔再寫回，或加簡易鎖。另需**定期備份** JSON（例如每日複製到備份目錄或雲端）。

**可執行性**：✅ 高。技術都在你現有 stack（Express + React）內，不需新語言或新服務。

---

#### 方案 C：資料庫 + API

- **難度**：中高（約 1–2 週，含 schema 設計、遷移、前台改為 fetch）
- **要做的**：
  1. **DB**：選 SQLite（單機）或 Postgres（若要擴充）。建表：`projects`、`zones`、`builders`、`zone_name_map`、`builder_name_map`（或合併進 builders/zones 表）。
  2. **後端**：同一支 Express 加 CRUD API，改為讀寫 DB 而非讀寫 JSON；必要時保留「匯出 JSON」API，給現有前端 build 用。
  3. **前台**：可選 (a) 建置時呼叫「匯出 JSON」產出 `projects.json` 等，沿用現有 import；或 (b) 前台改成 `useEffect` + `fetch('/api/projects')` 等，不再打包 JSON。
  4. **後台**：同上，但呼叫同一組 API；權限用登入 + JWT 或 Session。
- **可執行性**：✅ 高。需要較多時間設計 schema 與遷移既有 JSON 進 DB，但一次做對後維護與擴充都較容易。

---

### 2.4 建議優先順序

1. **短期**：若只有你或一位同仁改資料，可先用 **方案 A**（手動改 JSON + 必要時用你現有 `yongching-xitun-website` 的腳本產出/轉換 JSON），再部署平台。
2. **中期**：若要給業主或助理「在瀏覽器裡改建案/重劃區/建設公司」，做 **方案 B**（後台 SPA + Express 寫回 JSON），並加簡單登入與備份。
3. **長期**：若預期建案量或多人維護會再增加，再規劃 **方案 C**（DB + API），把現有 JSON 匯入一次，後台與前台都改吃 API。

---

### 2.5 後台表單欄位對照（方便實作）

- **建案**：依 `client/src/lib/types.ts` 的 `Project` 與 `projects.json` 實際欄位，至少包含：建案名稱、建設公司、行政區、重劃區、建案位置、基地面積坪、建築結構、樓層（地上/地下/description）、戶數、戶梯配置、房型規劃、車位、完工日期、公設、交通、學區、商圈、綠地、連結、備註、tags；Phase2：construction_group、room_types_standard、elevator_ratio、elevator_grade、community_size；slogans 五類、description_500。id 由後端產生（新增時取 max id + 1）。
- **重劃區**：zone_name、development_type、core_features（多行）、in_depth_analysis（多行）、key_facilities（多行，類別：項目）。
- **建設公司**：builder_name、parent_group、core_slogan、in_depth_analysis、construction_partner、after_sales_service、classic_style。
- **對應表**：介面為「建案用名稱 → 對應到的標準名稱」，存進 `zone_name_map.json` / `builderNameMap.json`。

若你決定採用 B 或 C，我可以再幫你細化 API 路徑、請求/回應格式，或後台頁面路由與權限設計。
