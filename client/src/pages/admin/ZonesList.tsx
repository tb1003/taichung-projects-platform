/**
 * 重劃區列表
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { apiGet, apiDelete } from "./api";

interface Zone {
  zone_name: string;
  development_type: string;
  core_features: string;
}

export default function ZonesList() {
  const [list, setList] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    apiGet<Zone[]>("/api/admin/zones")
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = (zoneName: string) => {
    if (!confirm(`確定要刪除「${zoneName}」？`)) return;
    apiDelete(`/api/admin/zones/${encodeURIComponent(zoneName)}`)
      .then(load)
      .catch((e) => setError(e.message));
  };

  if (loading) return <p className="text-slate-500">載入中…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">重劃區管理</h1>
        <Link href="/admin/zones/new">
          <a className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
            <Plus className="w-4 h-4" />
            新增重劃區
          </a>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left p-3 font-semibold text-slate-700">名稱</th>
              <th className="text-left p-3 font-semibold text-slate-700">開發類型</th>
              <th className="text-left p-3 font-semibold text-slate-700">核心特色（摘要）</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((z) => (
              <tr key={z.zone_name} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{z.zone_name}</td>
                <td className="p-3 text-slate-600">{z.development_type}</td>
                <td className="p-3 text-slate-600 max-w-xs truncate">{z.core_features?.slice(0, 60)}…</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/admin/zones/edit/${encodeURIComponent(z.zone_name)}`}>
                    <a className="p-1.5 rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700">
                      <Pencil className="w-4 h-4" />
                    </a>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(z.zone_name)}
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
      <p className="p-3 text-xs text-slate-400">共 {list.length} 筆</p>
    </div>
  );
}
