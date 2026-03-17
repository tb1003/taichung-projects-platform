/**
 * 建案列表：從 API 取得、連結新增/編輯、刪除；支援建案名稱搜尋與 ID/建設公司/行政區 排序
 */
import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { normalizeForSearch } from "@/lib/utils";
import { apiGet, apiDelete } from "./api";

type SortKey = "id" | "建設公司" | "行政區";

interface ProjectsData {
  projects: { id: number; 建案名稱: string; 建設公司?: string; 行政區?: string }[];
}

export default function ProjectsList() {
  const [data, setData] = useState<ProjectsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const load = () => {
    setLoading(true);
    apiGet<ProjectsData>("/api/admin/projects")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`確定要刪除「${name}」？`)) return;
    apiDelete(`/api/admin/projects/${id}`)
      .then(load)
      .catch((e) => setError(e.message));
  };

  const filteredAndSorted = useMemo(() => {
    if (!data?.projects) return [];
    const q = searchQuery.trim();
    let list = q
      ? data.projects.filter((p) => normalizeForSearch(p.建案名稱 || "").includes(normalizeForSearch(q)))
      : [...data.projects];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "id") cmp = a.id - b.id;
      else if (sortBy === "建設公司") cmp = (a.建設公司 || "").localeCompare(b.建設公司 || "", "zh-TW");
      else if (sortBy === "行政區") cmp = (a.行政區 || "").localeCompare(b.行政區 || "", "zh-TW");
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data?.projects, searchQuery, sortBy, sortOrder]);

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

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">建案管理</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="依建案名稱搜尋"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 min-w-[10rem]"
          />
          <Link href="/admin/projects/new">
            <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
              <Plus className="w-4 h-4" />
              新增建案
            </a>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
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
                <td className="p-3 text-slate-600">{p.id}</td>
                <td className="p-3 font-medium text-slate-800">{p.建案名稱}</td>
                <td className="p-3 text-slate-600">{p.建設公司 || "—"}</td>
                <td className="p-3 text-slate-600">{p.行政區 || "—"}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/projects/edit/${p.id}`}>
                    <a className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700">
                      <Pencil className="w-4 h-4" />
                    </a>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id, p.建案名稱)}
                    className="p-1.5 rounded text-slate-500 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
