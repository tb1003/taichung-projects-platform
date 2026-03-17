/**
 * 重劃區新增/編輯
 */
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { apiGet, apiPost, apiPut } from "./api";

const defaultZone = {
  zone_name: "",
  development_type: "",
  core_features: "",
  in_depth_analysis: "",
  key_facilities: "",
};

export default function ZoneForm() {
  const [, params] = useRoute("/admin/zones/edit/:zoneName");
  const zoneNameParam = params?.zoneName ? decodeURIComponent(params.zoneName) : null;
  const isNew = !zoneNameParam;

  const [form, setForm] = useState(defaultZone);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!zoneNameParam) return;
    apiGet<typeof defaultZone>(`/api/admin/zones/${encodeURIComponent(zoneNameParam)}`)
      .then(setForm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [zoneNameParam]);

  const update = (key: keyof typeof defaultZone, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isNew) {
        await apiPost("/api/admin/zones", form);
        window.location.href = "/admin/zones";
      } else {
        await apiPut(`/api/admin/zones/${encodeURIComponent(zoneNameParam!)}`, form);
        window.location.href = "/admin/zones";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/zones">
          <a className="text-slate-500 hover:text-slate-700 text-sm">← 重劃區列表</a>
        </Link>
        <span className="text-slate-400">/</span>
        <h1 className="text-xl font-bold text-slate-800">{isNew ? "新增重劃區" : "編輯重劃區"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">重劃區名稱 *</label>
          <input
            type="text"
            value={form.zone_name}
            onChange={(e) => update("zone_name", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            required
            disabled={!isNew}
            placeholder="例：第十四期(美和庄重劃區)"
          />
          {!isNew && <p className="text-xs text-slate-400 mt-1">編輯時不可改名稱</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">開發類型</label>
          <input
            type="text"
            value={form.development_type}
            onChange={(e) => update("development_type", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="公辦、自辦、區段徵收、民間俗稱特區"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">核心特色（多行）</label>
          <textarea
            value={form.core_features}
            onChange={(e) => update("core_features", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">深度分析（多行）</label>
          <textarea
            value={form.in_depth_analysis}
            onChange={(e) => update("in_depth_analysis", e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">關鍵設施（多行，格式：類別：項目1、項目2）</label>
          <textarea
            value={form.key_facilities}
            onChange={(e) => update("key_facilities", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
          <Link href="/admin/zones">
            <a className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</a>
          </Link>
        </div>
      </form>
    </div>
  );
}
