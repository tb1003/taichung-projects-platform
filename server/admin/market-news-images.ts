/**
 * 市場動態文章卡片圖片：上傳至 client/public/market-news/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const MARKET_NEWS_DIR = path.join(PROJECT_ROOT, "client", "public", "market-news");

const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

function getSafeExt(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  return ALLOWED_EXT.includes(ext) ? ext : ".png";
}

/**
 * 儲存市場動態文章卡片圖，檔名為 {articleId}.png（覆蓋）
 * @returns 前端可用的 URL，例如 /market-news/1.png
 */
export function saveMarketNewsImage(
  articleId: string,
  originalFilename: string,
  buffer: Buffer
): string {
  if (buffer.length > MAX_SIZE) {
    throw new Error(`檔案大小超過 ${MAX_SIZE / 1024 / 1024}MB`);
  }
  const safeId = articleId.replace(/[^a-zA-Z0-9-_]/g, "_") || "article";
  if (!fs.existsSync(MARKET_NEWS_DIR)) {
    fs.mkdirSync(MARKET_NEWS_DIR, { recursive: true });
  }
  const ext = getSafeExt(originalFilename);
  const filename = `${safeId}${ext}`;
  const filePath = path.join(MARKET_NEWS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return `/market-news/${filename}`;
}
