/**
 * 關於我們設定：編輯關於我們頁面內容，儲存至 site-content.about
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
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

export default function AboutSettingsPage() {
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

  const update = (updates: Partial<SiteContent["about"]>) => {
    if (!data) return;
    setData({ ...data, about: { ...data.about, ...updates } });
  };

  const updateAboutValue = (index: number, field: "title" | "desc", value: string) => {
    if (!data) return;
    const values = [...data.about.values];
    if (!values[index]) values[index] = { title: "", desc: "" };
    values[index] = { ...values[index], [field]: value };
    update({ values });
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
        <h1 className="text-xl font-bold text-slate-800">關於我們</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "儲存中…" : "儲存"}
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="border rounded-lg px-4 py-4 bg-white space-y-3 max-w-xl">
        <Field label="主圖 URL" value={data.about.heroImage} onChange={(v) => update({ heroImage: v })} />
        <Field label="副標" value={data.about.subtitle} onChange={(v) => update({ subtitle: v })} />
        <Field label="店名" value={data.about.storeName} onChange={(v) => update({ storeName: v })} />
        <Field label="店副標" value={data.about.storeSub} onChange={(v) => update({ storeSub: v })} />
        <Field label="地址" value={data.about.address} onChange={(v) => update({ address: v })} />
        <Field label="電話" value={data.about.phone} onChange={(v) => update({ phone: v })} />
        <Field label="LINE 連結" value={data.about.lineUrl} onChange={(v) => update({ lineUrl: v })} />
        <div className="space-y-2">
          <Label>三大理念（標題／描述）</Label>
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Input
                placeholder="標題"
                value={data.about.values[i]?.title ?? ""}
                onChange={(e) => updateAboutValue(i, "title", e.target.value)}
              />
              <Input
                placeholder="描述"
                value={data.about.values[i]?.desc ?? ""}
                onChange={(e) => updateAboutValue(i, "desc", e.target.value)}
              />
            </div>
          ))}
        </div>
        <Field label="平台簡介" value={data.about.platformIntro} onChange={(v) => update({ platformIntro: v })} multiline />
        <Field label="平台免責" value={data.about.platformDisclaimer} onChange={(v) => update({ platformDisclaimer: v })} multiline />
        <Field label="CTA 文案" value={data.about.ctaText} onChange={(v) => update({ ctaText: v })} />
        <div className="pt-2 border-t">
          <Label>團隊成員（電子名片）</Label>
          <p className="text-sm text-slate-500 mt-1 mb-2">
            請至「團隊成員」頁面新增／編輯成員。
          </p>
          <Link href="/admin/team-members">
            <a className="text-sm font-medium text-primary hover:underline">前往團隊成員頁面 →</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
