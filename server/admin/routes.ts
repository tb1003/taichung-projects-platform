/**
 * 後台 API：建案 / 重劃區 / 建設公司 / 對應表 / 網站設定 / 建案圖片 / 業務與電子名片
 */
import { Router, type Request, type Response } from "express";
import multer from "multer";
import { adminAuth, ownerOnly } from "./auth.js";
import { getModifier, logAudit, readAudit } from "./audit.js";
import {
  readProjects,
  writeProjects,
  readZones,
  writeZones,
  readBuilders,
  writeBuilders,
  readZoneNameMap,
  writeZoneNameMap,
  readBuilderNameMap,
  writeBuilderNameMap,
  readSiteContent,
  writeSiteContent,
  readMarketNews,
  writeMarketNews,
  readKungfu,
  writeKungfu,
  readToolBlocks,
  writeToolBlocks,
  type ZoneItem,
  type BuilderItem,
  type ToolBlock,
  type ToolItem,
} from "./data-helpers.js";
import { saveMarketNewsImage } from "./market-news-images.js";
import {
  matchProjectByFilename,
  getProjectById,
  saveProjectImage,
  addProjectImageUrl,
  getProjectImages,
  removeProjectImage,
  reorderProjectImages,
  type ImageCategory,
  CATEGORIES,
} from "./project-images.js";
import { saveBuilderLogo } from "./builder-logos.js";
import { saveKungfuImage, saveKungfuPdf } from "./kungfu-images.js";
import { saveToolImage } from "./tool-images.js";
import { saveTeamImage } from "./team-images.js";
import {
  addProjectVideo,
  getProjectVideos,
  removeProjectVideo,
  reorderProjectVideos,
} from "./project-videos.js";
import {
  readAgents,
  findAgentById,
  findAgentByPhone,
  createAgent,
  updateAgent,
  approveAgent,
  setAgentECardStatus,
  readProjectAgents,
  getProjectAgentIds,
  getAgentProjectIds,
  isAgentAssignedToProject,
  assignProjectToAgent,
  unassignProjectFromAgent,
  logAgentActivity,
  readAgentActivity,
  RESUME_FIELDS,
  type Agent,
  type AgentResume,
  type ECardStatus,
} from "./agents-data.js";
import { hashPassword, verifyPassword } from "./agents-auth.js";

const router = Router();

// ---------- 公開 API（不需登入，供前台讀取）----------
router.get("/api/public/site-content", (_req: Request, res: Response) => {
  try {
    const data = readSiteContent();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/public/projects/:id/images", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const images = getProjectImages(id);
    res.json(images);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/public/projects/:id/videos", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const videos = getProjectVideos(id);
    res.json({ videos });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/public/projects/:id/agents", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const agentIds = getProjectAgentIds(id);
    const agents = readAgents()
      .filter((a) => agentIds.includes(a.id) && a.eCardStatus === "published")
      .slice(0, 2)
      .map((a) => {
        const visible = new Set(a.eCardVisibleFields || []);
        const card: Record<string, unknown> = {};
        RESUME_FIELDS.forEach((f) => {
          if (visible.has(f) && (a.resume as Record<string, unknown>)[f] != null) (card as Record<string, unknown>)[f] = (a.resume as Record<string, unknown>)[f];
        });
        return { id: a.id, ...card };
      });
    res.json({ agents });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// ---------- 業務註冊（不需登入；必填：行動電話、密碼、姓名、公司、LINE ID；選填：信箱、名片；同一電話或 LINE ID 不得重複）----------
router.post("/api/admin/register", (req: Request, res: Response) => {
  try {
    const body = (req.body || {}) as {
      password?: string;
      name?: string;
      company?: string;
      phone?: string;
      lineId?: string;
      email?: string;
      cardImageUrl?: string;
    };
    const password = body.password;
    const name = body.name?.trim();
    const company = body.company?.trim();
    const phone = body.phone?.trim();
    const lineId = body.lineId?.trim();
    const email = body.email?.trim();
    const cardImageUrl = body.cardImageUrl?.trim();
    if (!phone) return res.status(400).json({ error: "請填寫行動電話（登入用）" });
    if (!password) return res.status(400).json({ error: "請設定密碼" });
    if (!name) return res.status(400).json({ error: "請填寫姓名" });
    if (!company) return res.status(400).json({ error: "請填寫公司" });
    if (!lineId) return res.status(400).json({ error: "請填寫 LINE ID" });
    const agent = createAgent(phone, hashPassword(password), {
      name,
      company,
      phone,
      lineId,
      ...(email ? { email } : {}),
      ...(cardImageUrl ? { cardImageUrl } : {}),
    });
    const { passwordHash: _, ...safe } = agent;
    // 註冊成功即發 token，讓業務可立即進入填寫電子名片
    return res.status(201).json({
      agent: safe,
      token: "agent:" + agent.id,
      role: "agent" as const,
    });
  } catch (e) {
    const msg = (e as Error)?.message ?? "註冊失敗";
    const isClientError = msg.includes("已註冊") || msg.includes("請") || msg.includes("有效");
    return res.status(isClientError ? 400 : 500).json({ error: msg });
  }
});

// 公開：市場動態（供前台顯示，無需登入）
router.get("/api/public/market-news", (_req: Request, res: Response) => {
  try {
    const data = readMarketNews();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// 公開：五義地產筆記（房產工具詳情，圖左文右）
router.get("/api/public/kungfu", (_req: Request, res: Response) => {
  try {
    const data = readKungfu();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/public/tool-blocks", (_req: Request, res: Response) => {
  try {
    const data = readToolBlocks();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// 公開：業務註冊用名片圖片上傳（不需登入；限單張圖片）
const registerCardUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single("file");
router.post("/api/public/register-card-upload", (req: Request, res: Response) => {
  registerCardUpload(req, res, (err: Error) => {
    if (err) {
      const detail = err.message || String(err);
      if ((err as multer.MulterError)?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "檔案過大", detail: "單檔 10MB 以內" });
      }
      return res.status(400).json({ error: "上傳失敗", detail });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file?.buffer) return res.status(400).json({ error: "請選擇圖片" });
      const url = saveTeamImage(file.originalname, file.buffer);
      res.status(201).json({ url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

// 以下需驗證（owner 或 agent）
router.use(adminAuth);

// ---------- 市場動態（房市快訊）----------
router.get("/api/admin/market-news", (_req: Request, res: Response) => {
  try {
    const data = readMarketNews();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/market-news", (req: Request, res: Response) => {
  try {
    const data = req.body as Parameters<typeof writeMarketNews>[0];
    if (!data || !Array.isArray(data.articles)) {
      return res.status(400).json({ error: "請提供 articles 陣列" });
    }
    writeMarketNews(data, getModifier(req));
    logAudit(req, "update", "market-news", undefined, `${data.articles.length} 則`);
    res.json(readMarketNews());
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

router.post("/api/admin/market-news/image", (req: Request, res: Response) => {
  singleFileUpload(req, res, (err: Error) => {
    if (err) {
      return res.status(400).json({ error: "上傳失敗", detail: String(err.message || err) });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const articleId = (req.body?.articleId as string)?.trim();
      if (!file?.buffer) return res.status(400).json({ error: "請選擇圖片檔案" });
      if (!articleId) return res.status(400).json({ error: "請提供 articleId" });
      const url = saveMarketNewsImage(articleId, file.originalname, file.buffer);
      logAudit(req, "update", "market-news", articleId, "上傳圖片");
      res.status(201).json({ url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

// ---------- 網站設定（頁首／頁尾／關於我們／首頁）----------
router.get("/api/admin/site-content", (_req: Request, res: Response) => {
  try {
    const data = readSiteContent();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/site-content", (req: Request, res: Response) => {
  try {
    const data = readSiteContent();
    const now = new Date().toISOString();
    const updated = { ...data, ...req.body, _meta: { lastModifiedAt: now, lastModifiedBy: getModifier(req) } };
    writeSiteContent(updated);
    logAudit(req, "update", "site-content");
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

const teamImageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single("file");
router.post("/api/admin/team-members/upload", (req: Request, res: Response) => {
  teamImageUpload(req, res, (err: Error) => {
    if (err) {
      const detail = err.message || String(err);
      if ((err as multer.MulterError)?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "檔案過大", detail: "單檔 10MB 以內" });
      }
      return res.status(400).json({ error: "上傳失敗", detail });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file?.buffer) return res.status(400).json({ error: "請選擇圖片" });
      const url = saveTeamImage(file.originalname, file.buffer);
      res.status(201).json({ url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

// ---------- 五義地產筆記（owner 專用）----------
router.get("/api/admin/kungfu", ownerOnly, (_req: Request, res: Response) => {
  try {
    const data = readKungfu();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/kungfu/upload", ownerOnly, (req: Request, res: Response) => {
  kungfuSingleUpload(req, res, (err: Error) => {
    if (err) {
      const detail = err.message || String(err);
      if ((err as multer.MulterError)?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "檔案過大", detail: "單檔請在 20MB 以內（圖片 10MB、PDF 20MB）" });
      }
      console.error("[POST /api/admin/kungfu/upload] multer error:", detail);
      return res.status(400).json({ error: "上傳失敗", detail });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file?.buffer) return res.status(400).json({ error: "請選擇檔案", detail: "未收到檔案，請確認表單欄位名稱為 file" });
      const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
      const url = isPdf ? saveKungfuPdf(file.originalname, file.buffer) : saveKungfuImage(file.originalname, file.buffer);
      res.status(201).json({ url, type: isPdf ? "pdf" : "image" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[POST /api/admin/kungfu/upload] save error:", msg);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

router.put("/api/admin/kungfu", ownerOnly, (req: Request, res: Response) => {
  try {
    const payload = req.body as { items?: unknown[] };
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const valid = items.filter(
      (x): x is { id: string; title: string; slug: string; imageUrls: string[]; body: string; order: number } =>
        x != null && typeof (x as { id?: unknown }).id === "string" && typeof (x as { title?: unknown }).title === "string" && typeof (x as { slug?: unknown }).slug === "string"
    ).map((x) => ({
      id: x.id,
      title: String(x.title),
      slug: String(x.slug).replace(/[^a-z0-9-]/gi, "-").toLowerCase() || "item",
      imageUrls: Array.isArray(x.imageUrls) ? x.imageUrls.filter((u): u is string => typeof u === "string") : [],
      pdfUrls: Array.isArray((x as { pdfUrls?: unknown }).pdfUrls) ? (x as { pdfUrls: unknown[] }).pdfUrls.filter((u): u is string => typeof u === "string") : [],
      youtubeUrl: typeof (x as { youtubeUrl?: unknown }).youtubeUrl === "string" ? String((x as { youtubeUrl: string }).youtubeUrl).trim() || undefined : undefined,
      body: typeof x.body === "string" ? x.body : "",
      order: typeof x.order === "number" ? x.order : 0,
    }));
    const now = new Date().toISOString();
    writeKungfu({ items: valid, _meta: { lastModifiedAt: now, lastModifiedBy: getModifier(req) } });
    logAudit(req, "update", "kungfu", undefined, `${valid.length} 則筆記`);
    res.json({ items: valid });
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String((e as Error)?.message ?? e) });
  }
});

// ---------- 房產工具區塊（買賣前先搞懂／查行情與區域／查證與進階工具，owner 專用）----------
router.get("/api/admin/tool-blocks", ownerOnly, (_req: Request, res: Response) => {
  try {
    const data = readToolBlocks();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/tool-blocks/upload", ownerOnly, (req: Request, res: Response) => {
  kungfuSingleUpload(req, res, (err: Error) => {
    if (err) {
      const detail = err.message || String(err);
      if ((err as multer.MulterError)?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "檔案過大", detail: "單檔 20MB 以內" });
      }
      return res.status(400).json({ error: "上傳失敗", detail });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file?.buffer) return res.status(400).json({ error: "請選擇圖片" });
      const url = saveToolImage(file.originalname, file.buffer);
      res.status(201).json({ url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

router.put("/api/admin/tool-blocks", ownerOnly, (req: Request, res: Response) => {
  try {
    const raw = req.body as { blocks?: unknown[] };
    const blocks = Array.isArray(raw?.blocks) ? raw.blocks : [];
    const valid: ToolBlock[] = blocks
      .filter((b): b is Record<string, unknown> => b != null && typeof (b as { id?: unknown }).id === "string" && typeof (b as { title?: unknown }).title === "string")
      .map((b, blockIndex) => {
        const items = Array.isArray(b.items)
          ? (b.items as Record<string, unknown>[])
            .filter((x) => x != null && typeof (x as { id?: unknown }).id === "string" && typeof (x as { label?: unknown }).label === "string")
            .map((x, itemIndex) => ({
              id: String((x as { id: string }).id),
              label: String((x as { label: string }).label),
              order: typeof (x as { order?: number }).order === "number" ? (x as { order: number }).order : itemIndex,
              href: typeof (x as { href?: string }).href === "string" ? (x as { href: string }).href : undefined,
              external: !!(x as { external?: boolean }).external,
              body: typeof (x as { body?: string }).body === "string" ? (x as { body: string }).body : undefined,
              imageUrls: Array.isArray((x as { imageUrls?: unknown }).imageUrls) ? (x as { imageUrls: string[] }).imageUrls.filter((u): u is string => typeof u === "string") : undefined,
              youtubeUrl: typeof (x as { youtubeUrl?: string }).youtubeUrl === "string" ? (x as { youtubeUrl: string }).youtubeUrl.trim() || undefined : undefined,
            })) as ToolItem[]
          : [];
        return {
          id: String((b as { id: string }).id),
          title: String((b as { title: string }).title),
          description: typeof (b as { description?: string }).description === "string" ? (b as { description: string }).description : undefined,
          order: typeof (b as { order?: number }).order === "number" ? (b as { order: number }).order : blockIndex,
          items: items.sort((a, b) => a.order - b.order),
        } as ToolBlock;
      })
      .sort((a, b) => a.order - b.order);
    const data = readToolBlocks();
    data.blocks = valid;
    writeToolBlocks(data, getModifier(req));
    logAudit(req, "update", "tool-blocks", undefined, `${valid.length} 個區塊`);
    res.json(readToolBlocks());
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String((e as Error)?.message ?? e) });
  }
});

// ---------- 審計紀錄（owner 專用）----------
router.get("/api/admin/audit", ownerOnly, (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    const entries = readAudit(limit);
    res.json({ entries });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// ---------- 建案 ----------
router.get("/api/admin/projects", (_req: Request, res: Response) => {
  try {
    const data = readProjects();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// 建案圖片相關路由必須在 /api/admin/projects/:id 之前（較具體路徑先匹配）
router.get("/api/admin/projects/:id/images", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    const project = getProjectById(id);
    if (project == null) return res.status(404).json({ error: "找不到建案" });
    const images = getProjectImages(id);
    res.json(images);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// ---------- 建案影片（YouTube）----------
router.get("/api/admin/projects/:id/videos", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const videos = getProjectVideos(id);
    res.json({ videos });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/projects/:id/videos", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    if (req.agentId && !isAgentAssignedToProject(req.agentId, id)) return res.status(403).json({ error: "您沒有權限為此建案新增影片" });
    const { youtubeIdOrUrl, title, desc } = (req.body || {}) as {
      youtubeIdOrUrl?: string;
      title?: string;
      desc?: string;
    };
    if (!youtubeIdOrUrl) return res.status(400).json({ error: "請提供 youtubeIdOrUrl" });
    if (!title) return res.status(400).json({ error: "請提供 title" });
    const video = addProjectVideo(id, { youtubeIdOrUrl, title, desc });
    if (req.agentId) logAgentActivity(id, req.agentId, "video_add");
    logAudit(req, "create", "project-videos", String(id), video.title);
    return res.status(201).json({ video });
  } catch (e) {
    console.error("[POST /api/admin/projects/:id/videos]", e);
    const status = (e as Error)?.message?.includes("找不到建案") ? 404 : 400;
    return res.status(status).json({ error: "新增失敗", detail: String((e as Error)?.message ?? e) });
  }
});

router.delete("/api/admin/projects/:id/videos/:videoId", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    const videoId = String(req.params.videoId || "");
    if (!videoId) return res.status(400).json({ error: "請提供 videoId" });
    const ok = removeProjectVideo(id, videoId);
    if (!ok) return res.status(404).json({ error: "找不到該影片" });
    logAudit(req, "delete", "project-videos", String(id), videoId);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "刪除失敗", detail: String(e) });
  }
});

router.put("/api/admin/projects/:id/videos/order", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    const { ids } = (req.body || {}) as { ids?: string[] };
    if (!Array.isArray(ids)) return res.status(400).json({ error: "請提供 body: { ids: string[] }" });
    const videos = reorderProjectVideos(id, ids);
    logAudit(req, "update", "project-videos", String(id), "排序");
    res.json({ videos });
  } catch (e) {
    res.status(400).json({ error: "排序失敗", detail: String(e) });
  }
});

router.get("/api/admin/projects/:id/agents", (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const agentIds = getProjectAgentIds(id);
    const list = readAgents()
      .filter((a) => agentIds.includes(a.id))
      .map((a) => ({ id: a.id, phone: a.phone ?? (a.resume as Record<string, unknown>)?.phone, name: (a.resume as Record<string, unknown>)?.name }));
    res.json({ agents: list });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/admin/projects/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = readProjects();
    const project = data.projects.find((p: { id?: number }) => p.id === id);
    if (!project) return res.status(404).json({ error: "找不到建案" });
    res.json(project);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/projects", (req: Request, res: Response) => {
  try {
    const data = readProjects();
    const projects = data.projects as { id?: number; 建案名稱?: string }[];
    const body = req.body as Record<string, unknown>;
    const name = body.建案名稱 as string | undefined;
    if (req.agentId) {
      if (!name?.trim()) return res.status(400).json({ error: "請提供建案名稱" });
      if (projects.some((p) => p.建案名稱 === name.trim())) return res.status(400).json({ error: "該社區已存在，不可重複新增" });
    }
    const maxId = projects.length ? Math.max(...projects.map((p) => p.id ?? 0)) : 0;
    const newProject = { ...body, id: maxId + 1 } as Record<string, unknown>;
    data.projects.push(newProject);
    writeProjects(data, getModifier(req));
    logAudit(req, "create", "project", String(newProject.id), (newProject.建案名稱 as string) || "");
    if (req.agentId) assignProjectToAgent(newProject.id as number, req.agentId, "creator");
    res.status(201).json(newProject);
  } catch (e) {
    res.status(500).json({ error: "新增失敗", detail: String(e) });
  }
});

router.put("/api/admin/projects/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = readProjects();
    const idx = data.projects.findIndex((p: { id?: number }) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "找不到建案" });
    (data.projects as Record<string, unknown>[])[idx] = { ...data.projects[idx], ...req.body, id };
    writeProjects(data, getModifier(req));
    logAudit(req, "update", "project", String(id), (data.projects[idx] as { 建案名稱?: string })?.建案名稱);
    res.json(data.projects[idx]);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

router.delete("/api/admin/projects/:id", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = readProjects();
    const idx = data.projects.findIndex((p: { id?: number }) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "找不到建案" });
    const name = (data.projects[idx] as { 建案名稱?: string })?.建案名稱;
    data.projects.splice(idx, 1);
    writeProjects(data, getModifier(req));
    logAudit(req, "delete", "project", String(id), name);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "刪除失敗", detail: String(e) });
  }
});

// ---------- 建案圖片（外觀 / 公設 / 格局配置圖，每類最多 10 張，依檔名匹配建案）----------
const imageUpload = multer({ storage: multer.memoryStorage() }).array("files", 20);
const singleFileUpload = multer({ storage: multer.memoryStorage() }).single("file");
const KUNGFU_MAX_SIZE = 21 * 1024 * 1024; // 21MB（略大於 PDF 20MB 限制）
const kungfuSingleUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: KUNGFU_MAX_SIZE } }).single("file");

router.post("/api/admin/projects/images", (req: Request, res: Response) => {
  imageUpload(req, res, (err: Error) => {
    if (err) {
      return res.status(400).json({ error: "上傳失敗", detail: String(err.message || err) });
    }
    try {
      const files = (req as Request & { files?: Express.Multer.File[] }).files;
      const category = (req.body?.category as string)?.toLowerCase();
      const projectIdBody = req.body?.projectId;
      const agentId = req.agentId;
      if (!files?.length) return res.status(400).json({ error: "請選擇至少一個檔案" });
      if (!category || !CATEGORIES.includes(category as ImageCategory)) {
        return res.status(400).json({ error: "請指定 category: exterior | amenity | layout" });
      }
      const cat = category as ImageCategory;
      const specifiedId = projectIdBody != null ? parseInt(String(projectIdBody), 10) : null;
      const uploaded: { projectId: number; projectName: string; url: string }[] = [];
      const errors: string[] = [];
      for (const file of files) {
        let projectId: number;
        let projectName: string;
        if (specifiedId != null && !isNaN(specifiedId)) {
          const p = getProjectById(specifiedId);
          if (!p) {
            errors.push(`${file.originalname}: 找不到建案 id ${specifiedId}`);
            continue;
          }
          if (agentId && !isAgentAssignedToProject(agentId, specifiedId)) {
            errors.push(`${file.originalname}: 您沒有權限為此建案上傳圖片`);
            continue;
          }
          projectId = specifiedId;
          projectName = (p.建案名稱 as string) || String(specifiedId);
        } else {
          const matched = matchProjectByFilename(file.originalname);
          if (!matched) {
            errors.push(`${file.originalname}: 檔名未包含建案名稱，無法自動歸檔`);
            continue;
          }
          if (agentId && !isAgentAssignedToProject(agentId, matched.id)) {
            errors.push(`${file.originalname}: 您沒有權限為此建案上傳圖片`);
            continue;
          }
          projectId = matched.id;
          projectName = matched.建案名稱;
        }
        try {
          const url = saveProjectImage(projectId, cat, file.originalname, file.buffer);
          const added = addProjectImageUrl(projectId, cat, url);
          if (added) {
            uploaded.push({ projectId, projectName, url });
            if (agentId) logAgentActivity(projectId, agentId, "image_add");
          } else errors.push(`${file.originalname}: ${projectName} 的 ${cat} 已達 10 張上限`);
        } catch (e) {
          errors.push(`${file.originalname}: ${String(e)}`);
        }
      }
      if (uploaded.length) logAudit(req, "update", "project-images", undefined, `建案 ${uploaded.map((u) => u.projectName).join(", ")} 共 ${uploaded.length} 張`);
      res.status(201).json({ uploaded, errors: errors.length ? errors : undefined });
    } catch (e) {
      console.error("[POST /api/admin/projects/images]", e);
      res.status(500).json({ error: "上傳失敗", detail: String(e) });
    }
  });
});

router.delete("/api/admin/projects/:id/images", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { category, url } = (req.body || {}) as { category?: string; url?: string };
    if (!category || !CATEGORIES.includes(category as ImageCategory)) {
      return res.status(400).json({ error: "請提供 body: { category, url }" });
    }
    if (!url) return res.status(400).json({ error: "請提供 url" });
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const ok = removeProjectImage(id, category as ImageCategory, url);
    if (!ok) return res.status(404).json({ error: "找不到該圖片" });
    logAudit(req, "delete", "project-images", String(id), `${category} 刪除 1 張`);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "刪除失敗", detail: String(e) });
  }
});

router.put("/api/admin/projects/:id/images/order", (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { category, order } = (req.body || {}) as { category?: string; order?: string[] };
    if (!category || !CATEGORIES.includes(category as ImageCategory)) {
      return res.status(400).json({ error: "請提供 body: { category, order: string[] }" });
    }
    if (!Array.isArray(order)) return res.status(400).json({ error: "請提供 order 陣列" });
    if (getProjectById(id) == null) return res.status(404).json({ error: "找不到建案" });
    const ok = reorderProjectImages(id, category as ImageCategory, order);
    if (!ok) return res.status(400).json({ error: "排序失敗，請確認 order 與現有圖片一致" });
    logAudit(req, "update", "project-images", String(id), `${category} 排序`);
    res.json(getProjectImages(id));
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

// ---------- 重劃區 ----------
router.get("/api/admin/zones", (_req: Request, res: Response) => {
  try {
    const zones = readZones();
    res.json(zones);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/admin/zones/:zoneName", (req: Request, res: Response) => {
  try {
    const zoneName = decodeURIComponent(req.params.zoneName);
    const zones = readZones();
    const zone = zones.find((z) => z.zone_name === zoneName);
    if (!zone) return res.status(404).json({ error: "找不到重劃區" });
    res.json(zone);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/zones", (req: Request, res: Response) => {
  try {
    const zones = readZones();
    const body = req.body as ZoneItem;
    if (zones.some((z) => z.zone_name === body.zone_name)) {
      return res.status(400).json({ error: "重劃區名稱已存在" });
    }
    zones.push(body);
    writeZones(zones);
    logAudit(req, "create", "zone", body.zone_name);
    res.status(201).json(body);
  } catch (e) {
    res.status(500).json({ error: "新增失敗", detail: String(e) });
  }
});

router.put("/api/admin/zones/:zoneName", (req: Request, res: Response) => {
  try {
    const zoneName = decodeURIComponent(req.params.zoneName);
    const zones = readZones();
    const idx = zones.findIndex((z) => z.zone_name === zoneName);
    if (idx === -1) return res.status(404).json({ error: "找不到重劃區" });
    const body = req.body as ZoneItem;
    zones[idx] = { ...body, zone_name: body.zone_name || zoneName };
    writeZones(zones);
    logAudit(req, "update", "zone", body.zone_name || zoneName);
    res.json(zones[idx]);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

router.delete("/api/admin/zones/:zoneName", (req: Request, res: Response) => {
  try {
    const zoneName = decodeURIComponent(req.params.zoneName);
    const zones = readZones();
    const idx = zones.findIndex((z) => z.zone_name === zoneName);
    if (idx === -1) return res.status(404).json({ error: "找不到重劃區" });
    zones.splice(idx, 1);
    writeZones(zones);
    logAudit(req, "delete", "zone", zoneName);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "刪除失敗", detail: String(e) });
  }
});

// ---------- 建設公司 ----------
router.get("/api/admin/builders", (_req: Request, res: Response) => {
  try {
    const builders = readBuilders();
    res.json(builders);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/admin/builders/:name", (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const builders = readBuilders();
    const builder = builders.find((b) => b.builder_name === name);
    if (!builder) return res.status(404).json({ error: "找不到建設公司" });
    res.json(builder);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.post("/api/admin/builders", (req: Request, res: Response) => {
  try {
    const builders = readBuilders();
    const body = req.body as BuilderItem;
    if (builders.some((b) => b.builder_name === body.builder_name)) {
      return res.status(400).json({ error: "建設公司名稱已存在" });
    }
    builders.push(body);
    writeBuilders(builders);
    logAudit(req, "create", "builder", body.builder_name);
    res.status(201).json(body);
  } catch (e) {
    res.status(500).json({ error: "新增失敗", detail: String(e) });
  }
});

router.put("/api/admin/builders/:name", (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const builders = readBuilders();
    const idx = builders.findIndex((b) => b.builder_name === name);
    if (idx === -1) return res.status(404).json({ error: "找不到建設公司" });
    const body = req.body as BuilderItem;
    builders[idx] = { ...body, builder_name: body.builder_name || name };
    writeBuilders(builders);
    logAudit(req, "update", "builder", body.builder_name || name);
    res.json(builders[idx]);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

router.delete("/api/admin/builders/:name", (req: Request, res: Response) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const builders = readBuilders();
    const idx = builders.findIndex((b) => b.builder_name === name);
    if (idx === -1) return res.status(404).json({ error: "找不到建設公司" });
    builders.splice(idx, 1);
    writeBuilders(builders);
    logAudit(req, "delete", "builder", name);
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: "刪除失敗", detail: String(e) });
  }
});

// 建設公司 Logo 上傳（單檔，表單欄位 file；body 需有 builder_name）
router.post("/api/admin/builders/logo", (req: Request, res: Response) => {
  singleFileUpload(req, res, (err: Error) => {
    if (err) {
      return res.status(400).json({ error: "上傳失敗", detail: String(err.message || err) });
    }
    try {
      const file = (req as Request & { file?: Express.Multer.File }).file;
      const builderName = (req.body?.builder_name as string)?.trim();
      if (!file?.buffer) return res.status(400).json({ error: "請選擇圖片檔案" });
      if (!builderName) return res.status(400).json({ error: "請提供 builder_name" });
      const url = saveBuilderLogo(builderName, file.originalname, file.buffer);
      res.status(201).json({ url });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(400).json({ error: "上傳失敗", detail: msg });
    }
  });
});

// ---------- 對應表 ----------
router.get("/api/admin/zone-name-map", (_req: Request, res: Response) => {
  try {
    const map = readZoneNameMap();
    res.json(map);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/zone-name-map", (req: Request, res: Response) => {
  try {
    const map = req.body as Record<string, string>;
    writeZoneNameMap(map);
    logAudit(req, "update", "zone-name-map");
    res.json(map);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

router.get("/api/admin/builder-name-map", (_req: Request, res: Response) => {
  try {
    const map = readBuilderNameMap();
    res.json(map);
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/builder-name-map", (req: Request, res: Response) => {
  try {
    const map = req.body as Record<string, string>;
    writeBuilderNameMap(map);
    logAudit(req, "update", "builder-name-map");
    res.json(map);
  } catch (e) {
    res.status(500).json({ error: "更新失敗", detail: String(e) });
  }
});

// ---------- 登入（owner 帳號+密碼 或 agent 行動電話+密碼）----------
function agentHasRequiredProfile(agent: { resume?: AgentResume }): boolean {
  const r = agent.resume || {};
  const name = (r.name ?? "").toString().trim();
  const company = (r.company ?? "").toString().trim();
  const phone = (r.phone ?? "").toString().trim();
  const lineId = (r.lineId ?? "").toString().trim();
  return name.length > 0 && company.length > 0 && phone.length > 0 && lineId.length > 0;
}

router.post("/api/admin/login", (req: Request, res: Response) => {
  const body = (req.body || {}) as { password?: string; phone?: string; username?: string };
  const password = body.password;
  const phone = body.phone?.trim();
  const username = body.username?.trim();
  const adminUsername = (process.env.ADMIN_USERNAME || "").trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  const adminApiKey = process.env.ADMIN_API_KEY || "";

  if (phone && password) {
    const agent = findAgentByPhone(phone);
    if (!agent) return res.status(401).json({ ok: false, error: "行動電話或密碼錯誤" });
    if (!verifyPassword(password, agent.passwordHash)) return res.status(401).json({ ok: false, error: "行動電話或密碼錯誤" });
    // 已認證者須完成基本資料；未認證者也可登入，僅能填寫電子名片
    if (agent.status === "approved" && !agentHasRequiredProfile(agent)) {
      return res.status(403).json({ ok: false, error: "請先完成基本資料（姓名、公司、聯絡電話、LINE ID）後再由管理員審核，或聯絡管理員協助補填。" });
    }
    const { passwordHash: _, ...safe } = agent;
    return res.json({ ok: true, token: "agent:" + agent.id, role: "agent", agent: safe });
  }

  if (username && password) {
    if (adminUsername && adminPassword && username === adminUsername && password === adminPassword) {
      return res.json({ ok: true, token: adminPassword, role: "owner" });
    }
    return res.status(401).json({ ok: false, error: "帳號或密碼錯誤" });
  }

  const apiKey = req.headers["x-admin-key"] as string | undefined;
  if (adminApiKey && apiKey === adminApiKey) {
    return res.json({ ok: true, token: apiKey, role: "owner" });
  }
  res.status(401).json({ ok: false, error: "請提供管理員帳號與密碼，或業務行動電話與密碼" });
});

// ---------- 業務維護總覽（僅 owner）----------
router.get("/api/admin/agents/maintenance", ownerOnly, (req: Request, res: Response) => {
  try {
    const agents = readAgents().filter((a) => a.status === "approved");
    const assignments = readProjectAgents();
    const activity = readAgentActivity();
    const projects = readProjects().projects as { id?: number; 建案名稱?: string }[];

    const byAgent = agents.map((a) => {
      const projectIds = assignments.filter((x) => x.agentId === a.id).map((x) => x.projectId);
      const acts = activity.filter((e) => e.agentId === a.id);
      const imageCount = acts.filter((e) => e.action === "image_add").length;
      const videoCount = acts.filter((e) => e.action === "video_add").length;
      const maintainedProjectIds = [...new Set(acts.map((e) => e.projectId))];
      const lastAt = acts.length ? acts.map((e) => e.at).sort().reverse()[0] : null;
      let grade: "積極" | "一般" | "待加強" | "未開始" = "未開始";
      if (projectIds.length > 0) {
        const ratio = maintainedProjectIds.length / projectIds.length;
        const daysSince = lastAt ? (Date.now() - new Date(lastAt).getTime()) / (24 * 60 * 60 * 1000) : 999;
        if (ratio >= 0.8 && daysSince <= 30) grade = "積極";
        else if (maintainedProjectIds.length > 0) grade = "一般";
        else grade = "待加強";
      }
      return {
        agentId: a.id,
        name: a.resume?.name || a.resume?.phone || a.phone || a.id,
        phone: a.phone ?? a.resume?.phone,
        eCardStatus: a.eCardStatus,
        projectCount: projectIds.length,
        maintainedProjectCount: maintainedProjectIds.length,
        imageCount,
        videoCount,
        lastActivityAt: lastAt,
        grade,
        projects: projectIds.map((pid) => {
          const p = projects.find((x) => x.id === pid);
          const projectActs = acts.filter((e) => e.projectId === pid);
          const pImages = projectActs.filter((e) => e.action === "image_add").length;
          const pVideos = projectActs.filter((e) => e.action === "video_add").length;
          const last = projectActs.length ? projectActs.map((e) => e.at).sort().reverse()[0] : null;
          return {
            projectId: pid,
            projectName: p?.建案名稱 ?? String(pid),
            imageCount: pImages,
            videoCount: pVideos,
            lastActivityAt: last,
          };
        }),
      };
    });
    res.json({ agents: byAgent });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

// ---------- 業務列表與操作（僅 owner）----------
router.get("/api/admin/agents", ownerOnly, (_req: Request, res: Response) => {
  try {
    const list = readAgents().map((a) => {
      const { passwordHash: _, ...safe } = a;
      return safe;
    });
    res.json({ agents: list });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.get("/api/admin/agents/:id", ownerOnly, (req: Request, res: Response) => {
  try {
    const agent = findAgentById(req.params.id);
    if (!agent) return res.status(404).json({ error: "找不到該業務" });
    const { passwordHash: _, ...safe } = agent;
    const projectIds = getAgentProjectIds(agent.id);
    res.json({ ...safe, projectIds });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/agents/:id/approve", ownerOnly, (req: Request, res: Response) => {
  try {
    const agent = approveAgent(req.params.id);
    logAudit(req, "update", "agent-approve", agent.id, agent.phone ?? agent.resume?.phone ?? agent.id);
    const { passwordHash: _, ...safe } = agent;
    res.json(safe);
  } catch (e) {
    res.status(400).json({ error: (e as Error)?.message ?? "操作失敗" });
  }
});

router.put("/api/admin/agents/:id/e-card-status", ownerOnly, (req: Request, res: Response) => {
  try {
    const { status } = (req.body || {}) as { status?: ECardStatus };
    if (!status || !["draft", "pending_review", "published"].includes(status)) {
      return res.status(400).json({ error: "請提供 status: draft | pending_review | published" });
    }
    const agent = setAgentECardStatus(req.params.id, status);
    logAudit(req, "update", "agent-ecard", agent.id, status);
    const { passwordHash: _, ...safe } = agent;
    res.json(safe);
  } catch (e) {
    res.status(400).json({ error: (e as Error)?.message ?? "操作失敗" });
  }
});

router.post("/api/admin/projects/:id/assign", ownerOnly, (req: Request, res: Response) => {
  try {
    const projectId = parseInt(String(req.params.id), 10);
    if (Number.isNaN(projectId)) return res.status(400).json({ error: "建案 id 格式錯誤" });
    const { agentId } = (req.body || {}) as { agentId?: string };
    if (!agentId) return res.status(400).json({ error: "請提供 agentId" });
    if (getProjectById(projectId) == null) return res.status(404).json({ error: "找不到建案" });
    assignProjectToAgent(projectId, agentId, "assigned");
    logAudit(req, "update", "agent-assign", String(projectId), agentId);
    res.status(201).json({ projectId, agentId });
  } catch (e) {
    res.status(400).json({ error: (e as Error)?.message ?? "指派失敗" });
  }
});

router.delete("/api/admin/projects/:id/assign/:agentId", ownerOnly, (req: Request, res: Response) => {
  try {
    const projectId = parseInt(String(req.params.id), 10);
    const agentId = req.params.agentId;
    if (!agentId) return res.status(400).json({ error: "請提供 agentId" });
    unassignProjectFromAgent(projectId, agentId);
    logAudit(req, "delete", "agent-assign", String(projectId), agentId);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: (e as Error)?.message ?? "取消指派失敗" });
  }
});

// ---------- 業務本人：我的資料、我的社區（agent 登入後）----------
router.get("/api/admin/me", (req: Request, res: Response) => {
  if (!req.agentId) return res.status(403).json({ error: "請以業務帳號登入" });
  try {
    const agent = findAgentById(req.agentId);
    if (!agent) return res.status(404).json({ error: "找不到帳號" });
    const { passwordHash: _, ...safe } = agent;
    const projectIds = getAgentProjectIds(agent.id);
    const projects = (readProjects().projects as { id?: number; 建案名稱?: string }[]).filter((p) => projectIds.includes(p.id!));
    res.json({ ...safe, projects });
  } catch (e) {
    res.status(500).json({ error: "讀取失敗", detail: String(e) });
  }
});

router.put("/api/admin/me", (req: Request, res: Response) => {
  if (!req.agentId) return res.status(403).json({ error: "請以業務帳號登入" });
  try {
    const body = req.body as Partial<Pick<Agent, "resume" | "eCardVisibleFields" | "eCardStatus">>;
    if (body.eCardStatus && body.eCardStatus !== "draft" && body.eCardStatus !== "pending_review") {
      return res.status(400).json({ error: "業務僅可設為草稿或送出審核，審核通過由管理員設定" });
    }
    const agent = updateAgent(req.agentId, {
      resume: body.resume,
      eCardVisibleFields: body.eCardVisibleFields,
      eCardStatus: body.eCardStatus,
    });
    logAudit(req, "update", "agent-me", req.agentId);
    const { passwordHash: _, ...safe } = agent;
    res.json(safe);
  } catch (e) {
    res.status(400).json({ error: (e as Error)?.message ?? "更新失敗" });
  }
});

export default router;
