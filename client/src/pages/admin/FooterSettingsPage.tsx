/**
 * 頁尾設定：編輯全站底部 Footer 內容，儲存至 site-content.footer
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

export default function FooterSettingsPage() {
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

  const update = (updates: Partial<SiteContent["footer"]>) => {
    if (!data) return;
    setData({ ...data, footer: { ...data.footer, ...updates } });
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
        <h1 className="text-xl font-bold text-slate-800">頁尾</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "儲存中…" : "儲存"}
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="border rounded-lg px-4 py-4 bg-white space-y-3 max-w-xl">
        <Field label="品牌名稱" value={data.footer.brandName} onChange={(v) => update({ brandName: v })} />
        <Field label="副標" value={data.footer.brandSub} onChange={(v) => update({ brandSub: v })} />
        <Field label="簡介" value={data.footer.description} onChange={(v) => update({ description: v })} multiline />
        <Field label="電話" value={data.footer.phone} onChange={(v) => update({ phone: v })} />
        <Field label="地址" value={data.footer.address} onChange={(v) => update({ address: v })} />
        <Field label="LINE 連結" value={data.footer.lineUrl} onChange={(v) => update({ lineUrl: v })} />
        <Field label="免責聲明" value={data.footer.disclaimer} onChange={(v) => update({ disclaimer: v })} multiline />
        <Field label="版權" value={data.footer.copyright} onChange={(v) => update({ copyright: v })} />
        <Field label="經紀人資訊（頁尾小字）" value={data.footer.brokerInfo ?? ""} onChange={(v) => update({ brokerInfo: v })} />
      </div>
    </div>
  );
}
