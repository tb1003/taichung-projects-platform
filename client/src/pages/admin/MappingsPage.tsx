/**
 * 名稱對應表：重劃區對應、建設公司對應，整份 JSON 編輯後儲存
 */
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "./api";

export default function MappingsPage() {
  const [zoneMap, setZoneMap] = useState<Record<string, string>>({});
  const [builderMap, setBuilderMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<Record<string, string>>("/api/admin/zone-name-map"),
      apiGet<Record<string, string>>("/api/admin/builder-name-map"),
    ])
      .then(([z, b]) => {
        setZoneMap(z);
        setBuilderMap(b);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const saveZoneMap = () => {
    setError("");
    setSaving("zone");
    apiPut("/api/admin/zone-name-map", zoneMap)
      .then(() => setSaving(null))
      .catch((e) => {
        setError(e.message);
        setSaving(null);
      });
  };

  const saveBuilderMap = () => {
    setError("");
    setSaving("builder");
    apiPut("/api/admin/builder-name-map", builderMap)
      .then(() => setSaving(null))
      .catch((e) => {
        setError(e.message);
        setSaving(null);
      });
  };

  const setZoneMapFromJson = (raw: string) => {
    try {
      const o = JSON.parse(raw) as Record<string, string>;
      setZoneMap(o);
    } catch {
      setError("重劃區對應 JSON 格式錯誤");
    }
  };

  const setBuilderMapFromJson = (raw: string) => {
    try {
      const o = JSON.parse(raw) as Record<string, string>;
      setBuilderMap(o);
    } catch {
      setError("建設公司對應 JSON 格式錯誤");
    }
  };

  if (loading) return <p className="text-slate-500">載入中…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">名稱對應表</h1>
      <p className="text-sm text-slate-600">
        建案資料中的「重劃區／建設公司」文字若與 zones.json、builders.json 的標準名稱不同，需在此設定對應，前台才會正確連結。
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-2">重劃區對應（zone_name_map.json）</h2>
        <p className="text-xs text-slate-500 mb-2">鍵：建案中的名稱 → 值：zones.json 的 zone_name</p>
        <textarea
          value={JSON.stringify(zoneMap, null, 2)}
          onChange={(e) => setZoneMapFromJson(e.target.value)}
          className="w-full h-48 px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono text-sm"
        />
        <button
          type="button"
          onClick={saveZoneMap}
          disabled={saving === "zone"}
          className="mt-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {saving === "zone" ? "儲存中…" : "儲存重劃區對應"}
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-2">建設公司對應（builderNameMap.json）</h2>
        <p className="text-xs text-slate-500 mb-2">鍵：建案中的名稱／別名 → 值：builders.json 的 builder_name</p>
        <textarea
          value={JSON.stringify(builderMap, null, 2)}
          onChange={(e) => setBuilderMapFromJson(e.target.value)}
          className="w-full h-48 px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono text-sm"
        />
        <button
          type="button"
          onClick={saveBuilderMap}
          disabled={saving === "builder"}
          className="mt-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {saving === "builder" ? "儲存中…" : "儲存建設公司對應"}
        </button>
      </div>
    </div>
  );
}
