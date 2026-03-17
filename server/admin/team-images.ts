/**
 * 團隊成員圖片：大頭照、證照等，上傳至 client/public/team/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const TEAM_DIR = path.join(PROJECT_ROOT, "client", "public", "team");

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_IMAGE = 10 * 1024 * 1024; // 10MB

function getSafeImageExt(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  return IMAGE_EXT.includes(ext) ? ext : ".png";
}

export function saveTeamImage(originalFilename: string, buffer: Buffer): string {
  if (buffer.length > MAX_IMAGE) throw new Error(`檔案大小超過 ${MAX_IMAGE / 1024 / 1024}MB`);
  if (!fs.existsSync(TEAM_DIR)) fs.mkdirSync(TEAM_DIR, { recursive: true });
  const ext = getSafeImageExt(originalFilename);
  const filename = `${nanoid(10)}${ext}`;
  fs.writeFileSync(path.join(TEAM_DIR, filename), buffer);
  return `/team/${filename}`;
}
