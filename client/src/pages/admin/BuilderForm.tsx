/**
 * 建設公司新增/編輯
 */
import { useEffect, useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { apiGet, apiPost, apiPut, apiUploadBuilderLogo } from "./api";

const defaultBuilder = {
  builder_name: "",
  logo_url: null as string | null,
  parent_group: null as string | null,
  core_slogan: "",
  in_depth_analysis: "",
  construction_partner: "",
  after_sales_service: "",
  classic_style: "",
};

export default function BuilderForm() {
  const [, params] = useRoute("/admin/builders/edit/:name");
  const nameParam = params?.name ? decodeURIComponent(params.name) : null;
  const isNew = !nameParam;

  const [form, setForm] = useState(defaultBuilder);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!nameParam) return;
    apiGet<typeof defaultBuilder>(`/api/admin/builders/${encodeURIComponent(nameParam)}`)
      .then(setForm)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [nameParam]);

  const update = (key: keyof typeof defaultBuilder, value: string | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const builderNameForLogo = isNew ? form.builder_name.trim() : (nameParam ?? "");
  const canUploadLogo = builderNameForLogo.length > 0;

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !canUploadLogo) return;
    if (!file.type.startsWith("image/")) {
      setError("請選擇圖片檔案（PNG、JPG、GIF、WebP）");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const { url } = await apiUploadBuilderLogo(builderNameForLogo, file);
      update("logo_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo 上傳失敗");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    update("logo_url", null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isNew) {
        await apiPost("/api/admin/builders", form);
        window.location.href = "/admin/builders";
      } else {
        await apiPut(`/api/admin/builders/${encodeURIComponent(nameParam!)}`, form);
        window.location.href = "/admin/builders";
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
        <Link href="/admin/builders">
          <a className="text-slate-500 hover:text-slate-700 text-sm">← 建設公司列表</a>
        </Link>
        <span className="text-slate-400">/</span>
        <h1 className="text-xl font-bold text-slate-800">{isNew ? "新增建設公司" : "編輯建設公司"}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">建設公司名稱 *</label>
          <div className="flex items-center gap-3">
            {form.logo_url?.trim() ? (
              <img
                src={form.logo_url}
                alt=""
                className="w-10 h-10 rounded object-contain bg-slate-50 border border-slate-200 shrink-0"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : null}
            <input
              type="text"
              value={form.builder_name}
              onChange={(e) => update("builder_name", e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              required
              disabled={!isNew}
            />
          </div>
          {!isNew && <p className="text-xs text-slate-400 mt-1">編輯時不可改名稱</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">建設公司 Logo（選填）</label>
          {form.logo_url?.trim() ? (
            <div className="flex items-center gap-3">
              <img
                src={form.logo_url}
                alt=""
                className="w-14 h-14 rounded object-contain bg-slate-50 border border-slate-200"
                onError={(el) => { el.currentTarget.style.display = "none"; }}
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-sm text-slate-500 hover:text-red-600"
              >
                移除 Logo
              </button>
            </div>
          ) : null}
          <div className="mt-2 flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleLogoFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canUploadLogo || uploading}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "上傳中…" : "上傳圖片"}
            </button>
            {isNew && !form.builder_name.trim() && (
              <span className="text-xs text-slate-400">請先填寫建設公司名稱</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">所屬集團</label>
          <input
            type="text"
            value={form.parent_group || ""}
            onChange={(e) => update("parent_group", e.target.value || null)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">核心標語</label>
          <textarea
            value={form.core_slogan}
            onChange={(e) => update("core_slogan", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">深度分析</label>
          <textarea
            value={form.in_depth_analysis}
            onChange={(e) => update("in_depth_analysis", e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">營造夥伴</label>
          <input
            type="text"
            value={form.construction_partner}
            onChange={(e) => update("construction_partner", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">售後服務</label>
          <input
            type="text"
            value={form.after_sales_service}
            onChange={(e) => update("after_sales_service", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">經典風格</label>
          <input
            type="text"
            value={form.classic_style}
            onChange={(e) => update("classic_style", e.target.value)}
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
          <Link href="/admin/builders">
            <a className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">取消</a>
          </Link>
        </div>
      </form>
    </div>
  );
}
