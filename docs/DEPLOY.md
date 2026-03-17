# 台中建案平台 — 部署到網路教學

> **第一次部署、不熟指令？** 請先看 **[DEPLOY-保姆級教學.md](./DEPLOY-保姆級教學.md)**，從零開始一步一步說明。

本專案為 **前後端一體**：Vite 建置前端到 `dist/public`，Express 後端打包到 `dist/index.js`，正式環境由單一 Node 程式提供網頁與 API。

---

## 一、部署前：本地建置與測試

在專案根目錄執行：

```bash
# 安裝依賴（若尚未安裝）
pnpm install

# 建置：前端 + 後端一次產出到 dist/
pnpm run build

# 本地以「正式模式」跑一次，確認沒問題
NODE_ENV=production pnpm start
```

瀏覽 `http://localhost:3000`，確認前台、後台、API 都正常後再部署。

---

## 二、需要設定的環境變數

| 變數 | 說明 | 必填 |
|------|------|------|
| `NODE_ENV` | 正式環境請設為 `production` | 是 |
| `PORT` | 服務監聽的 port，未設時正式環境預設 `3000` | 否 |
| `ADMIN_USERNAME` | 管理員登入帳號（與 ADMIN_PASSWORD 搭配） | 建議設 |
| `ADMIN_PASSWORD` | 管理員登入密碼 | 建議設 |
| `ADMIN_API_KEY` | 後台 API 金鑰（選填，可替代帳密） | 選填 |

範例（依實際部署方式設定，見下文）：

```bash
export NODE_ENV=production
export PORT=3000
export ADMIN_USERNAME=你的管理員帳號
export ADMIN_PASSWORD=你的後台密碼
export ADMIN_API_KEY=你的API金鑰  # 選填
```

---

## 三、方式 A：部署到自己的 VPS（如 Ubuntu）

適用：已有主機（AWS、GCP、DigitalOcean、Linode 等），想自己控管。

### 1. 主機準備

- 安裝 **Node.js 20+**（建議用 nvm：`nvm install 20 && nvm use 20`）
- 若要對外 80/443，需安裝 **Nginx** 做反向代理與（可選）HTTPS

### 2. 上傳程式碼並建置

```bash
# 在 VPS 上（或本機建置後上傳 dist/）
cd /path/to/taichung-projects-platform
pnpm install --frozen-lockfile
pnpm run build
```

### 3. 用 PM2 常駐執行

```bash
# 安裝 PM2（若尚未安裝）
npm install -g pm2

# 設定環境變數後啟動（可寫成 ecosystem.config.js 或 .env）
export NODE_ENV=production
export PORT=3000
export ADMIN_PASSWORD=你的密碼
export ADMIN_API_KEY=你的金鑰

pm2 start dist/index.js --name taichung-platform

# 開機自動重啟
pm2 save && pm2 startup
```

### 4. 用 Nginx 反代 + HTTPS（可選）

讓 Nginx 監聽 80/443，把請求轉給 Node（例如 port 3000）：

```nginx
# /etc/nginx/sites-available/taichung-platform
server {
    listen 80;
    server_name 你的網域或IP;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

啟用站台並重載 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/taichung-platform /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

HTTPS：可用 **Let's Encrypt**（例如 `sudo apt install certbot python3-certbot-nginx`，再 `sudo certbot --nginx`）。

---

## 四、方式 B：部署到雲端 PaaS（免自己管主機）

適合：不想管 VPS，用雲端一鍵部署。

### Railway（推薦，有免費額度）

1. 到 [railway.app](https://railway.app) 註冊， New Project → **Deploy from GitHub**（或上傳程式碼）。
2. 根目錄選本專案，**Build Command** 填：`pnpm install && pnpm run build`
3. **Start Command** 填：`pnpm start`
4. **Variables** 新增：
   - `NODE_ENV` = `production`
   - `PORT` = 由 Railway 自動注入時可不用設
   - `ADMIN_PASSWORD`、`ADMIN_API_KEY` 自訂
5. 部署完成後在 Settings → **Generate Domain**，即可得到對外網址。

### Render

1. [render.com](https://render.com) → New → **Web Service**，連到你的 GitHub 專案。
2. **Build Command**：`pnpm install && pnpm run build`
3. **Start Command**：`pnpm start`
4. **Environment** 加上 `NODE_ENV=production`、`ADMIN_PASSWORD`、`ADMIN_API_KEY`。
5. 儲存後會自動建置並給一個 `.onrender.com` 網址。

### Fly.io

1. 安裝 [flyctl](https://fly.io/docs/hands-on/install-flyctl/) 並登入。
2. 在專案根目錄執行 `fly launch`，依提示選 region、是否要 PostgreSQL（本專案可先選 No）。
3. 在 `fly.toml` 確認或設定：
   - `[env]` 內 `NODE_ENV = "production"`
   - 若有 `PORT`，設成 `8080`（或與 Fly 注入的 `PORT` 一致）。
4. 設定 secrets：`fly secrets set ADMIN_PASSWORD=xxx ADMIN_API_KEY=xxx`
5. 部署：`fly deploy`

---

## 五、上傳檔案與資料持久化

- **建案圖片**：正式環境會寫入 `dist/public/project-images/`（由後台「建案圖片」上傳）。
- **市場動態圖片**：寫入 `client/public/market-news/`；建置時會一併被複製到 `dist/public`，因此部署前若在 `client/public/market-news/` 放好圖檔，建置後會一起上線。
- **資料檔**（如 `client/src/data/projects.json`、`market-news.json`）：目前是「建置時打包進前端／後端讀取」；若後台有「寫回檔案」功能，寫入路徑會依伺服器實際目錄而定。**重新部署覆蓋 dist/ 時，未備份的上傳與寫入資料會消失**。
- 若希望**永久保留**上傳與後台寫入的資料，建議：
  - VPS：把 `dist/public/project-images`（或整個 `dist/public`）掛成 **volume** 或定期備份。
  - PaaS：使用該平台提供的 **持久化磁碟 / Volume**，並把上傳目錄指到該磁碟；或改為使用雲端儲存（如 S3）需再改程式。

---

## 六、部署檢查清單

- [ ] `pnpm run build` 成功，且 `NODE_ENV=production pnpm start` 本地可開
- [ ] 環境變數已設：`NODE_ENV=production`，以及（建議）`ADMIN_PASSWORD`、`ADMIN_API_KEY`
- [ ] 若用 VPS：PM2 或 systemd 已設成開機重啟；若用 Nginx，已反代到 Node 的 PORT
- [ ] 若要 HTTPS：已用 Let's Encrypt 或 PaaS 內建憑證
- [ ] 後台登入、建案/市場動態編輯、圖片上傳皆可正常使用
- [ ] 前台首頁、建案總覽、市場動態、房產工具等頁面可正常開啟

完成以上步驟後，網站即可在網路上對外提供服務。
