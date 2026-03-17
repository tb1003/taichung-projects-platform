/**
 * 頁首設定：編輯全站頂部 Navbar 內容，儲存至 site-content.navbar
 */
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "./api";
import type { SiteContent } from "./SiteContentPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default function NavbarSettingsPage() {
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

  const update = (updates: Partial<SiteContent["navbar"]>) => {
    if (!data) return;
    setData({ ...data, navbar: { ...data.navbar, ...updates } });
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
        <h1 className="text-xl font-bold text-slate-800">頁首</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "儲存中…" : "儲存"}
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="border rounded-lg px-4 py-4 bg-white space-y-3 max-w-xl">
        <Field label="品牌名稱" value={data.navbar.brandName} onChange={(v) => update({ brandName: v })} />
        <Field label="副標" value={data.navbar.brandSub} onChange={(v) => update({ brandSub: v })} />
        <Field label="LINE 連結" value={data.navbar.lineUrl} onChange={(v) => update({ lineUrl: v })} />
      </div>
    </div>
  );
}
