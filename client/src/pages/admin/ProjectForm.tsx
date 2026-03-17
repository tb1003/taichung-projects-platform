/**
 * 建案新增/編輯表單：核心欄位，其餘以 JSON 編輯或後續擴充
 */
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { apiGet, apiPost, apiPut } from "./api";
import { stringsToHalfWidth } from "@/lib/utils";

const defaultProject = {
  建案名稱: "",
  建設公司: "",
  行政區: "",
  重劃區: "",
  建案位置: "",
  坐落地號: "",
  基地面積坪: 0,
  建築結構: "",
  floors: { ground: [], basement: 0, description: "" },
  樓層高度米: 0,
  units: { total: 0, residential: 0, commercial: 0, others: 0, description: "" },
  戶梯配置: "",
  房型規劃: [] as string[],
  parking: { total: 0, planar: 0, mechanical: 0, description: "" },
  完工日期: "",
  公設配置: "",
  交通: "",
  學區: "",
  商圈: "",
  綠地: "",
  連結: "",
  備註: "",
  tags: [] as string[],
  slogans: { 地段價值: "", 品牌建築: "", 生活環境: "", 生活機能: "", 產品特色: "" },
  description_500: "",
  construction_group: null as string | null,
  room_types_standard: [] as string[],
  elevator_ratio: null as number | null,
  elevator_grade: null as string | null,
  community_size: null as string | null,
};

export default function ProjectForm() {
  const [, params] = useRoute("/admin/projects/edit/:id");
  const id = params?.id ? parseInt(params.id, 10) : null;
  const isNew = !id;

  const [form, setForm] = useState<Record<string, unknown>>(defaultProject as unknown as Record<string, unknown>);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiGet<Record<string, unknown>>(`/api/admin/projects/${id}`)
      .then((p) => setForm({ ...defaultProject, ...p } as unknown as Record<string, unknown>))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const update = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sloganKeys = ["地段價值", "品牌建築", "生活環境", "生活機能", "產品特色"] as const;
  const slogans = (form.slogans as Record<string, string>) || {};
  const updateSlogan = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      slogans: { ...(prev.slogans as Record<string, string>), [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = stringsToHalfWidth(form) as Record<string, unknown>;
      if (isNew) {
        await apiPost(`/api/admin/projects`, payload);
        window.location.href = "/admin/projects";
      } else {
        await apiPut(`/api/admin/projects/${id}`, payload);
        window.location.href = "/admin/projects";
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
        <Link href="/admin/projects">
          <a className="text-slate-500 hover:text-slate-700 text-sm">← 建案列表</a>
        </Link>
        <span className="text-slate-400">/</span>
        <h1 className="text-xl font-bold text-slate-800">{isNew ? "新增建案" : "編輯建案"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">建案名稱 *</label>
          <input
            type="text"
            value={(form.建案名稱 as string) || ""}
            onChange={(e) => update("建案名稱", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">建設公司</label>
            <input
              type="text"
              value={(form.建設公司 as string) || ""}
              onChange={(e) => update("建設公司", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">行政區</label>
            <input
              type="text"
              value={(form.行政區 as string) || ""}
              onChange={(e) => update("行政區", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              placeholder="例：西屯區"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">重劃區</label>
          <input
            type="text"
            value={(form.重劃區 as string) || ""}
            onChange={(e) => update("重劃區", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="例：14期重劃區、非重劃區"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">建案位置</label>
          <input
            type="text"
            value={(form.建案位置 as string) || ""}
            onChange={(e) => update("建案位置", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">基地面積（坪）</label>
            <input
              type="number"
              value={(form.基地面積坪 as number) || ""}
              onChange={(e) => update("基地面積坪", e.target.value ? Number(e.target.value) : 0)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">建築結構</label>
            <input
              type="text"
              value={(form.建築結構 as string) || ""}
              onChange={(e) => update("建築結構", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              placeholder="RC、SC、SRC"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">樓層說明</label>
          <input
            type="text"
            value={((form.floors as { description?: string })?.description) || ""}
            onChange={(e) =>
              update("floors", {
                ...(form.floors as object),
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="例：地上15層、地下3層"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">總戶數</label>
          <input
            type="number"
            value={((form.units as { total?: number })?.total) ?? ""}
            onChange={(e) =>
              update("units", {
                ...(form.units as object),
                total: e.target.value ? Number(e.target.value) : 0,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">戶梯配置</label>
          <input
            type="text"
            value={(form.戶梯配置 as string) || ""}
            onChange={(e) => update("戶梯配置", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">房型規劃（逗號分隔）</label>
          <input
            type="text"
            value={Array.isArray(form.房型規劃) ? (form.房型規劃 as string[]).join("、") : ""}
            onChange={(e) => update("房型規劃", e.target.value ? e.target.value.split(/[、,]/).map((s) => s.trim()).filter(Boolean) : [])}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="3房、4房"
          />
        </div>
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">五大優勢標語</h2>
          {sloganKeys.map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{key}</label>
              <input
                type="text"
                value={slogans[key] ?? ""}
                onChange={(e) => updateSlogan(key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                placeholder={`例：${key}相關一句話`}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">一句摘要（建案總覽卡片顯示 1～2 行，約 500 字內）</label>
          <textarea
            rows={3}
            value={(form.description_500 as string) || ""}
            onChange={(e) => update("description_500", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="例：由上市建商投資興建，鄰近中央公園，規劃 2～3 房精品宅。"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">完工日期</label>
          <input
            type="text"
            value={(form.完工日期 as string) || ""}
            onChange={(e) => update("完工日期", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            placeholder="2024-06、工程中"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">公設配置</label>
          <input
            type="text"
            value={(form.公設配置 as string) || ""}
            onChange={(e) => update("公設配置", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">連結</label>
          <input
            type="url"
            value={(form.連結 as string) || ""}
            onChange={(e) => update("連結", e.target.value)}
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
          <Link href="/admin/projects">
            <a className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</a>
          </Link>
        </div>
      </form>
    </div>
  );
}
