/**
 * 建案影片：儲存在 projects.json 的 project.videos
 * 支援 youtubeId 或 url（若只有 url 會嘗試解析 youtubeId）
 */
import { nanoid } from "nanoid";
import { readProjects, writeProjects } from "./data-helpers.js";

export type VideoPlatform = "youtube";

export interface ProjectVideo {
  id: string;
  platform: VideoPlatform;
  youtubeId?: string;
  url?: string;
  title: string;
  desc?: string;
  visible?: boolean;
  order?: number;
}

function ensureVideos(project: Record<string, unknown>): ProjectVideo[] {
  if (!Array.isArray((project as any).videos)) {
    (project as any).videos = [];
  }
  return (project as any).videos as ProjectVideo[];
}

function isLikelyYouTubeId(s: string): boolean {
  // YouTube video id 通常為 11 字元，但也可能被擴充；這裡保守允許 6~32
  return /^[a-zA-Z0-9_-]{6,32}$/.test(s);
}

export function extractYouTubeId(input: string): string | null {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (isLikelyYouTubeId(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && isLikelyYouTubeId(id) ? id : null;
  }

  if (host.endsWith("youtube.com")) {
    const v = url.searchParams.get("v");
    if (v && isLikelyYouTubeId(v)) return v;
    const parts = url.pathname.split("/").filter(Boolean);
    // /shorts/:id, /embed/:id
    const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (idx !== -1) {
      const id = parts[idx + 1];
      return id && isLikelyYouTubeId(id) ? id : null;
    }
  }

  return null;
}

export function getProjectVideos(projectId: number): ProjectVideo[] {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) return [];
  return ensureVideos(project);
}

export function addProjectVideo(
  projectId: number,
  input: {
    platform?: VideoPlatform;
    youtubeIdOrUrl: string;
    title: string;
    desc?: string;
  }
): ProjectVideo {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) throw new Error(`找不到建案 id ${projectId}`);

  const platform: VideoPlatform = (input.platform || "youtube") as VideoPlatform;
  if (platform !== "youtube") throw new Error("目前僅支援 YouTube");

  const youtubeId = extractYouTubeId(input.youtubeIdOrUrl);
  const url = String(input.youtubeIdOrUrl || "").trim();
  if (!youtubeId && !url) throw new Error("請提供 YouTube 影片 ID 或連結");
  if (!input.title?.trim()) throw new Error("請提供影片標題");

  const videos = ensureVideos(project);
  const video: ProjectVideo = {
    id: nanoid(10),
    platform,
    youtubeId: youtubeId || undefined,
    url: url || undefined,
    title: input.title.trim(),
    desc: input.desc?.trim() || undefined,
    visible: true,
  };
  videos.push(video);
  writeProjects(data);
  return video;
}

export function removeProjectVideo(projectId: number, videoId: string): boolean {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) return false;
  const videos = ensureVideos(project);
  const idx = videos.findIndex((v) => v.id === videoId);
  if (idx === -1) return false;
  videos.splice(idx, 1);
  writeProjects(data);
  return true;
}

export function reorderProjectVideos(projectId: number, orderedIds: string[]): ProjectVideo[] {
  const data = readProjects();
  const project = (data.projects as Record<string, unknown>[]).find((p) => (p.id as number) === projectId);
  if (!project) throw new Error(`找不到建案 id ${projectId}`);
  const videos = ensureVideos(project);

  const idSet = new Set(videos.map((v) => v.id));
  const next = orderedIds.filter((id) => idSet.has(id));
  if (next.length !== videos.length) {
    throw new Error("排序失敗，請確認 ids 與現有影片一致");
  }
  const byId = new Map(videos.map((v) => [v.id, v] as const));
  (project as any).videos = next.map((id) => byId.get(id)!);
  writeProjects(data);
  return (project as any).videos as ProjectVideo[];
}

