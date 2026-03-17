/**
 * 業務帳號、電子履歷／名片、社區綁定、活動紀錄（僅存於 server/data/，不對外暴露）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data");

/** 確保 server/data 存在，避免首次寫入失敗 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function dataPath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

function readJson<T>(filename: string, defaultValue: T): T {
  const p = dataPath(filename);
  if (!fs.existsSync(p)) return defaultValue;
  try {
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson(filename: string, data: unknown): void {
  ensureDataDir();
  const p = dataPath(filename);
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    throw new Error(`寫入 ${filename} 失敗: ${(e as Error)?.message ?? e}`);
  }
}

// ---------- 業務履歷／名片欄位（與前端一致）----------
export const RESUME_FIELDS = [
  "photoUrl",
  "name",
  "title",
  "phone",
  "lineId",
  "email",
  "regions",
  "transactionCount",
  "specialties",
  "license",
  "intro",
] as const;

export type ResumeField = (typeof RESUME_FIELDS)[number];

export interface AgentResume {
  photoUrl?: string;
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  lineId?: string;
  email?: string;
  regions?: string[];
  transactionCount?: string;
  specialties?: string[];
  license?: string;
  intro?: string;
}

export type AgentStatus = "pending" | "approved";
export type ECardStatus = "draft" | "pending_review" | "published";

export interface Agent {
  id: string;
  /** 登入用行動電話（與 resume.phone 同步；舊資料可能無此欄位，以 resume.phone 為準） */
  phone?: string;
  /** 舊版登入用，已改為以電話登入；選填、僅供顯示 */
  email?: string;
  passwordHash: string;
  status: AgentStatus;
  resume: AgentResume;
  eCardVisibleFields: ResumeField[];
  eCardStatus: ECardStatus;
  createdAt: string;
  updatedAt: string;
}

/** 正規化電話號碼以便比對：僅保留數字 */
function normalizePhone(s: string): string {
  return (s || "").replace(/\D/g, "");
}

export interface ProjectAgent {
  projectId: number;
  agentId: string;
  role: "creator" | "assigned";
  assignedAt: string;
}

export interface AgentActivityEntry {
  projectId: number;
  agentId: string;
  action: "image_add" | "video_add";
  at: string;
}

interface AgentsData {
  agents: Agent[];
}

interface ProjectAgentsData {
  assignments: ProjectAgent[];
}

interface AgentActivityData {
  entries: AgentActivityEntry[];
}

const defaultAgents: AgentsData = { agents: [] };
const defaultProjectAgents: ProjectAgentsData = { assignments: [] };
const defaultActivity: AgentActivityData = { entries: [] };

export function readAgents(): Agent[] {
  return readJson<AgentsData>("agents.json", defaultAgents).agents;
}

function writeAgentsList(agents: Agent[]): void {
  writeJson("agents.json", { agents });
}

export function readProjectAgents(): ProjectAgent[] {
  return readJson<ProjectAgentsData>("project_agents.json", defaultProjectAgents).assignments;
}

function writeProjectAgentsList(assignments: ProjectAgent[]): void {
  writeJson("project_agents.json", { assignments });
}

export function readAgentActivity(): AgentActivityEntry[] {
  return readJson<AgentActivityData>("agent_activity.json", defaultActivity).entries;
}

function writeAgentActivityList(entries: AgentActivityEntry[]): void {
  writeJson("agent_activity.json", { entries });
}

// ---------- Agent CRUD ----------
export function findAgentById(id: string): Agent | null {
  return readAgents().find((a) => a.id === id) ?? null;
}

export function findAgentByPhone(phone: string): Agent | null {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return readAgents().find((a) => normalizePhone(a.phone ?? a.resume?.phone ?? "") === normalized) ?? null;
}

/** @deprecated 已改為以行動電話登入，僅保留供相容 */
export function findAgentByEmail(email: string): Agent | null {
  const normalized = (email || "").trim().toLowerCase();
  return readAgents().find((a) => (a.email || "").toLowerCase() === normalized) ?? null;
}

export interface AgentRegistrationData {
  name: string;
  company: string;
  phone: string;
  lineId: string;
  email?: string;
  cardImageUrl?: string;
}

/** 正規化 LINE ID 以便比對（小寫、去空白） */
function normalizeLineId(s: string): string {
  return (s || "").trim().toLowerCase();
}

export function createAgent(
  phone: string,
  passwordHash: string,
  registration?: AgentRegistrationData
): Agent {
  const agents = readAgents();
  const normalized = normalizePhone(phone);
  if (!normalized) throw new Error("請提供有效的聯絡電話");
  if (agents.some((a) => normalizePhone(a.phone ?? a.resume?.phone ?? "") === normalized)) {
    throw new Error("此行動電話已註冊");
  }
  const lineIdNorm = registration?.lineId ? normalizeLineId(registration.lineId) : "";
  if (lineIdNorm && agents.some((a) => normalizeLineId((a.resume?.lineId ?? "").toString()) === lineIdNorm)) {
    throw new Error("此 LINE ID 已註冊");
  }
  const now = new Date().toISOString();
  const phoneDisplay = registration?.phone?.trim() ?? phone.trim();
  const resume: AgentResume = registration
    ? {
        name: registration.name.trim(),
        company: registration.company.trim(),
        phone: phoneDisplay,
        lineId: registration.lineId.trim(),
        ...(registration.email?.trim() ? { email: registration.email.trim() } : {}),
        ...(registration.cardImageUrl ? { photoUrl: registration.cardImageUrl } : {}),
      }
    : {};
  const agent: Agent = {
    id: nanoid(12),
    phone: normalized,
    passwordHash,
    status: "pending",
    resume,
    eCardVisibleFields: [...RESUME_FIELDS],
    eCardStatus: "draft",
    createdAt: now,
    updatedAt: now,
  };
  agents.push(agent);
  writeAgentsList(agents);
  return agent;
}

export function updateAgent(agentId: string, updates: Partial<Pick<Agent, "resume" | "eCardVisibleFields" | "eCardStatus" | "status">>): Agent {
  const agents = readAgents();
  const idx = agents.findIndex((a) => a.id === agentId);
  if (idx === -1) throw new Error("找不到該業務");
  const now = new Date().toISOString();
  agents[idx] = {
    ...agents[idx],
    ...updates,
    updatedAt: now,
  };
  writeAgentsList(agents);
  return agents[idx];
}

export function approveAgent(agentId: string): Agent {
  return updateAgent(agentId, { status: "approved" });
}

export function setAgentECardStatus(agentId: string, status: ECardStatus): Agent {
  return updateAgent(agentId, { eCardStatus: status });
}

// ---------- Project-Agent 綁定（最多 2 人/社區）----------
const MAX_AGENTS_PER_PROJECT = 2;

export function getProjectAgentIds(projectId: number): string[] {
  return readProjectAgents()
    .filter((a) => a.projectId === projectId)
    .map((a) => a.agentId);
}

export function getAgentProjectIds(agentId: string): number[] {
  return readProjectAgents()
    .filter((a) => a.agentId === agentId)
    .map((a) => a.projectId);
}

export function isAgentAssignedToProject(agentId: string, projectId: number): boolean {
  return readProjectAgents().some((a) => a.projectId === projectId && a.agentId === agentId);
}

export function assignProjectToAgent(projectId: number, agentId: string, role: "creator" | "assigned"): void {
  const assignments = readProjectAgents();
  const current = assignments.filter((a) => a.projectId === projectId);
  if (current.length >= MAX_AGENTS_PER_PROJECT) throw new Error("該社區已達最多 2 位業務");
  if (current.some((a) => a.agentId === agentId)) throw new Error("該業務已在名單中");
  const agent = findAgentById(agentId);
  if (!agent || agent.status !== "approved") throw new Error("業務不存在或尚未認證通過");
  assignments.push({
    projectId,
    agentId,
    role,
    assignedAt: new Date().toISOString(),
  });
  writeProjectAgentsList(assignments);
}

export function unassignProjectFromAgent(projectId: number, agentId: string): void {
  const assignments = readProjectAgents().filter(
    (a) => !(a.projectId === projectId && a.agentId === agentId)
  );
  if (assignments.length === readProjectAgents().length) throw new Error("找不到該指派");
  writeProjectAgentsList(assignments);
}

// ---------- 活動紀錄（供維護程度統計）----------
export function logAgentActivity(projectId: number, agentId: string, action: "image_add" | "video_add"): void {
  const entries = readAgentActivity();
  entries.push({
    projectId,
    agentId,
    action,
    at: new Date().toISOString(),
  });
  writeAgentActivityList(entries);
}
