/**
 * 建案圖片：外觀／公設／格局配置圖，上傳歸檔至所選建案、刪除與排序
 */
import { useEffect, useState, useRef } from "react";
import { normalizeForSearch } from "@/lib/utils";
import {
  apiGet,
  apiUploadProjectImages,
  apiGetProjectImages,
  apiDeleteProjectImage,
  apiReorderProjectImages,
  apiGetProjectVideos,
  apiAddProjectVideo,
  apiDeleteProjectVideo,
  apiReorderProjectVideos,
  apiGetAgents,
  apiGetProjectAgents,
  apiAssignProject,
  apiUnassignProject,
  type ProjectImagesResponse,
  type ProjectVideo,
  type AgentSafe,
} from "./api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown, Trash2, Upload, X } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbUrl, fetchYouTubeTitle } from "@/lib/youtube";

const CATEGORIES = [
  { key: "exterior", label: "外觀照", max: 10 },
  { key: "amenity", label: "公設照", max: 10 },
  { key: "layout", label: "格局配置圖", max: 10 },
] as const;

interface ProjectOption {
  id: number;
  建案名稱: string;
}

/** 建案名稱是否符合關鍵字（不分全形/半形、大小寫、國字與阿拉伯數字） */
function matchProjectName(name: string, query: string): boolean {
  if (!query.trim()) return true;
  return normalizeForSearch(name).includes(normalizeForSearch(query.trim()));
}

export default function ProjectImagesPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState<ProjectImagesResponse>({ exterior: [], amenity: [], layout: [] });
  const [videos, setVideos] = useState<ProjectVideo[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  /** 待上傳：同社區批次上傳（歸檔至所選建案），選檔後先列清單，按「上傳」才送出 */
  const [pendingUploads, setPendingUploads] = useState<Record<string, File[]>>({});
  /** 目前拖曳懸停的類別（用於 drop zone 高亮） */
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  /** 負責業務（僅 owner 顯示） */
  const [projectAgents, setProjectAgents] = useState<Array<{ id: string; email: string; name?: string }>>([]);
  const [allAgents, setAllAgents] = useState<AgentSafe[]>([]);
  const isOwner = typeof sessionStorage !== "undefined" && sessionStorage.getItem("admin_role") === "owner";

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) => matchProjectName(p.建案名稱, searchQuery))
    : projects;
  const selectedProject = selectedId !== "" ? projects.find((p) => p.id === selectedId) : null;
  const optionsList = selectedProject && !filteredProjects.some((p) => p.id === selectedId)
    ? [selectedProject, ...filteredProjects]
    : filteredProjects;

  const loadProjects = () => {
    apiGet<{ projects: ProjectOption[] }>("/api/admin/projects")
      .then((d) => setProjects(d.projects || []))
      .catch((e) => setError(e.message));
  };

  const loadImages = (id: number) => {
    setError("");
    apiGetProjectImages(id)
      .then((data) => {
        setImages(data);
        setError("");
      })
      .catch((e) => {
        setImages({ exterior: [], amenity: [], layout: [] });
        setError(e instanceof Error ? e.message : "無法載入圖片");
      });
  };

  const loadVideos = (id: number) => {
    apiGetProjectVideos(id)
      .then((d) => setVideos(Array.isArray(d.videos) ? d.videos : []))
      .catch(() => setVideos([]));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedId !== "" && typeof selectedId === "number") {
      loadImages(selectedId);
      loadVideos(selectedId);
      if (isOwner) {
        apiGetProjectAgents(selectedId).then((r) => setProjectAgents(r.agents || [])).catch(() => setProjectAgents([]));
      }
    } else {
      setImages({ exterior: [], amenity: [], layout: [] });
      setVideos([]);
      setProjectAgents([]);
    }
    setPendingUploads({});
    setVideoConfirmedId(null);
    setVideoConfirmError("");
    setVideoConfirmMessage("");
  }, [selectedId, isOwner]);

  useEffect(() => {
    if (isOwner) apiGetAgents().then((r) => setAllAgents(r.agents || [])).catch(() => setAllAgents([]));
  }, [isOwner]);

  /** 搜尋結果僅一筆且名稱相符時，自動帶入選取（避免只打字沒點選而出現 Not found） */
  useEffect(() => {
    if (filteredProjects.length !== 1 || !searchQuery.trim()) return;
    const name = filteredProjects[0].建案名稱;
    if (normalizeForSearch(name) === normalizeForSearch(searchQuery.trim()) && selectedId !== filteredProjects[0].id) {
      setSelectedId(filteredProjects[0].id);
    }
  }, [searchQuery, filteredProjects, selectedId]);

  const doProjectUpload = (category: string, files: File[]) => {
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!files.length) return;
    setError("");
    setMessage("");
    setUploading(category);
    const form = new FormData();
    form.append("category", category);
    form.append("projectId", String(selectedId));
    files.forEach((f) => form.append("files", f));
    apiUploadProjectImages(form)
      .then((r) => {
        setMessage(`已上傳 ${r.uploaded.length} 張${r.errors?.length ? `，${r.errors.length} 筆失敗` : ""}`);
        if (r.errors?.length) setError(r.errors.join("；"));
        loadImages(selectedId);
        setPendingUploads((prev) => ({ ...prev, [category]: [] }));
      })
      .catch((e) => setError(e.message))
      .finally(() => setUploading(null));
  };

  const handleDelete = (category: string, url: string) => {
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!confirm("確定刪除此圖片？")) return;
    apiDeleteProjectImage(selectedId, category, url)
      .then(() => loadImages(selectedId))
      .catch((e) => setError(e.message));
  };

  const handleMove = (category: string, list: string[], index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= list.length) return;
    const order = [...list];
    [order[index], order[next]] = [order[next], order[index]];
    if (selectedId === "" || typeof selectedId !== "number") return;
    apiReorderProjectImages(selectedId, category, order)
      .then(setImages)
      .catch((e) => setError(e.message));
  };

  const [videoTitle, setVideoTitle] = useState("");
  const [videoInput, setVideoInput] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoConfirmedId, setVideoConfirmedId] = useState<string | null>(null);
  const [videoConfirmError, setVideoConfirmError] = useState("");
  const [videoConfirmMessage, setVideoConfirmMessage] = useState("");
  const [confirmingVideo, setConfirmingVideo] = useState(false);

  const addVideo = async () => {
    if (selectedId === "" || typeof selectedId !== "number") return;
    setError("");
    setMessage("");
    if (!videoInput.trim()) return setError("請輸入 YouTube 影片 ID 或連結");
    if (!videoConfirmedId || extractYouTubeId(videoInput.trim()) !== videoConfirmedId) {
      return setError("請先按「確認」驗證 YouTube 連結/ID");
    }
    try {
      const titleToUse = videoTitle.trim() || (await fetchYouTubeTitle(videoConfirmedId));
      await apiAddProjectVideo(selectedId, { title: titleToUse, youtubeIdOrUrl: videoInput.trim(), desc: videoDesc.trim() || undefined });
      setVideoTitle("");
      setVideoInput("");
      setVideoDesc("");
      setVideoConfirmedId(null);
      setVideoConfirmError("");
      setVideoConfirmMessage("");
      setMessage("已新增影片");
      loadVideos(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "新增影片失敗");
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (selectedId === "" || typeof selectedId !== "number") return;
    if (!confirm("確定刪除此影片？")) return;
    try {
      await apiDeleteProjectVideo(selectedId, videoId);
      setMessage("已刪除影片");
      loadVideos(selectedId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "刪除影片失敗");
    }
  };

  const moveVideo = async (index: number, dir: 1 | -1) => {
    if (selectedId === "" || typeof selectedId !== "number") return;
    const next = index + dir;
    if (next < 0 || next >= videos.length) return;
    const ids = [...videos.map((v) => v.id)];
    [ids[index], ids[next]] = [ids[next], ids[index]];
    try {
      const r = await apiReorderProjectVideos(selectedId, ids);
      setVideos(r.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "排序失敗");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800">建案圖片及影片</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Label className="text-slate-600">選擇建案（檢視／上傳歸檔）</Label>
          <div ref={comboboxRef} className="relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="輸入關鍵字搜尋（如：惠宇、VVS1）"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm w-56"
              />
              {searchQuery.trim() && (
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  符合「{searchQuery}」共 {filteredProjects.length} 筆
                </span>
              )}
            </div>
            {dropdownOpen && (
              <ul
                className="absolute left-0 top-full z-50 mt-1 max-h-60 w-72 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                role="listbox"
              >
                {optionsList.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500">無符合的建案</li>
                ) : (
                  optionsList.map((p) => (
                    <li
                      key={p.id}
                      role="option"
                      aria-selected={selectedId === p.id}
                      className={`cursor-pointer px-3 py-2 text-sm hover:bg-amber-50 ${
                        selectedId === p.id ? "bg-amber-100 font-medium" : ""
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedId(p.id);
                        setSearchQuery(p.建案名稱);
                        setDropdownOpen(false);
                      }}
                    >
                      {p.建案名稱}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <p className="text-slate-500 text-sm">
        請先選擇建案；圖片上傳將歸檔至所選建案（同社區可一次選多張，按「上傳」才會送出）。
      </p>

      {isOwner && selectedId !== "" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-800 mb-2">負責業務（最多 2 位）</h2>
          <ul className="space-y-2 mb-3">
            {projectAgents.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.name || a.phone || "—"}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirm("確定移除此業務？")) return;
                    apiUnassignProject(selectedId as number, a.id).then(() => apiGetProjectAgents(selectedId as number).then((r) => setProjectAgents(r.agents || []))).catch((e) => setError(e.message));
                  }}
                  className="text-red-600 hover:underline"
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
          {projectAgents.length < 2 && (
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                apiAssignProject(selectedId as number, id).then(() => apiGetProjectAgents(selectedId as number).then((r) => setProjectAgents(r.agents || []))).catch((err) => setError(err.message));
                e.target.value = "";
              }}
            >
              <option value="">加入業務…</option>
              {allAgents
                .filter((a) => a.status === "approved" && !projectAgents.some((p) => p.id === a.id))
                .map((a) => (
                  <option key={a.id} value={a.id}>{(a.resume as Record<string, unknown>)?.name as string || ((a as Record<string, unknown>).phone ?? (a.resume as Record<string, unknown>)?.phone ?? a.id)}</option>
                ))}
            </select>
          )}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["exterior", "amenity", "layout"]} className="space-y-2">
        {CATEGORIES.map(({ key, label, max }) => {
          const list = (images[key] || []) as string[];
          const isUploading = uploading === key;
          return (
            <AccordionItem key={key} value={key} className="border rounded-lg px-4 bg-white">
              <AccordionTrigger>
                {label}（最多 {max} 張）{list.length > 0 && ` · 已 ${list.length} 張`}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>同社區批次上傳（歸檔至所選建案）</Label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading || selectedId === ""}
                    onChange={(e) => {
                      setError("");
                      setMessage("");
                      const f = e.target.files;
                      if (!f?.length) return;
                      const next = Array.from(f);
                      const remaining = Math.max(0, max - list.length);
                      if (remaining === 0) {
                        setError(`「${label}」已達上限（最多 ${max} 張），請先刪除後再上傳`);
                        e.target.value = "";
                        return;
                      }
                      if (next.length > remaining) {
                        setError(`「${label}」一次最多可再上傳 ${remaining} 張（目前已 ${list.length} / ${max}）`);
                      }
                      setPendingUploads((prev) => ({ ...prev, [key]: next.slice(0, remaining) }));
                      e.target.value = "";
                    }}
                    className="block w-full text-sm text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-800"
                  />
                  {selectedId !== "" && !isUploading && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = "copy";
                        setDragOverKey(key);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragOverKey(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverKey(null);
                        setError("");
                        setMessage("");
                        const f = e.dataTransfer.files;
                        if (!f?.length) return;
                        const next = Array.from(f).filter((file) => file.type.startsWith("image/"));
                        if (next.length === 0) return;
                        const remaining = Math.max(0, max - list.length);
                        if (remaining === 0) {
                          setError(`「${label}」已達上限（最多 ${max} 張），請先刪除後再上傳`);
                          return;
                        }
                        if (next.length > remaining) {
                          setError(`「${label}」一次最多可再上傳 ${remaining} 張（目前已 ${list.length} / ${max}）`);
                        }
                        setPendingUploads((prev) => ({ ...prev, [key]: next.slice(0, remaining) }));
                      }}
                      className={`rounded-lg border-2 border-dashed px-3 py-4 text-center text-sm transition-colors ${
                        dragOverKey === key
                          ? "border-amber-500 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-50/50 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      或拖曳圖片至此
                    </div>
                  )}
                  {selectedId === "" && (
                    <p className="text-xs text-amber-600">請先於上方選擇建案</p>
                  )}
                  {(pendingUploads[key]?.length ?? 0) > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                      <p className="text-xs font-medium text-slate-600">待上傳（{pendingUploads[key].length} 張）</p>
                      <ul className="text-sm text-slate-700 space-y-1 max-h-24 overflow-auto">
                        {pendingUploads[key].map((file, i) => (
                          <li key={i} className="flex items-center justify-between gap-2">
                            <span className="truncate">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => {
                                const next = pendingUploads[key].filter((_, j) => j !== i);
                                setPendingUploads((prev) => ({ ...prev, [key]: next }));
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => doProjectUpload(key, pendingUploads[key])}
                        className="mt-2"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        上傳
                      </Button>
                    </div>
                  )}
                </div>
                {isUploading && <p className="text-sm text-slate-500">上傳中…</p>}

                {selectedId !== "" && (
                  <div className="space-y-2">
                    <Label>已上傳圖片（可刪除、調整順序）</Label>
                    {list.length === 0 ? (
                      <p className="text-sm text-slate-400">尚無圖片</p>
                    ) : (
                      <ul className="flex flex-wrap gap-3">
                        {list.map((url, idx) => (
                          <li
                            key={url}
                            className="relative group border rounded-lg overflow-hidden bg-slate-100 w-24 h-24 flex items-center justify-center"
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => handleMove(key, list, idx, -1)}
                                disabled={idx === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={() => handleMove(key, list, idx, 1)}
                                disabled={idx === list.length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() => handleDelete(key, url)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* 影片管理 */}
      <div className="border rounded-lg bg-white p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-800">建案影片（YouTube）</h2>
          {selectedId === "" && <span className="text-xs text-amber-600">請先於上方選擇建案</span>}
        </div>

        {selectedId !== "" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>影片標題（必填，未填寫時自動帶入 YouTube 影片標題）</Label>
                <input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="選填，未填寫時自動帶入 YouTube 影片標題"
                />
              </div>
              <div className="space-y-1">
                <Label>YouTube 影片 ID 或連結</Label>
                <div className="flex gap-2">
                  <input
                    value={videoInput}
                    onChange={(e) => {
                      setVideoInput(e.target.value);
                      setVideoConfirmedId(null);
                      setVideoConfirmError("");
                      setVideoConfirmMessage("");
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="例如：DR1_B50bhGY 或 https://youtu.be/DR1_B50bhGY"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={confirmingVideo || !videoInput.trim()}
                    onClick={async () => {
                      setVideoConfirmError("");
                      setVideoConfirmMessage("");
                      setVideoConfirmedId(null);
                      if (selectedId === "" || typeof selectedId !== "number") {
                        setVideoConfirmError("請先選擇建案");
                        return;
                      }
                      const id = extractYouTubeId(videoInput.trim());
                      if (!id) {
                        setVideoConfirmError("連結/ID 格式不正確，請確認是否為 YouTube 影片連結或影片 ID");
                        return;
                      }
                      const exists = videos.some((v) => {
                        const vid = v.youtubeId || extractYouTubeId(v.url || "");
                        return vid === id;
                      });
                      if (exists) {
                        setVideoConfirmError("此影片已存在於該建案，請勿重複新增");
                        return;
                      }

                      setConfirmingVideo(true);
                      try {
                        const thumb = getYouTubeThumbUrl(id);
                        await new Promise<void>((resolve, reject) => {
                          const img = new Image();
                          const t = window.setTimeout(() => reject(new Error("timeout")), 6000);
                          img.onload = () => {
                            window.clearTimeout(t);
                            resolve();
                          };
                          img.onerror = () => {
                            window.clearTimeout(t);
                            reject(new Error("load failed"));
                          };
                          img.src = thumb;
                        });
                        setVideoConfirmedId(id);
                        // 標題：有填用填的，沒填則用 YouTube 影片標題
                        const titleToUse = videoTitle.trim() || (await fetchYouTubeTitle(id));
                        setVideoConfirmMessage("已確認，正在加入…");
                        await apiAddProjectVideo(selectedId, {
                          title: titleToUse,
                          youtubeIdOrUrl: videoInput.trim(),
                          desc: videoDesc.trim() || undefined,
                        });
                        setMessage("已加入影片");
                        await loadVideos(selectedId);
                        setVideoTitle("");
                        setVideoInput("");
                        setVideoDesc("");
                        setVideoConfirmedId(null);
                        setVideoConfirmMessage("");
                      } catch (e) {
                        setVideoConfirmError(e instanceof Error ? e.message : "確認或加入失敗");
                        setVideoConfirmMessage("");
                      } finally {
                        setConfirmingVideo(false);
                      }
                    }}
                  >
                    {confirmingVideo ? "確認中…" : "確認"}
                  </Button>
                </div>
                {videoConfirmMessage && <p className="text-xs text-green-600">{videoConfirmMessage}</p>}
                {videoConfirmError && <p className="text-xs text-red-600">{videoConfirmError}</p>}
                <p className="text-xs text-slate-500">點擊「確認」後會自動加入下方「已加入影片」列表。</p>
                {videoConfirmedId && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={getYouTubeThumbUrl(videoConfirmedId)}
                      alt=""
                      className="w-20 h-12 rounded object-cover bg-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600">已確認影片</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{videoConfirmedId}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label>補充說明（可選）</Label>
                <input
                  value={videoDesc}
                  onChange={(e) => setVideoDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="例如：3 分鐘看懂基地與公設"
                />
              </div>
            </div>
            <div>
              <Button
                type="button"
                onClick={addVideo}
                disabled={!videoInput.trim() || !videoConfirmedId || confirmingVideo}
              >
                新增影片
              </Button>
            </div>

            <div className="space-y-2">
              <Label>已加入影片</Label>
              {videos.length === 0 ? (
                <p className="text-sm text-slate-400">尚無影片</p>
              ) : (
                <ul className="space-y-2">
                  {videos.map((v, idx) => (
                    <li key={v.id} className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{v.title}</p>
                        <p className="text-xs text-slate-500 truncate">{v.youtubeId || v.url || ""}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveVideo(idx, -1)} disabled={idx === 0}>
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="secondary" className="h-8 w-8" onClick={() => moveVideo(idx, 1)} disabled={idx === videos.length - 1}>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteVideo(v.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
