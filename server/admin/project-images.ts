/**
 * 建案圖片：本機目錄儲存，依檔名匹配建案（檔名含建案名稱）
 * 三類：exterior 外觀、amenity 公設、layout 格局配置圖，每類最多 10 張
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { readProjects, writeProjects, type ProjectsData } from "./data-helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

/** 上傳根目錄：開發時依模組路徑定位專案根目錄，正式環境寫入 dist/public */
export function getUploadRoot(): string {
  const env = String(process.env.UPLOAD_DIR || "").trim();
  if (env) return env;
  // Railway Volume：建議 mount /data，將上傳放在 /data/project-images
  if (fs.existsSync("/data")) return path.join("/data", "project-images");
  if (isProduction) return path.join(__dirname, "public", "project-images");
  const projectRoot = path.join(__dirname, "..", "..");
  return path.join(projectRoot, "client", "public", "project-images");
}

const MAX_PER_CATEGORY = 10;
export const CATEGORIES = ["exterior", "amenity", "layout"] as const;
export type ImageCategory = (typeof CATEGORIES)[number];

export interface ProjectImagesShape {
  exterior?: string[];
  amenity?: string[];
  layout?: string[];
}

function ensureImages(project: Record<string, unknown>): ProjectImagesShape {
  if (!project.images || typeof project.images !== "object") {
    project.images = { exterior: [], amenity: [], layout: [] };
  }
  const img = project.images as ProjectImagesShape;
  if (!Array.isArray(img.exterior)) img.exterior = [];
  if (!Array.isArray(img.amenity)) img.amenity = [];
  if (!Array.isArray(img.layout)) img.layout = [];
  return img;
}

/** 依檔名匹配建案：檔名須包含建案名稱 */
export function matchProjectByFilename(filename: string): { id: number; 建案名稱: string } | null {
  const baseName = path.basename(filename, path.extname(filename));
  const data = readProjects();
  const projects = data.projects as Array<{ id?: number; 建案名稱?: string }>;
  for (const p of projects) {
    const name = p.建案名稱;
    if (name && baseName.includes(name)) return { id: p.id ?? 0, 建案名稱: name };
  }
  return null;
}

export function getProjectById(id: number): Record<string, unknown> | null {
  const data = readProjects();
  const p = (data.projects as Record<string, unknown>[]).find((x) => (x.id as number) === id);
  return p ?? null;
}

/** 回傳用於前端的 URL 路徑（例如 /project-images/1/exterior/xxx.jpg） */
export function toPublicUrl(projectId: number, category: ImageCategory, filename: string): string {
  return `/project-images/${projectId}/${category}/${filename}`;
}

/** 將上傳的檔名做安全處理 */
function sanitizeFilename(name: string): string {
  const ext = path.extname(name) || ".jpg";
  const base = path.basename(name, ext).replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, "_").slice(0, 80) || "image";
  return base + ext;
}

/** 寫入檔案並回傳公開 URL */
export function saveProjectImage(
  projectId: number,
  category: ImageCategory,
  originalFilename: string,
  buffer: Buffer
): string {
  const root = getUploadRoot();
  const dir = path.join(root, String(projectId), category);
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    throw new Error(`無法建立目錄 ${dir}: ${String(e)}`);
  }
  const filename = sanitizeFilename(originalFilename);
  const filePath = path.join(dir, filename);
  try {
    fs.writeFileSync(filePath, buffer);
  } catch (e) {
    throw new Error(`無法寫入檔案 ${filename}: ${String(e)}`);
  }
  return toPublicUrl(projectId, category, filename);
}

/** 加入一筆圖片到建案（不寫檔，由呼叫端先 saveProjectImage） */
export function addProjectImageUrl(projectId: number, category: ImageCategory, url: string): boolean {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) return false;
  const img = ensureImages(project);
  const list = img[category];
  if (list.length >= MAX_PER_CATEGORY) return false;
  list.push(url);
  writeProjects(data);
  return true;
}

/** 刪除建案內一筆圖片（從 JSON 移除並可選刪除實體檔） */
export function removeProjectImage(
  projectId: number,
  category: ImageCategory,
  urlOrFilename: string
): boolean {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) return false;
  const img = ensureImages(project);
  const list = img[category];
  const idx = list.findIndex((u) => u === urlOrFilename || u.endsWith("/" + urlOrFilename));
  if (idx === -1) return false;
  list.splice(idx, 1);
  writeProjects(data);
  // 刪除實體檔（由 url 反推路徑）
  const match = urlOrFilename.match(/\/project-images\/\d+\/\w+\/(.+)$/) || (urlOrFilename.includes("/") ? [] : [null, urlOrFilename]);
  const filename = match[1];
  if (filename) {
    const filePath = path.join(getUploadRoot(), String(projectId), category, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return true;
}

/** 更新建案某類圖片的排序（order 為完整 URL 或 filename 陣列） */
export function reorderProjectImages(projectId: number, category: ImageCategory, orderedUrls: string[]): boolean {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) return false;
  const img = ensureImages(project);
  const current = img[category];
  const valid = orderedUrls.filter((u) => current.some((c) => c === u || c.endsWith("/" + u)));
  if (valid.length !== current.length) return false;
  img[category] = valid.length <= MAX_PER_CATEGORY ? valid : valid.slice(0, MAX_PER_CATEGORY);
  writeProjects(data);
  return true;
}

/** 取得建案圖片列表（供 API 回傳） */
export function getProjectImages(projectId: number): ProjectImagesShape {
  const project = getProjectById(projectId);
  if (!project) return { exterior: [], amenity: [], layout: [] };
  return ensureImages(project);
}
