/**
 * 房產工具區塊圖片：上傳至 client/public/tools/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const TOOLS_DIR = path.join(PROJECT_ROOT, "client", "public", "tools");

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_IMAGE = 10 * 1024 * 1024; // 10MB

function getSafeImageExt(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  return IMAGE_EXT.includes(ext) ? ext : ".png";
}

export function saveToolImage(originalFilename: string, buffer: Buffer): string {
  if (buffer.length > MAX_IMAGE) throw new Error(`檔案大小超過 ${MAX_IMAGE / 1024 / 1024}MB`);
  if (!fs.existsSync(TOOLS_DIR)) fs.mkdirSync(TOOLS_DIR, { recursive: true });
  const ext = getSafeImageExt(originalFilename);
  const filename = `${nanoid(10)}${ext}`;
  fs.writeFileSync(path.join(TOOLS_DIR, filename), buffer);
  return `/tools/${filename}`;
}
