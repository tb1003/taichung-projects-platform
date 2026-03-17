/**
 * 建設公司列表：支援依名稱、集團、核心標語搜尋
 */
import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { normalizeForSearch } from "@/lib/utils";
import { apiGet, apiDelete } from "./api";

interface Builder {
  builder_name: string;
  logo_url?: string | null;
  parent_group: string | null;
  core_slogan: string;
}

export default function BuildersList() {
  const [list, setList] = useState<Builder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const load = () => {
    setLoading(true);
    apiGet<Builder[]>("/api/admin/builders")
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = (name: string) => {
    if (!confirm(`確定要刪除「${name}」？`)) return;
    apiDelete(`/api/admin/builders/${encodeURIComponent(name)}`)
      .then(load)
      .catch((e) => setError(e.message));
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return list;
    const nq = normalizeForSearch(q);
    return list.filter(
      (b) =>
        normalizeForSearch(b.builder_name || "").includes(nq) ||
        normalizeForSearch(b.parent_group || "").includes(nq) ||
        normalizeForSearch(b.core_slogan || "").includes(nq)
    );
  }, [list, searchQuery]);

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">建設公司管理</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="依名稱、集團或核心標語搜尋"
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 min-w-[10rem]"
          />
          <Link href="/admin/builders/new">
            <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
              <Plus className="w-4 h-4" />
              新增建設公司
            </a>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-3 font-semibold text-slate-700">名稱</th>
              <th className="text-left p-3 font-semibold text-slate-700">集團</th>
              <th className="text-left p-3 font-semibold text-slate-700">核心標語（摘要）</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody>
            {filteredList.map((b) => (
              <tr key={b.builder_name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    {b.logo_url?.trim() ? (
                      <img
                        src={b.logo_url}
                        alt=""
                        className="w-8 h-8 rounded object-contain bg-slate-50 border border-slate-100 shrink-0"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : null}
                    <span>{b.builder_name}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-600">{b.parent_group || "—"}</td>
                <td className="p-3 text-slate-600 max-w-xs truncate">{b.core_slogan?.slice(0, 50)}…</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/builders/edit/${encodeURIComponent(b.builder_name)}`}>
                    <a className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700">
                      <Pencil className="w-4 h-4" />
                    </a>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.builder_name)}
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
        共 {filteredList.length} 筆
        {searchQuery.trim() && list.length !== filteredList.length && `（篩選自 ${list.length} 筆）`}
      </p>
    </div>
  );
}
