/**
 * 後台權限：最高權限（owner）帳號+密碼 或 業務（agent）登入後以 x-admin-key 傳 token
 * token 格式：owner 為密碼/API Key；agent 為 "agent:<agentId>"
 * 不再自動放行：未設 ADMIN_USERNAME/ADMIN_PASSWORD 時一律無法以 owner 登入
 */
import type { Request, Response, NextFunction } from "express";

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "").trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "";

declare global {
  namespace Express {
    interface Request {
      isOwner?: boolean;
      agentId?: string;
    }
  }
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith("/api/admin")) {
    return next();
  }
  if ((req.path === "/api/admin/login" || req.path === "/api/admin/register") && req.method === "POST") {
    return next();
  }

  const token = (req.headers["x-admin-key"] as string) || (req.headers["authorization"] as string)?.replace(/^Bearer\s+/i, "") || "";

  if (token.startsWith("agent:")) {
    req.agentId = token.slice(6).trim();
    req.isOwner = false;
    return next();
  }

  const hasValidKey = ADMIN_API_KEY && token === ADMIN_API_KEY;
  const hasValidPassword = ADMIN_PASSWORD && token === ADMIN_PASSWORD;

  if (hasValidKey || hasValidPassword) {
    req.isOwner = true;
    return next();
  }

  res.status(401).json({ error: "未授權", message: "請登入或提供正確的帳號／密碼或 API Key" });
}

export function ownerOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.isOwner) return next();
  res.status(403).json({ error: "僅最高權限可操作" });
}
