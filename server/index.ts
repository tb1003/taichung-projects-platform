import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import adminRoutes from "./admin/routes.js";
import { getUploadRoot } from "./admin/project-images.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Railway / 反向代理環境：信任 proxy 才能取得真實 client IP（否則 rate limit 會把所有人當同一個 IP）
  // 參考：Express trust proxy 設定
  app.set("trust proxy", 1);

  // 安全標頭（防 XSS、clickjacking、MIME 嗅探等）；開發環境關閉 CSP 以配合 Vite
  // 正式環境自訂 CSP：允許 YouTube iframe / iframe_api 與縮圖、noembed（後台抓標題用）
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            useDefaults: true,
            directives: {
              ...helmet.contentSecurityPolicy.getDefaultDirectives(),
              "img-src": ["'self'", "data:", "https:"],
              "script-src": ["'self'", "https://www.youtube.com", "https://s.ytimg.com"],
              "frame-src": ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
              "connect-src": ["'self'", "https://noembed.com"],
            },
          }
        : false,
    })
  );

  app.use(express.json());

  // 正式環境：限流防暴力破解與爬蟲
  if (isProduction) {
    const fifteenMinutes = 15 * 60 * 1000;
    app.use(
      "/api/admin/login",
      rateLimit({
        windowMs: fifteenMinutes,
        max: 10,
        message: { error: "登入嘗試次數過多，請稍後再試" },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    app.use(
      "/api/admin/register",
      rateLimit({
        windowMs: fifteenMinutes,
        max: 5,
        message: { error: "註冊嘗試次數過多，請稍後再試" },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    app.use(
      "/api",
      rateLimit({
        windowMs: fifteenMinutes,
        // Railway 後方通常多使用者共用少數出口 IP；再加上後台頁面會打多個 API
        // 先放寬上限，並搭配 trust proxy 取真實 client IP，避免誤判「請求過於頻繁」
        max: 2000,
        message: { error: "請求過於頻繁，請稍後再試" },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  // API：建案／重劃區／建設公司／對應表／網站設定（含公開 GET /api/public/site-content）
  app.use(adminRoutes);

  if (isProduction) {
    const staticPath = path.resolve(__dirname, "public");
    app.use("/project-images", express.static(getUploadRoot()));
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    // 開發環境：先提供已上傳圖片靜態檔，再交給 Vite
    app.use("/project-images", express.static(getUploadRoot()));
    // 同一 port 提供 API + Vite 前端（單一 process）
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(PROJECT_ROOT, "client"),
      configFile: path.join(PROJECT_ROOT, "vite.config.ts"),
    });
    app.use(vite.middlewares);

    // SPA fallback：讓 /projects、/project/:id 等前端路由回到 index.html
    app.use(async (req, res, next) => {
      try {
        if (req.originalUrl.startsWith("/api")) return next();
        if (req.originalUrl.startsWith("/project-images")) return next();
        if (req.originalUrl.startsWith("/__manus__")) return next();

        const url = req.originalUrl;
        const indexPath = path.join(PROJECT_ROOT, "client", "index.html");
        let html = fs.readFileSync(indexPath, "utf-8");
        html = await vite.transformIndexHtml(url, html);
        res.status(200).setHeader("Content-Type", "text/html").end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = Number(process.env.PORT) || (isProduction ? 3000 : 5173);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    if (!isProduction) {
      console.log("前台與後台皆由此 port 提供，API 路徑為 /api");
      console.log("請僅使用 http://localhost:" + port + " 操作（勿開其他 port）。");
    }
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && !isProduction) {
      console.error(`\nPort ${port} 已被佔用，無法啟動。`);
      console.error("請關閉佔用此 port 的程式（或另一個 npm run dev），再重新執行 npm run dev。");
      console.error("統一只使用一個 port，上傳/API 才會正常。\n");
      process.exit(1);
    }
    console.error(err);
    process.exit(1);
  });
}

startServer().catch(console.error);
