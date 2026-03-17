# 台中建案平台 — 保姆級部署教學

> **我還沒有網域、主機，什麼都沒有？** 請先看 **[DEPLOY-從零開始.md](./DEPLOY-從零開始.md)**，會告訴你「不需要先買什麼」以及具體下一步。

這份教學假設你**沒部署過網站**，會從頭一步一步說明：什麼是部署、要設什麼、怎麼選、怎麼做。

---

## 第 0 步：先搞懂幾個名詞

### 什麼是「部署」？
就是把你的網站程式放到**一台 24 小時開著的電腦（主機）**上跑，讓別人用網址就能打開你的網站。你本機關機了，網站還是能開，那就是「上線了」。

### 什麼是「環境變數」？
程式需要一些**每個環境不同的設定**（例如正式機的密碼不能跟開發時一樣），這些設定用「變數」寫在環境裡，不寫在程式碼裡，比較安全。  
例如：`ADMIN_USERNAME=我的帳號`、`ADMIN_PASSWORD=我的密碼`。

### 什麼是「建置（build）」？
把原始碼（你寫的、改的）**打包成電腦真正會執行的檔案**，產出會放在專案裡的 `dist/` 資料夾。部署時通常是用建置後的檔案去跑，不是直接跑原始碼。

### 兩條路怎麼選？

| 你現在的情況 | 建議方式 | 難度 |
|------------|----------|------|
| 沒有自己的主機、想最快上線 | **PaaS（例如 Railway）**：註冊帳號、連 GitHub、按幾個鈕就上線 | ⭐ 較簡單 |
| 已有 VPS（例如買了雲端主機） | **VPS + PM2**：把程式上傳到主機，用 PM2 跑起來 | ⭐⭐ 需會一點指令 |

下面會分兩條路線寫：**路線 A（PaaS）** 和 **路線 B（VPS）**。你只要選一條照做即可。

---

## 第 1 步：部署前在「自己電腦」一定要做的事

這一步在**你目前的電腦**（放專案的那台）做就好，做完再決定要上傳到哪裡。

### 1-1 建置專案（產出可執行的檔案）

在專案資料夾裡打開**終端機**（Terminal），依序輸入：

```bash
# 進入專案目錄（請改成你實際的路徑）
cd /Users/tao/Downloads/taichung-projects-platform

# 安裝依賴（第一次或剛拉新程式時要做）
pnpm install

# 建置：會產生 dist/ 資料夾
pnpm run build
```

看到沒有報錯、最後有 `built in ...` 之類的訊息就代表成功。

### 1-2 設定環境變數（管理員帳號密碼）

程式需要知道「管理員帳號、密碼」才能登入後台，這些不能寫死在程式裡，所以要放在「環境變數」裡。

**在專案根目錄**（和 `package.json` 同一層）：

1. 找到檔案 **`.env.example`**（若沒有就自己建一個同名檔案）。
2. **複製一份**，把檔名改成 **`.env`**（前面一個點，後面是 env，沒有 example）。
3. 用文字編輯器打開 **`.env`**，照下面範例改（**帳號、密碼請改成你自己要用的**）：

```env
# 管理員帳號（登入後台時輸入）
ADMIN_USERNAME=daynight1003@

# 管理員密碼（請改成你的強密碼）
ADMIN_PASSWORD=Alice1003@

# 正式環境一定要設成 production
NODE_ENV=production
```

存檔後，**不要把 `.env` 上傳到 GitHub**（裡面有密碼）。專案通常已把 `.env` 放在 `.gitignore`，所以用 git 時不會傳上去。

### 1-3 本地先跑一次正式版（可選但建議做）

在自己電腦用「正式模式」跑，確認沒壞掉再部署。兩種方式擇一：

**方式一（一鍵建置＋啟動）：**
```bash
pnpm run deploy:test
```

**方式二（分開做）：**
```bash
pnpm run build
NODE_ENV=production pnpm start
```

然後用瀏覽器打開：**http://localhost:3000**  
- 前台首頁能開  
- 點「後台」或開 **http://localhost:3000/admin/login** 能登入（用你剛在 .env 設的帳號密碼）  

沒問題就關掉（在終端機按 `Ctrl+C`），繼續下一步。

---

## 路線 A：用 PaaS 一鍵部署（推薦新手）

PaaS 是「別人幫你管主機」，你只要把程式碼給它、設好變數，它就幫你建置、開機、給網址。這裡以 **Railway** 為例（有免費額度、步驟少）。

### A-1 事前準備

1. 把專案放到 **GitHub**（若還沒有：在 GitHub 建一個 repo，把專案 push 上去）。
2. 到 [railway.app](https://railway.app) 註冊／登入（可用 GitHub 登入）。

### A-2 在 Railway 建立專案

1. 登入後點 **New Project**。
2. 選 **Deploy from GitHub repo**。
3. 選你的 **taichung-projects-platform** 那個 repo（若沒出現，先到 GitHub 授權 Railway 讀取你的 repo）。
4. 選好後 Railway 會建立一個「專案」，並嘗試自動偵測怎麼建置。我們要手動設定一次。

### A-3 設定「怎麼建置、怎麼啟動」

在專案裡會有一個「服務」（Service），點進去：

1. 點 **Settings** 或 **Configure**。
2. **Build Command**（建置指令）填：
   ```bash
   pnpm install && pnpm run build
   ```
3. **Start Command**（啟動指令）填：
   ```bash
   pnpm start
   ```
4. **Root Directory** 維持專案根目錄（通常留空即可）。
5. 若有一欄 **Output Directory** 或 **Build Output**，本專案不需要特別設（我們用 `dist/`，程式會自己找）。

儲存。

### A-4 設定環境變數（重要）

在同一個服務的 **Variables** 分頁（或 **Environment**）：

1. 點 **Add Variable** 或 **New Variable**。
2. 依序新增（名稱與值都要正確）：

   | 變數名稱 | 值 | 說明 |
   |---------|-----|------|
   | `NODE_ENV` | `production` | 必填，代表正式環境 |
   | `ADMIN_USERNAME` | 你的管理員帳號 | 例如 `daynight1003@` |
   | `ADMIN_PASSWORD` | 你的管理員密碼 | 請用強密碼 |

3. **PORT**：Railway 通常會自動給你一個 `PORT`，**不要自己再設**，程式會讀取它。若沒有自動給，再手動加 `PORT=3000`。

儲存後，Railway 通常會自動重新部署一次。

### A-5 取得網址

1. 在服務的 **Settings** 裡找 **Networking** 或 **Domains**。
2. 點 **Generate Domain**（或類似按鈕），Railway 會給你一個網址，例如：`xxx.up.railway.app`。
3. 用瀏覽器打開這個網址，應該就能看到你的網站；**/admin/login** 用你設的帳號密碼登入。

之後你只要 **push 程式碼到 GitHub**，Railway 會自動再建置、再部署（若沒有，到 Deployments 手動點 Redeploy）。

### A-6 資料會不見嗎？

- 本專案的**後台資料**（業務、建案、上傳的圖片等）存在 **主機的檔案裡**（`server/data/`、`dist/public/` 等）。
- PaaS 重開或重新部署時，若沒有「持久化磁碟」，**這些檔案可能會被清掉**。
- 若 Railway 有提供 **Volume**（持久化儲存），可把寫入資料的目錄掛到 Volume；若沒有，就要定期自己備份重要資料，或之後改接資料庫／雲端儲存。

---

## 路線 B：部署到自己的 VPS（例如 Ubuntu）

適用：你已經有一台「雲端主機」（例如 AWS、GCP、DigitalOcean、Linode 的 Ubuntu）。

### B-1 主機要具備的環境

在主機上需要：

- **Node.js 20 以上**（建議用 nvm 安裝：`nvm install 20 && nvm use 20`）
- 若要用網域 + HTTPS，需要 **Nginx**（可之後再裝）

### B-2 把程式弄到主機上

兩種方式擇一：

**方式 1：主機上直接拉 Git 再建置**

```bash
# 假設你已裝好 git、Node、pnpm
cd /home/你的使用者名稱   # 或你想放的目錄
git clone https://github.com/你的帳號/taichung-projects-platform.git
cd taichung-projects-platform
pnpm install --frozen-lockfile
pnpm run build
```

**方式 2：在自己電腦建置好，只上傳 dist/ 和必要檔案**

在自己電腦：

```bash
pnpm run build
```

然後用 **scp**、**rsync** 或 **FTP** 把整個專案（或至少 `dist/`、`package.json`、`pnpm-lock.yaml`）上傳到 VPS 的某個目錄，再在 VPS 上該目錄執行 `pnpm install --prod`（或 `pnpm install`）以安裝執行時需要的套件。  
（若你只上傳 `dist/`，就要在 VPS 也有一份能跑 `node dist/index.js` 的 Node 環境與依賴，通常保留整個專案較簡單。）

### B-3 在主機上設定環境變數

在 VPS 上，在專案目錄裡建一個 **`.env`** 檔（和路線 A 的內容一樣）：

```bash
cd /path/to/taichung-projects-platform
nano .env
```

內容貼上（帳號密碼改成你的）：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=你的管理員帳號
ADMIN_PASSWORD=你的管理員密碼
```

存檔（nano 是 `Ctrl+O` 存、`Ctrl+X` 離開）。

若你的 Node 程式不會自動讀專案目錄的 `.env`，就要用下面的方式在啟動時帶入（見 B-4）。

### B-4 用 PM2 讓程式一直跑、關機重開也會自動跑

PM2 是一個「程式管理員」，可以讓你的 Node 網站一直在背景跑，壞掉會重啟，重開機也會自動再開。

```bash
# 安裝 PM2（全機裝一次即可）
npm install -g pm2

# 進入專案目錄
cd /path/to/taichung-projects-platform

# 用 PM2 啟動（程式會讀同目錄的 .env）
pm2 start dist/index.js --name taichung-platform

# 看一下有沒有在跑
pm2 status

# 設定「開機時自動啟動」
pm2 save
pm2 startup
# 最後一行會要你複製一段指令再執行，照做即可
```

之後若要重啟：

```bash
pm2 restart taichung-platform
```

若要看日誌：

```bash
pm2 logs taichung-platform
```

### B-5 用 Nginx 對外 80 / 443（可選）

若你希望別人用 **80 或 443 port**（或網域）連進來，而不是 `http://主機IP:3000`，就要在 VPS 上裝 Nginx，把請求「轉發」給本機的 3000 port。

1. 安裝 Nginx（以 Ubuntu 為例）：
   ```bash
   sudo apt update
   sudo apt install nginx
   ```
2. 新增一個站台設定檔，例如：
   ```bash
   sudo nano /etc/nginx/sites-available/taichung-platform
   ```
3. 貼上（把 `你的網域或主機IP` 改成實際的）：
   ```nginx
   server {
       listen 80;
       server_name 你的網域或主機IP;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. 啟用站台並重載 Nginx：
   ```bash
   sudo ln -s /etc/nginx/sites-available/taichung-platform /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

之後用 `http://你的網域或IP` 就可以打開網站。HTTPS 可用 **Let's Encrypt**（例如 `sudo apt install certbot python3-certbot-nginx`，再 `sudo certbot --nginx`）。

### B-6 資料備份

- 後台寫入的資料在 **`server/data/`** 以及 **`dist/public/`**（例如上傳的圖片）。
- 重新部署若會**覆蓋** `dist/` 或整個專案目錄，**部署前請先備份**這些目錄（或整機備份）。
- 若希望長期保留，可把 `server/data/` 或 `dist/public` 掛到另一顆磁碟或定期用腳本打包備份。

---

## 部署後檢查清單

- [ ] 用瀏覽器打開網站首頁，能正常顯示。
- [ ] 打開 **/admin/login**，用你設的 **ADMIN_USERNAME**、**ADMIN_PASSWORD** 能登入後台。
- [ ] 後台能正常操作（建案、市場動態、業務管理等）。
- [ ] 若你有用 Nginx + 網域，確認網址與（若有）HTTPS 都正常。

---

## 常見問題

**Q：我沒有 GitHub，可以部署嗎？**  
A：可以。路線 B 的 VPS 可以用 **scp / rsync** 把本機的專案或 `dist/` 上傳上去，不一定要用 Git。路線 A 的 Railway 則通常要連 GitHub（或 GitLab 等），建議先申請一個 GitHub 帳號並把專案放上去。

**Q：.env 會不會被上傳到 GitHub？**  
A：專案裡應把 `.env` 寫在 `.gitignore`，所以正常不會。上傳前可用 `git status` 看一下，確認沒有 `.env` 再 push。

**Q：改程式後要怎麼「更新」網站？**  
A：  
- **PaaS**：改完程式後 push 到 GitHub，PaaS 會自動建置並重新部署（或到後台手動 Redeploy）。  
- **VPS**：在 VPS 上 `git pull`（或重新上傳檔案），再執行 `pnpm run build`，然後 `pm2 restart taichung-platform`。

**Q：PORT 要設多少？**  
A：  
- 本機測試：用 3000 即可，或自訂一個沒被佔用的 port。  
- PaaS：通常平台會自動給 `PORT`，**不要**在後台再設成 3000，用平台給的。  
- VPS：若沒有 Nginx，對外就是 3000，可在 .env 設 `PORT=3000`；若用 Nginx 反代，Nginx 聽 80，程式聽 3000 即可。

---

完成以上任一路線，你的網站就已經「實際上線」了。若你告訴我你是用 **Railway / Render / Fly.io** 還是 **自己的 VPS**，我可以再幫你寫一份「只針對那個環境」的縮短版步驟（例如只做 Railway 或只做 VPS + PM2）。
