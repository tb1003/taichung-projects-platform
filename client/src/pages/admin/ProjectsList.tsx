/**
 * 建案列表：從 API 取得、連結新增/編輯、刪除；支援建案名稱搜尋與 ID/建設公司/行政區 排序
 */
import { useEffect, useState, useMemo, type ComponentType } from "react";
import { Link } from "wouter";
import {
  Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Trash,
  Sparkles, MapPin, Map, Building2, Landmark, Layers, FileText, Home, Hash, Ruler, Users,
  BedDouble, CalendarDays, GraduationCap, Sofa, Bus, Trees, ShoppingBag, ScrollText,
} from "lucide-react";
import { normalizeForSearch } from "@/lib/utils";
import { getDataCompleteness, isDataIncomplete, type Project } from "@/lib/types";
import { apiGet, apiDelete, apiSetProjectPublished, apiBatchSetProjectPublished, apiRestoreProject, apiHardDeleteProject, apiEmptyTrash } from "./api";

type SortKey = "id" | "建設公司" | "行政區";
type MissingKey =
  | "slogans"
  | "district"
  | "zone"
  | "group"
  | "structure"
  | "usageZone"
  | "mainUsage"
  | "floors"
  | "lot"
  | "baseArea"
  | "totalUnits"
  | "roomTypes"
  | "completion"
  | "school"
  | "amenity"
  | "traffic"
  | "green"
  | "business"
  | "licenses";

interface ProjectsData {
  projects: Project[];
}

const MISSING_DEFS: Array<{
  key: MissingKey;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  isMissing: (p: Project) => boolean;
}> = [
  {
    key: "slogans",
    label: "五大優勢標語",
    Icon: Sparkles,
    isMissing: (p) => {
      const s = (p.slogans || {}) as unknown as Record<string, unknown>;
      const keys = ["地段價值", "品牌建築", "生活環境", "生活機能", "產品特色"];
      return keys.some((k) => !String(s[k] ?? "").trim());
    },
  },
  { key: "district", label: "行政區", Icon: MapPin, isMissing: (p) => !String(p.行政區 ?? "").trim() },
  { key: "zone", label: "重劃區", Icon: Map, isMissing: (p) => !String(p.重劃區 ?? "").trim() },
  { key: "group", label: "建設集團", Icon: Building2, isMissing: (p) => !String((p as unknown as Record<string, unknown>).construction_group ?? "").trim() },
  { key: "structure", label: "建築結構", Icon: Landmark, isMissing: (p) => !String(p.建築結構 ?? "").trim() },
  { key: "usageZone", label: "使用分區", Icon: FileText, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["使用分區"] ?? "").trim() },
  { key: "mainUsage", label: "主要用途", Icon: Home, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["主要用途"] ?? "").trim() },
  {
    key: "floors",
    label: "樓層",
    Icon: Layers,
    isMissing: (p) => !String(p.floors?.description ?? "").trim() && !(Array.isArray(p.floors?.ground) && p.floors.ground.length > 0),
  },
  { key: "lot", label: "坐落地號", Icon: Hash, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["坐落地號"] ?? "").trim() },
  { key: "baseArea", label: "基地面積", Icon: Ruler, isMissing: (p) => Number((p as unknown as Record<string, unknown>)["基地面積坪"] ?? 0) <= 0 },
  { key: "totalUnits", label: "總戶數", Icon: Users, isMissing: (p) => Number(p.units?.total ?? 0) <= 0 },
  {
    key: "roomTypes",
    label: "房型規劃",
    Icon: BedDouble,
    isMissing: (p) =>
      !((Array.isArray(p.房型規劃) && p.房型規劃.length > 0) || (Array.isArray((p as unknown as Record<string, unknown>).room_types_standard) && ((p as unknown as Record<string, unknown>).room_types_standard as unknown[]).length > 0)),
  },
  { key: "completion", label: "完工日", Icon: CalendarDays, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["完工日期"] ?? "").trim() },
  { key: "school", label: "學區", Icon: GraduationCap, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["學區"] ?? "").trim() },
  { key: "amenity", label: "公設配置", Icon: Sofa, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["公設配置"] ?? "").trim() },
  { key: "traffic", label: "交通", Icon: Bus, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["交通"] ?? "").trim() },
  { key: "green", label: "綠地", Icon: Trees, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["綠地"] ?? "").trim() },
  { key: "business", label: "商圈", Icon: ShoppingBag, isMissing: (p) => !String((p as unknown as Record<string, unknown>)["商圈"] ?? "").trim() },
  {
    key: "licenses",
    label: "建築執照/使用執照",
    Icon: ScrollText,
    isMissing: (p) => {
      const raw = (p as unknown as Record<string, unknown>)["建管執照"];
      if (!Array.isArray(raw) || raw.length === 0) return true;
      const types = raw.map((x) => String((x as Record<string, unknown>)["執照類別"] ?? ""));
      const hasBuild = types.some((t) => /建築執照|建造執照/.test(t));
      const hasUse = types.some((t) => /使用執照/.test(t));
      return !(hasBuild && hasUse);
    },
  },
];

export default function ProjectsList() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [view, setView] = useState<"active" | "trash">("active");
  const [missingFilter, setMissingFilter] = useState<"all" | MissingKey>("all");

  const load = () => {
    setLoading(true);
    apiGet<ProjectsData>("/api/admin/projects")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`確定要刪除「${name}」？（會移入回收桶，可還原）`)) return;
    apiDelete(`/api/admin/projects/${id}`)
      .then(load)
      .catch((e) => setError(e.message));
  };

  const handleRestore = async (id: number, name: string) => {
    if (!confirm(`確定要還原「${name}」？`)) return;
    setError("");
    try {
      await apiRestoreProject(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "還原失敗");
    }
  };

  const handleHardDelete = async (id: number, name: string) => {
    if (!confirm(`確定要永久刪除「${name}」？此動作不可復原。`)) return;
    setError("");
    try {
      await apiHardDeleteProject(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "永久刪除失敗");
    }
  };

  const handleEmptyTrash = async () => {
    const trashCount = (data?.projects || []).filter((p) => p.isDeleted === true).length;
    if (trashCount === 0) return;
    if (!confirm(`確定要清空回收桶？共 ${trashCount} 筆將永久刪除，且不可復原。`)) return;
    setError("");
    setBulkBusy(true);
    try {
      await apiEmptyTrash();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "清空回收桶失敗");
    } finally {
      setBulkBusy(false);
    }
  };

  const setPublished = async (id: number, isPublished: boolean) => {
    setError("");
    try {
      await apiSetProjectPublished(id, isPublished);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: prev.projects.map((p) => (p.id === id ? { ...p, isPublished } : p)),
        };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "更新失敗");
    }
  };

  const filteredAndSorted = useMemo(() => {
    if (!data?.projects) return [];
    const q = searchQuery.trim();
    const base = data.projects.filter((p) => (view === "trash" ? p.isDeleted === true : p.isDeleted !== true));
    let list = q
      ? base.filter((p) => normalizeForSearch(p.建案名稱 || "").includes(normalizeForSearch(q)))
      : [...base];
    if (missingFilter !== "all") {
      const def = MISSING_DEFS.find((d) => d.key === missingFilter);
      if (def) list = list.filter((p) => def.isMissing(p));
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "id") cmp = a.id - b.id;
      else if (sortBy === "建設公司") cmp = (a.建設公司 || "").localeCompare(b.建設公司 || "", "zh-TW");
      else if (sortBy === "行政區") cmp = (a.行政區 || "").localeCompare(b.行政區 || "", "zh-TW");
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data?.projects, searchQuery, sortBy, sortOrder, view, missingFilter]);

  const filteredIds = useMemo(() => filteredAndSorted.map((p) => p.id), [filteredAndSorted]);
  const selectedCount = selectedIds.size;
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id));

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) filteredIds.forEach((id) => next.add(id));
      else filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const bulkSet = async (ids: number[], isPublished: boolean, confirmText: string) => {
    if (!ids.length) return;
    if (!confirm(confirmText)) return;
    setError("");
    setBulkBusy(true);
    try {
      await apiBatchSetProjectPublished(ids, isPublished);
      setData((prev) => {
        if (!prev) return prev;
        const idSet = new Set(ids);
        return {
          ...prev,
          projects: prev.projects.map((p) => (idSet.has(p.id) ? { ...p, isPublished } : p)),
        };
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "批次更新失敗");
    } finally {
      setBulkBusy(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortBy !== column) return <ArrowUpDown className="w-3.5 h-3.5 inline ml-0.5 opacity-50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 inline ml-0.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline ml-0.5" />
    );
  };

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return null;

  const trashCount = data.projects.filter((p) => p.isDeleted === true).length;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800">建案管理</h1>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => { setView("active"); setSelectedIds(new Set()); }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${view === "active" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
              title="建案列表"
            >
              列表
            </button>
            <button
              type="button"
              onClick={() => { setView("trash"); setSelectedIds(new Set()); }}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md ${view === "trash" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"}`}
              title="回收桶"
            >
              回收桶（{trashCount}）
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="依建案名稱搜尋"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 min-w-[10rem]"
          />
          <select
            value={missingFilter}
            onChange={(e) => setMissingFilter(e.target.value as "all" | MissingKey)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white min-w-[12rem]"
            title="篩選缺漏項目"
          >
            <option value="all">缺漏篩選：全部</option>
            {MISSING_DEFS.map((d) => (
              <option key={d.key} value={d.key}>缺 {d.label}</option>
            ))}
          </select>
          {view === "active" ? (
            <>
              <button
                type="button"
                disabled={bulkBusy || filteredIds.length === 0}
                onClick={() => bulkSet(filteredIds, true, `確定要把「目前搜尋結果」共 ${filteredIds.length} 筆設為前台顯示？`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                title="方案 B：對目前搜尋結果套用"
              >
                目前結果全顯示
              </button>
              <button
                type="button"
                disabled={bulkBusy || filteredIds.length === 0}
                onClick={() => bulkSet(filteredIds, false, `確定要把「目前搜尋結果」共 ${filteredIds.length} 筆設為前台隱藏？`)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                title="方案 B：對目前搜尋結果套用"
              >
                目前結果全隱藏
              </button>
              <Link href="/admin/projects/new">
                <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
                  <Plus className="w-4 h-4" />
                  新增建案
                </a>
              </Link>
            </>
          ) : (
            <button
              type="button"
              disabled={bulkBusy || trashCount === 0}
              onClick={handleEmptyTrash}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              title="手動清空回收桶（永久刪除）"
            >
              <Trash className="w-4 h-4" />
              清空回收桶
            </button>
          )}
        </div>
      </div>
      {view === "active" && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <div className="text-xs text-slate-600">
            批次操作（方案 A 勾選）：已選 <span className="font-semibold">{selectedCount}</span> 筆
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={bulkBusy || selectedCount === 0}
              onClick={() => bulkSet(Array.from(selectedIds), true, `確定要把已勾選 ${selectedCount} 筆設為前台顯示？`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              批次顯示
            </button>
            <button
              type="button"
              disabled={bulkBusy || selectedCount === 0}
              onClick={() => bulkSet(Array.from(selectedIds), false, `確定要把已勾選 ${selectedCount} 筆設為前台隱藏？`)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              批次隱藏
            </button>
            <button
              type="button"
              disabled={bulkBusy || selectedCount === 0}
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-white disabled:opacity-50"
            >
              清空勾選
            </button>
          </div>
        </div>
      )}
      <div className="px-4 py-2 border-b border-slate-200 bg-white">
        <div className="text-[11px] text-slate-500 mb-1">缺漏圖示（19項）</div>
        <div className="flex flex-wrap gap-1.5">
          {MISSING_DEFS.map(({ key, label, Icon }) => (
            <span key={key} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600" title={`待補充事項：${label}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-3 font-semibold text-slate-700 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={(e) => toggleSelectAllFiltered(e.target.checked)}
                  aria-label="全選目前搜尋結果"
                />
              </th>
              <th className="text-left p-3 font-semibold text-slate-700">
                <button type="button" onClick={() => toggleSort("id")} className="inline-flex items-center hover:text-slate-900">
                  ID <SortIcon column="id" />
                </button>
              </th>
              <th className="text-left p-3 font-semibold text-slate-700">建案名稱</th>
              <th className="text-left p-3 font-semibold text-slate-700">
                <button type="button" onClick={() => toggleSort("建設公司")} className="inline-flex items-center hover:text-slate-900">
                  建設公司 <SortIcon column="建設公司" />
                </button>
              </th>
              <th className="text-left p-3 font-semibold text-slate-700">
                <button type="button" onClick={() => toggleSort("行政區")} className="inline-flex items-center hover:text-slate-900">
                  行政區 <SortIcon column="行政區" />
                </button>
              </th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={(e) => toggleSelect(p.id, e.target.checked)}
                    aria-label={`勾選建案 ${p.id}`}
                  />
                </td>
                <td className="p-3 text-slate-600">{p.id}</td>
                <td className="p-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{p.建案名稱}</span>
                    {(() => {
                      const completeness = getDataCompleteness(p);
                      const incomplete = isDataIncomplete(p);
                      const color =
                        completeness >= 75 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        completeness >= 50 ? "bg-amber-100 text-amber-800 border-amber-200" :
                        "bg-red-100 text-red-800 border-red-200";
                      const label = `${completeness}%`;
                      return (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${color}`}
                          title={incomplete ? "核心欄位缺漏較多（>=8）" : "資料完整度（依核心欄位計算）"}
                        >
                          完整度 {label}
                          {incomplete && <span className="ml-1 font-bold">!</span>}
                        </span>
                      );
                    })()}
                  </div>
                  {(() => {
                    const missing = MISSING_DEFS.filter((d) => d.isMissing(p));
                    if (missing.length === 0) return null;
                    return (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {missing.map(({ key, label, Icon }) => (
                          <span
                            key={key}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-amber-200 bg-amber-50 text-amber-700"
                            title={`待補充事項：${label}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </td>
                <td className="p-3 text-slate-600">{p.建設公司 || "—"}</td>
                <td className="p-3 text-slate-600">{p.行政區 || "—"}</td>
                <td className="p-3 flex gap-2">
                  {view === "active" ? (
                    <>
                      <Link href={`/admin/projects/edit/${p.id}`}>
                        <a className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700" title="修改">
                          <Pencil className="w-4 h-4" />
                        </a>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setPublished(p.id, !(p.isPublished !== false))}
                        className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        title="前台顯示"
                      >
                        {p.isPublished !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.建案名稱)}
                        className="p-1.5 rounded text-slate-500 hover:bg-red-100 hover:text-red-600"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRestore(p.id, p.建案名稱)}
                        className="p-1.5 rounded text-slate-500 hover:bg-emerald-100 hover:text-emerald-700"
                        title="還原"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHardDelete(p.id, p.建案名稱)}
                        className="p-1.5 rounded text-slate-500 hover:bg-red-100 hover:text-red-600"
                        title="永久刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="p-3 text-xs text-slate-400">
        共 {filteredAndSorted.length} 筆
        {searchQuery.trim() && data.projects.length !== filteredAndSorted.length && `（篩選自 ${data.projects.length} 筆）`}
      </p>
    </div>
  );
}
