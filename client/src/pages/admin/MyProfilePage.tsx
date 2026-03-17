/**
 * 業務我的資料與電子名片：編輯履歷、勾選名片顯示欄位、送出審核；關於我－電子名片預覽
 */
import { useEffect, useState } from "react";
import { Users, Phone } from "lucide-react";
import { apiGetMe, apiPutMe, type AgentSafe } from "./api";
import { toast } from "sonner";

// 欄位順序：註冊時會自動帶入姓名／公司／電話／LINE／信箱，其餘為選填
const RESUME_LABELS: Record<string, string> = {
  name: "姓名",
  company: "公司",
  phone: "電話",
  lineId: "LINE ID",
  email: "信箱",
  photoUrl: "大頭照網址",
  title: "職稱",
  regions: "負責區域（多個用逗號）",
  transactionCount: "成交經驗",
  specialties: "專長（多個用逗號）",
  license: "證照",
  intro: "簡短自介",
};

export default function MyProfilePage() {
  const [me, setMe] = useState<(AgentSafe & { projects?: Array<{ id: number; 建案名稱?: string }> }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState<Record<string, unknown>>({});
  const [visibleFields, setVisibleFields] = useState<string[]>([]);

  const load = async () => {
    try {
      const data = await apiGetMe();
      setMe(data);
      setResume(data.resume || {});
      setVisibleFields(data.eCardVisibleFields || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPutMe({ resume: resume as Record<string, unknown>, eCardVisibleFields: visibleFields });
      toast.success("已儲存");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    setSaving(true);
    try {
      await apiPutMe({ eCardStatus: "pending_review" });
      toast.success("已送出審核，請等候管理員通過後即可在建案頁顯示電子名片");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "送出失敗");
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = (field: string) => {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  if (loading || !me) return <p className="text-slate-500">載入中…</p>;

  const isIncomplete = me != null && (!(resume as Record<string, unknown>)?.name || (me.eCardStatus === "draft" && !Object.values(resume).some((v) => v != null && String(v).trim() !== "")));

  const isPending = (me as { status?: string })?.status === "pending";

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800 mb-4">我的資料與電子名片</h1>
      {isPending && (
        <div className="mb-4 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-sm">
          您尚未通過認證。請完成下方資料後送出審核，管理員通過後即可使用完整後台功能。
        </div>
      )}
      {isIncomplete && !isPending && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          請先完成電子名片，才能進行建案圖片上傳等操作。
        </div>
      )}
      <p className="text-sm text-slate-500 mb-4">
        電子名片預設等於履歷的對外精簡版，勾選「顯示在名片」的欄位會顯示在您負責的建案頁面。送出審核後由管理員通過才會對外顯示。
      </p>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h2 className="font-semibold text-slate-800">履歷（電子名片來源）</h2>
        <div className="grid gap-3">
          {Object.entries(RESUME_LABELS).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              {key === "regions" || key === "specialties" ? (
                <input
                  type="text"
                  value={Array.isArray(resume[key]) ? (resume[key] as string[]).join("、") : String(resume[key] || "")}
                  onChange={(e) => setResume((r) => ({ ...r, [key]: e.target.value.split(/[,、]/).map((s) => s.trim()).filter(Boolean) }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  placeholder={key === "regions" ? "例：西屯、14期" : "例：成屋、首購"}
                />
              ) : key === "intro" ? (
                <textarea
                  value={String(resume[key] || "")}
                  onChange={(e) => setResume((r) => ({ ...r, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 min-h-[80px]"
                  placeholder="簡短自介"
                />
              ) : (
                <input
                  type="text"
                  value={String(resume[key] || "")}
                  onChange={(e) => setResume((r) => ({ ...r, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              )}
              <label className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={visibleFields.includes(key)}
                  onChange={() => toggleVisible(key)}
                />
                顯示在電子名片
              </label>
            </div>
          ))}
        </div>

        {/* 關於我 － 電子名片預覽（與建案頁顯示一致） */}
        <div className="pt-6 border-t border-slate-200">
          <h2 className="font-semibold text-slate-800 mb-3">關於我 － 電子名片預覽</h2>
          <p className="text-xs text-slate-500 mb-3">以下為您在建案頁「聯絡此社區」區塊中會顯示的電子名片樣式，僅顯示您已勾選「顯示在電子名片」的欄位。</p>
          <div className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/80 max-w-md">
            {visibleFields.includes("photoUrl") && (resume.photoUrl as string) ? (
              <img
                src={resume.photoUrl as string}
                alt=""
                className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center shrink-0 border border-slate-200">
                <Users className="w-7 h-7 text-amber-600" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1">
              {visibleFields.includes("name") && (
                <p className="font-semibold text-slate-800">{String(resume.name || "").trim() || "（姓名未填）"}</p>
              )}
              {visibleFields.includes("title") && (
                <p className="text-xs text-slate-600">{String(resume.title || "").trim() || "（職稱未填）"}</p>
              )}
              {visibleFields.includes("phone") && (resume.phone as string) && (
                <a href={`tel:${resume.phone}`} className="text-sm text-amber-700 hover:underline block">
                  {String(resume.phone)}
                </a>
              )}
              {visibleFields.includes("lineId") && (resume.lineId as string) && (
                <a
                  href={`https://line.me/ti/p/~${String(resume.lineId).trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#06C755] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Line 聯絡
                </a>
              )}
              {visibleFields.includes("intro") && (resume.intro as string) && (
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{String(resume.intro)}</p>
              )}
              {visibleFields.length === 0 && (
                <p className="text-sm text-slate-400">請勾選「顯示在電子名片」的欄位，預覽會即時更新。</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
          {me.eCardStatus === "draft" && (
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              送出審核（顯示電子名片）
            </button>
          )}
          {me.eCardStatus === "pending_review" && (
            <span className="px-4 py-2 text-sm text-amber-600">已送出審核，等候管理員通過</span>
          )}
          {me.eCardStatus === "published" && (
            <span className="px-4 py-2 text-sm text-green-600">電子名片已對外顯示</span>
          )}
        </div>
      </div>
      {me.projects && me.projects.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-2">我負責的社區</h2>
          <ul className="text-sm text-slate-600 space-y-1">
            {me.projects.map((p) => (
              <li key={p.id}>{p.建案名稱 ?? `建案 #${p.id}`}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
