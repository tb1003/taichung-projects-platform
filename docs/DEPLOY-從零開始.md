# 我什麼都沒有，該怎麼下一步？

你現在：**沒有網域、沒有主機、沒部署過**。沒關係，照下面順序做就對了。

---

## 一句話結論

**你不需要先買網域或主機。**  
先用 **Railway**（或類似 PaaS）**免費**把網站放上網路，它會給你一個「免費網址」。等以後想用自己的網域，再買、再綁定即可。

---

## 你需要準備的（幾乎都是免費）

| 項目 | 需要嗎？ | 說明 |
|------|----------|------|
| **自己電腦** | ✅ 需要 | 你現在開發用的那台就可以。 |
| **Node.js / pnpm** | ✅ 需要 | 專案本來就要，你應該已經裝了。 |
| **GitHub 帳號** | ✅ 需要 | 免費註冊 [github.com](https://github.com)，用來放程式碼，給 Railway 拉。 |
| **Railway 帳號** | ✅ 需要 | 免費註冊 [railway.app](https://railway.app)，用 GitHub 登入即可。 |
| **網域** | ❌ 先不需要 | 先用 Railway 給的免費網址（例如 `xxx.up.railway.app`）。 |
| **VPS / 主機** | ❌ 先不需要 | 用 PaaS 就不必自己買主機。 |
| **信用卡** | ❌ 通常不需要 | Railway 免費額度內不用綁卡（依官方當時規定為準）。 |

所以下一步**不是**去買網域或主機，而是：**把程式碼放到 GitHub → 用 Railway 連上去 → 取得免費網址**。

---

## 建議的下一步（照順序做）

### 第 1 步：確認自己電腦能跑起來（約 5 分鐘）

在專案資料夾打開終端機：

```bash
cd /Users/tao/Downloads/taichung-projects-platform
pnpm install
pnpm run deploy:test
```

瀏覽器打開 **http://localhost:3000**，能開首頁、能進後台登入就代表程式沒問題。  
（要停掉服務：終端機按 `Ctrl+C`。）

---

### 第 2 步：把程式碼放到 GitHub（約 10 分鐘）

1. 到 [github.com](https://github.com) 註冊／登入。
2. 點右上 **+** → **New repository**。
3. 名稱隨便取（例如 `taichung-projects-platform`），**不要**勾選「Add a README」（你本地已有專案）。
4. 建立後，畫面上會有一串指令，**在你電腦的專案資料夾**執行（把 `你的帳號` 改成你的 GitHub 使用者名稱）：

```bash
cd /Users/tao/Downloads/taichung-projects-platform
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的帳號/taichung-projects-platform.git
git push -u origin main
```

若本來就已經是 git 專案、且已經有 `origin`，就只要：

```bash
git add .
git commit -m "Prepare for deploy"
git push -u origin main
```

重新整理 GitHub 網頁，有看到你的程式碼就成功了。

---

### 第 3 步：用 Railway 部署，拿免費網址（約 10 分鐘）

1. 到 [railway.app](https://railway.app) 用 **GitHub 登入**。
2. **New Project** → 選 **Deploy from GitHub repo**。
3. 選你剛 push 的 **taichung-projects-platform**（若沒出現，到 GitHub 設定裡授權 Railway 讀取你的 repo）。
4. 專案建立後，點進那個 **Service**（一個方塊）。
5. 在 **Settings** 裡：
   - **Build Command** 填：`pnpm install && pnpm run build`
   - **Start Command** 填：`pnpm start`
6. 在 **Variables** 分頁，新增三個變數（名稱一個字都不能錯）：
   - `NODE_ENV` = `production`
   - `ADMIN_USERNAME` = 你要用的管理員帳號（例如 `daynight1003@`）
   - `ADMIN_PASSWORD` = 你要用的強密碼
7. 到 **Settings** → **Networking** → **Generate Domain**，Railway 會給你一個網址，例如：`taichung-projects-platform-production-xxxx.up.railway.app`。

用瀏覽器打開那個網址，網站就上線了；**/admin/login** 用你剛設的帳號密碼登入後台。

---

## 之後若想用自己的網域

等你想用「自己的網址」（例如 `www.我的公司.com`）再來做即可：

1. 向任一**網域註冊商**（例如 GoDaddy、Cloudflare、PChome、Hinet 等）購買網域。
2. 在該註冊商後台，把網域 **CNAME** 指到 Railway 給你的那個網址（Railway 後台會有說明）。
3. 在 Railway 的 **Settings → Domains** 裡新增你的網域。

**現階段不必買**，先用免費網址就夠了。

---

## 總結：你現在該做什麼

1. ✅ 在自己電腦跑一次 **`pnpm run deploy:test`**，確認沒問題。  
2. ✅ 沒有 GitHub 就註冊，把專案 **push 上去**。  
3. ✅ 用 **Railway** 連 GitHub、設 Build/Start、設三個環境變數、**Generate Domain**。  
4. ✅ 用 Railway 給的免費網址開網站 → 這樣就完成「上線」了。  

網域、VPS、信用卡都可以之後再說。需要更細的步驟，就打開 **docs/DEPLOY-保姆級教學.md**，從「路線 A：用 PaaS」那一段照著做。
