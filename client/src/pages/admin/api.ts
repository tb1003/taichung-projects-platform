/**
 * 後台 API 請求：base URL 與權限 token
 */
const API_BASE = "";

function getToken(): string | null {
  return sessionStorage.getItem("admin_token");
}

function headers(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  return h;
}

export type LoginRole = "owner" | "agent";

export async function apiLogin(body: { password: string; username?: string; phone?: string }): Promise<{
  ok: boolean;
  token?: string;
  role?: LoginRole;
  agent?: Record<string, unknown>;
  error?: string;
}> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { ok: false, error: "無法連線至後端，請確認已啟動 API 伺服器（npm run dev:server）" };
  }
  let data: { ok?: boolean; token?: string; role?: LoginRole; agent?: Record<string, unknown>; error?: string };
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "後端回應異常，請確認使用 http://localhost:5173 開啟後台（並已執行 npm run dev）" };
  }
  if (data.ok && data.token) {
    sessionStorage.setItem("admin_token", data.token);
    if (data.role) sessionStorage.setItem("admin_role", data.role);
  }
  return data;
}

/** 業務註冊用名片圖片上傳（不需登入），回傳可填入 cardImageUrl 的網址 */
export async function apiUploadRegisterCard(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/public/register-card-upload`, { method: "POST", body: formData });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = "上傳失敗";
    try {
      const err = text ? (JSON.parse(text) as { error?: string; detail?: string }) : {};
      errMsg = err.detail || err.error || errMsg;
    } catch {
      if (text) errMsg = text.slice(0, 200);
    }
    throw new Error(errMsg);
  }
  const data = await res.json() as { url: string };
  return { url: data.url };
}

export async function apiRegister(body: {
  password: string;
  name: string;
  company: string;
  phone: string;
  lineId: string;
  email?: string;
  cardImageUrl?: string;
}): Promise<{ agent: Record<string, unknown>; token?: string; role?: string }> {
  const res = await fetch(`${API_BASE}/api/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = "註冊失敗";
    try {
      const err = text ? (JSON.parse(text) as { error?: string }) : {};
      errMsg = err.error || errMsg;
    } catch {
      if (res.status === 404) errMsg = "找不到註冊 API，請確認使用 npm run dev 啟動且為 taichung-projects-platform 專案";
      else if (res.status >= 500) errMsg = `伺服器錯誤 (${res.status})，請查看終端機錯誤訊息`;
    }
    throw new Error(errMsg);
  }
  const data = await res.json() as { agent: Record<string, unknown>; token?: string; role?: string };
  if (data.token && data.role) {
    sessionStorage.setItem("admin_token", data.token);
    sessionStorage.setItem("admin_role", data.role);
  }
  return data;
}

/** 安全解析錯誤回應，避免空 body 或非 JSON 導致 "Unexpected end of JSON input" */
async function parseErrorBody(res: Response): Promise<{ error?: string; message?: string; detail?: string }> {
  const text = await res.text();
  if (!text.trim()) {
    if (res.status === 502) return { error: "無法連線至後端，請確認已啟動 API（npm run dev 或 npm run dev:server）" };
    if (res.status === 500) return { error: "伺服器錯誤。請用終端機顯示的網址開啟（若 5173 被佔用會改用 5174），並查看終端機錯誤訊息。" };
    return {};
  }
  try {
    return JSON.parse(text) as { error?: string; message?: string; detail?: string };
  } catch {
    return { error: res.status === 502 ? "無法連線至後端，請確認已啟動 API（npm run dev 或 npm run dev:server）" : res.statusText };
  }
}

function toErrorMessage(body: { error?: string; message?: string; detail?: string }, fallback: string): string {
  const main = body?.error || body?.message || fallback;
  return body?.detail ? `${main}（${body.detail}）` : main;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    const body = await parseErrorBody(res);
    throw new Error(toErrorMessage(body, res.status === 404 ? "找不到資源" : res.statusText));
  }
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await parseErrorBody(res);
    throw new Error(toErrorMessage(err, res.statusText));
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("後端回傳格式異常");
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await parseErrorBody(res);
    throw new Error(toErrorMessage(err, res.statusText));
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function apiDelete(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: headers() });
  if (!res.ok) {
    const err = await parseErrorBody(res);
    throw new Error(toErrorMessage(err, res.statusText));
  }
}

// ---------- 建案圖片 ----------
export interface ProjectImagesResponse {
  exterior?: string[];
  amenity?: string[];
  layout?: string[];
}

export async function apiGetProjectImages(projectId: number): Promise<ProjectImagesResponse> {
  return apiGet<ProjectImagesResponse>(`/api/admin/projects/${projectId}/images`);
}

export async function apiUploadProjectImages(formData: FormData): Promise<{
  uploaded: { projectId: number; projectName: string; url: string }[];
  errors?: string[];
}> {
  const h: HeadersInit = {};
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/projects/images`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    const msg = err.detail ? `${err.error || "上傳失敗"}: ${err.detail}` : (err.error || res.statusText);
    throw new Error(msg);
  }
  return res.json();
}

export async function apiDeleteProjectImage(projectId: number, category: string, url: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${projectId}/images`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ category, url }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
}

export async function apiReorderProjectImages(
  projectId: number,
  category: string,
  order: string[]
): Promise<ProjectImagesResponse> {
  return apiPut<ProjectImagesResponse>(`/api/admin/projects/${projectId}/images/order`, { category, order });
}

// ---------- 建案影片 ----------
export interface ProjectVideo {
  id: string;
  platform: "youtube";
  youtubeId?: string;
  url?: string;
  title: string;
  desc?: string;
  visible?: boolean;
  order?: number;
}

export async function apiGetProjectVideos(projectId: number): Promise<{ videos: ProjectVideo[] }> {
  return apiGet<{ videos: ProjectVideo[] }>(`/api/admin/projects/${projectId}/videos`);
}

export async function apiAddProjectVideo(
  projectId: number,
  body: { youtubeIdOrUrl: string; title: string; desc?: string }
): Promise<{ video: ProjectVideo }> {
  return apiPost<{ video: ProjectVideo }>(`/api/admin/projects/${projectId}/videos`, body);
}

export async function apiDeleteProjectVideo(projectId: number, videoId: string): Promise<void> {
  return apiDelete(`/api/admin/projects/${projectId}/videos/${encodeURIComponent(videoId)}`);
}

export async function apiReorderProjectVideos(
  projectId: number,
  ids: string[]
): Promise<{ videos: ProjectVideo[] }> {
  return apiPut<{ videos: ProjectVideo[] }>(`/api/admin/projects/${projectId}/videos/order`, { ids });
}

// ---------- 業務與電子名片（owner）----------
export interface AgentSafe {
  id: string;
  phone?: string;
  email?: string;
  status: string;
  resume: Record<string, unknown>;
  eCardVisibleFields: string[];
  eCardStatus: string;
  createdAt: string;
  updatedAt: string;
  projectIds?: number[];
}

export async function apiGetAgents(): Promise<{ agents: AgentSafe[] }> {
  return apiGet<{ agents: AgentSafe[] }>("/api/admin/agents");
}

export async function apiGetMaintenance(): Promise<{
  agents: Array<{
    agentId: string;
    name: string;
    phone?: string;
    eCardStatus: string;
    projectCount: number;
    maintainedProjectCount: number;
    imageCount: number;
    videoCount: number;
    lastActivityAt: string | null;
    grade: string;
    projects: Array<{ projectId: number; projectName: string; imageCount: number; videoCount: number; lastActivityAt: string | null }>;
  }>;
}> {
  return apiGet("/api/admin/agents/maintenance");
}

export async function apiApproveAgent(agentId: string): Promise<AgentSafe> {
  return apiPut<AgentSafe>(`/api/admin/agents/${encodeURIComponent(agentId)}/approve`, {});
}

export async function apiSetECardStatus(agentId: string, status: string): Promise<AgentSafe> {
  return apiPut<AgentSafe>(`/api/admin/agents/${encodeURIComponent(agentId)}/e-card-status`, { status });
}

export async function apiAssignProject(projectId: number, agentId: string): Promise<void> {
  await apiPost(`/api/admin/projects/${projectId}/assign`, { agentId });
}

export async function apiUnassignProject(projectId: number, agentId: string): Promise<void> {
  await apiDelete(`/api/admin/projects/${projectId}/assign/${encodeURIComponent(agentId)}`);
}

export async function apiGetProjectAgents(projectId: number): Promise<{ agents: Array<{ id: string; phone?: string; name?: string }> }> {
  return apiGet(`/api/admin/projects/${projectId}/agents`);
}

// ---------- 業務本人（agent）----------
export async function apiGetMe(): Promise<AgentSafe & { projects: Array<{ id: number; 建案名稱?: string }> }> {
  return apiGet("/api/admin/me");
}

export async function apiPutMe(body: { resume?: Record<string, unknown>; eCardVisibleFields?: string[]; eCardStatus?: string }): Promise<AgentSafe> {
  return apiPut<AgentSafe>("/api/admin/me", body);
}

/** 上傳建設公司 Logo（單張圖片），回傳可寫入 logo_url 的 URL */
export async function apiUploadBuilderLogo(builderName: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("builder_name", builderName);
  const h: HeadersInit = {};
  const t = sessionStorage.getItem("admin_token");
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/builders/logo`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    throw new Error(err.detail || err.error || "上傳失敗");
  }
  return res.json();
}

// ---------- 市場動態（房市快訊）----------
export interface MarketNewsArticle {
  id: string;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  summary: string;
  image?: string | null;
  body: string;
}

export interface MarketNewsData {
  source: string;
  updated: string;
  articles: MarketNewsArticle[];
}

export async function apiGetMarketNews(): Promise<MarketNewsData> {
  return apiGet<MarketNewsData>("/api/admin/market-news");
}

export async function apiPutMarketNews(data: MarketNewsData): Promise<MarketNewsData> {
  return apiPut<MarketNewsData>("/api/admin/market-news", data);
}

export async function apiUploadMarketNewsImage(articleId: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("articleId", articleId);
  const h: HeadersInit = {};
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/market-news/image`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; detail?: string };
    throw new Error(err.detail || err.error || "上傳失敗");
  }
  return res.json();
}

// ---------- 五義地產筆記（owner 專用）----------
export interface KungfuItem {
  id: string;
  title: string;
  slug: string;
  imageUrls: string[];
  pdfUrls?: string[];
  youtubeUrl?: string;
  body: string;
  order: number;
}

export interface KungfuData {
  items: KungfuItem[];
}

export async function apiGetKungfu(): Promise<KungfuData> {
  return apiGet<KungfuData>("/api/admin/kungfu");
}

export async function apiPutKungfu(data: KungfuData): Promise<KungfuData> {
  return apiPut<KungfuData>("/api/admin/kungfu", data);
}

/** 上傳真功夫圖片或 PDF（單檔），回傳 { url, type: 'image' | 'pdf' } */
export async function apiUploadKungfuFile(file: File): Promise<{ url: string; type: "image" | "pdf" }> {
  const formData = new FormData();
  formData.append("file", file);
  const h: HeadersInit = {};
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/kungfu/upload`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = "上傳失敗";
    try {
      const err = text ? (JSON.parse(text) as { error?: string; detail?: string }) : {};
      errMsg = err.detail || err.error || errMsg;
    } catch {
      if (res.status === 401) errMsg = "未授權，請重新登入";
      else if (res.status === 403) errMsg = "僅最高權限可上傳，請使用 owner 帳號";
      else if (res.status === 502) errMsg = "無法連線至後端，請確認已啟動（npm run dev）";
      else if (text) errMsg = text.slice(0, 200);
    }
    throw new Error(errMsg);
  }
  return res.json();
}

// ---------- 審計紀錄（owner 專用）----------
export interface AuditEntry {
  at: string;
  by: string;
  action: "create" | "update" | "delete";
  entity: string;
  entityId?: string;
  detail?: string;
}

export async function apiGetAudit(limit?: number): Promise<{ entries: AuditEntry[] }> {
  const q = limit != null ? `?limit=${limit}` : "";
  return apiGet<{ entries: AuditEntry[] }>(`/api/admin/audit${q}`);
}

// ---------- 房產工具區塊（買賣前先搞懂／查行情與區域／查證與進階工具）----------
export interface ToolItem {
  id: string;
  label: string;
  order: number;
  href?: string;
  external?: boolean;
  body?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
}

export interface ToolBlock {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: ToolItem[];
}

export interface ToolBlocksData {
  blocks: ToolBlock[];
  _meta?: { lastModifiedAt: string; lastModifiedBy: string };
}

export async function apiGetToolBlocks(): Promise<ToolBlocksData> {
  return apiGet<ToolBlocksData>("/api/admin/tool-blocks");
}

export async function apiPutToolBlocks(data: ToolBlocksData): Promise<ToolBlocksData> {
  return apiPut<ToolBlocksData>("/api/admin/tool-blocks", data);
}

export async function apiUploadTeamImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const h: HeadersInit = {};
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/team-members/upload`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = "上傳失敗";
    try {
      const err = text ? (JSON.parse(text) as { error?: string; detail?: string }) : {};
      errMsg = err.detail || err.error || errMsg;
    } catch {
      if (text) errMsg = text.slice(0, 200);
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export async function apiUploadToolBlockImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const h: HeadersInit = {};
  const t = getToken();
  if (t) (h as Record<string, string>)["X-Admin-Key"] = t;
  const res = await fetch(`${API_BASE}/api/admin/tool-blocks/upload`, { method: "POST", headers: h, body: formData });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = "上傳失敗";
    try {
      const err = text ? (JSON.parse(text) as { error?: string; detail?: string }) : {};
      errMsg = err.detail || err.error || errMsg;
    } catch {
      if (text) errMsg = text.slice(0, 200);
    }
    throw new Error(errMsg);
  }
  return res.json();
}
