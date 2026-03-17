/**
 * 五義地產筆記圖片：上傳至 client/public/kungfu/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const KUNGFU_DIR = path.join(PROJECT_ROOT, "client", "public", "kungfu");

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_PDF = 20 * 1024 * 1024;   // 20MB

function getSafeImageExt(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  return IMAGE_EXT.includes(ext) ? ext : ".png";
}

/**
 * 儲存真功夫圖片，檔名為唯一 id
 */
export function saveKungfuImage(originalFilename: string, buffer: Buffer): string {
  if (buffer.length > MAX_IMAGE) throw new Error(`檔案大小超過 ${MAX_IMAGE / 1024 / 1024}MB`);
  if (!fs.existsSync(KUNGFU_DIR)) fs.mkdirSync(KUNGFU_DIR, { recursive: true });
  const ext = getSafeImageExt(originalFilename);
  const filename = `${nanoid(10)}${ext}`;
  fs.writeFileSync(path.join(KUNGFU_DIR, filename), buffer);
  return `/kungfu/${filename}`;
}

/**
 * 儲存真功夫 PDF
 */
export function saveKungfuPdf(originalFilename: string, buffer: Buffer): string {
  if (buffer.length > MAX_PDF) throw new Error(`PDF 大小超過 ${MAX_PDF / 1024 / 1024}MB`);
  if (!fs.existsSync(KUNGFU_DIR)) fs.mkdirSync(KUNGFU_DIR, { recursive: true });
  const ext = path.extname(originalFilename).toLowerCase() === ".pdf" ? ".pdf" : ".pdf";
  const filename = `${nanoid(10)}${ext}`;
  fs.writeFileSync(path.join(KUNGFU_DIR, filename), buffer);
  return `/kungfu/${filename}`;
}
