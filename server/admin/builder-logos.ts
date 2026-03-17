/**
 * 建設公司 Logo：上傳至 project-images/builders/，以建設公司名稱做檔名（覆蓋）
 */
import fs from "node:fs";
import path from "node:path";
import { getUploadRoot } from "./project-images.js";

const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

function sanitizeBuilderName(name: string): string {
  return name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, "_").slice(0, 60) || "logo";
}

/** 取得建設公司 logo 儲存目錄 */
function getBuilderLogoDir(): string {
  return path.join(getUploadRoot(), "builders");
}

/** 將上傳的檔名取副檔名並檢查允許類型 */
function getSafeExt(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  return ALLOWED_EXT.includes(ext) ? ext : ".png";
}

/**
 * 儲存建設公司 logo，檔名為 sanitize(builderName) + ext，同公司會覆蓋
 * @returns 前端可用的 URL 路徑，例如 /project-images/builders/xxx.png
 */
export function saveBuilderLogo(
  builderName: string,
  originalFilename: string,
  buffer: Buffer
): string {
  if (buffer.length > MAX_SIZE) {
    throw new Error(`檔案大小超過 ${MAX_SIZE / 1024 / 1024}MB`);
  }
  const dir = getBuilderLogoDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const base = sanitizeBuilderName(builderName);
  const ext = getSafeExt(originalFilename);
  const filename = `${base}${ext}`;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/project-images/builders/${filename}`;
}
