/**
 * 後台變動審計：記錄每次新增／修改／刪除的時間與操作者
 * 儲存於 server/data/audit.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data");
const AUDIT_FILE = path.join(DATA_DIR, "audit.json");

const MAX_ENTRIES = 5000;

export type AuditAction = "create" | "update" | "delete";

export interface AuditEntry {
  at: string;
  by: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  detail?: string;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readAuditLog(): AuditEntry[] {
  ensureDataDir();
  if (!fs.existsSync(AUDIT_FILE)) return [];
  try {
    const raw = fs.readFileSync(AUDIT_FILE, "utf-8");
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAuditLog(entries: AuditEntry[]): void {
  ensureDataDir();
  const trimmed = entries.slice(-MAX_ENTRIES);
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
}

/** 從 request 取得操作者識別（owner 或 agent:<id>） */
export function getModifier(req: Request): string {
  if (req.isOwner) return "owner";
  if (req.agentId) return `agent:${req.agentId}`;
  return "unknown";
}

/** 寫入一筆審計紀錄（新增／修改／刪除） */
export function logAudit(
  req: Request,
  action: AuditAction,
  entity: string,
  entityId?: string,
  detail?: string
): void {
  try {
    const by = getModifier(req);
    const entry: AuditEntry = {
      at: new Date().toISOString(),
      by,
      action,
      entity,
      ...(entityId != null && entityId !== "" ? { entityId } : {}),
      ...(detail != null && detail !== "" ? { detail } : {}),
    };
    const entries = readAuditLog();
    entries.push(entry);
    writeAuditLog(entries);
  } catch (e) {
    console.error("[audit] logAudit failed:", e);
  }
}

/** 讀取審計紀錄（由新到舊，可指定筆數） */
export function readAudit(limit = 200): AuditEntry[] {
  const entries = readAuditLog();
  return entries.slice(-limit).reverse();
}
