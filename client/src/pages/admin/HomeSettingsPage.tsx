/**
 * 首頁內容設定：編輯首頁英雄區、關於區塊、CTA 等，儲存至 site-content.home
 */
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "./api";
import type { SiteContent } from "./SiteContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="resize-y" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function HomeSettingsPage() {
  const [data, setData] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<SiteContent>("/api/admin/site-content")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const update = (updates: Partial<SiteContent["home"]>) => {
    if (!data) return;
    setData({ ...data, home: { ...data.home, ...updates } });
  };

  const save = () => {
    if (!data) return;
    setError("");
    setMessage("");
    setSaving(true);
    apiPut("/api/admin/site-content", data)
      .then(() => setMessage("已儲存"))
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  if (loading) return <div className="text-slate-600">載入中…</div>;
  if (error && !data) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">首頁內容</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "儲存中…" : "儲存"}
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="border rounded-lg px-4 py-4 bg-white space-y-3 max-w-xl">
        <Field label="Hero 主圖" value={data.home.heroImage} onChange={(v) => update({ heroImage: v })} />
        <Field label="天際線圖" value={data.home.skylineImage} onChange={(v) => update({ skylineImage: v })} />
        <Field label="諮詢圖" value={data.home.consultationImage} onChange={(v) => update({ consultationImage: v })} />
        <Field label="社區圖" value={data.home.communityImage} onChange={(v) => update({ communityImage: v })} />
        <Field label="LINE 連結" value={data.home.lineUrl} onChange={(v) => update({ lineUrl: v })} />
        <Field label="Hero 徽章" value={data.home.heroBadge} onChange={(v) => update({ heroBadge: v })} />
        <Field label="Hero 標題前" value={data.home.heroTitle} onChange={(v) => update({ heroTitle: v })} />
        <Field label="Hero 標題強調" value={data.home.heroHighlight} onChange={(v) => update({ heroHighlight: v })} />
        <Field label="Hero 標題後" value={data.home.heroSuffix} onChange={(v) => update({ heroSuffix: v })} />
        <Field label="Hero 描述（可用 {{count}}）" value={data.home.heroDesc} onChange={(v) => update({ heroDesc: v })} multiline />
        <Field label="關於區塊徽章" value={data.home.aboutSectionBadge} onChange={(v) => update({ aboutSectionBadge: v })} />
        <Field label="關於區塊標題" value={data.home.aboutSectionTitle} onChange={(v) => update({ aboutSectionTitle: v })} />
        <Field label="關於區塊描述" value={data.home.aboutSectionDesc} onChange={(v) => update({ aboutSectionDesc: v })} multiline />
        <Field label="CTA 標題" value={data.home.ctaTitle} onChange={(v) => update({ ctaTitle: v })} />
        <Field label="CTA 描述（可用 {{count}}）" value={data.home.ctaDesc} onChange={(v) => update({ ctaDesc: v })} multiline />
        <div className="space-y-1">
          <Label>精選建案名稱（每行一個）</Label>
          <Textarea
            value={data.home.featuredProjectNames.join("\n")}
            onChange={(e) => update({ featuredProjectNames: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            rows={4}
            placeholder="勤美之森&#10;寶輝花園紀"
          />
        </div>
      </div>
    </div>
  );
}
