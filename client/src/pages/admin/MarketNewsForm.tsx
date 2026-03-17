/**
 * 後台：新增/編輯市場動態文章（含卡片圖片上傳）
 */
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import {
  apiGetMarketNews,
  apiPutMarketNews,
  apiUploadMarketNewsImage,
  type MarketNewsData,
  type MarketNewsArticle,
} from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "focus", name: "房市焦點" },
  { id: "regulations", name: "最新法規" },
] as const;

export default function MarketNewsForm() {
  const [, params] = useRoute("/admin/market-news/edit/:id");
  const [, paramsNew] = useRoute("/admin/market-news/new");
  const id = params?.id ?? paramsNew?.id;
  const isNew = id === "new";

  const [data, setData] = useState<MarketNewsData | null>(null);
  const [form, setForm] = useState<Partial<MarketNewsArticle>>({
    category: "focus",
    categoryName: "房市焦點",
    title: "",
    date: "",
    summary: "",
    body: "",
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetMarketNews()
      .then((d) => {
        setData(d);
        if (!isNew && id) {
          const article = (d.articles as MarketNewsArticle[]).find((a) => a.id === id);
          if (article) setForm({ ...article });
        } else {
          setForm({
            category: "focus",
            categoryName: "房市焦點",
            title: "",
            date: new Date().toISOString().slice(0, 10),
            summary: "",
            body: "",
            image: null,
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const update = (key: keyof MarketNewsArticle, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "category") {
      const cat = CATEGORIES.find((c) => c.id === value);
      if (cat) setForm((prev) => ({ ...prev, categoryName: cat.name }));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    const articleId = isNew ? "new" : (id as string);
    setUploading(true);
    setError("");
    try {
      const { url } = await apiUploadMarketNewsImage(articleId, file);
      update("image", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setError("");
    setSaving(true);
    try {
      const articles = [...(data.articles as MarketNewsArticle[])];
      let savedId: string | null = null;
      if (isNew) {
        const maxId = articles.reduce((m, a) => Math.max(m, parseInt(a.id, 10) || 0), 0);
        savedId = String(maxId + 1);
        articles.push({
          id: savedId,
          category: form.category || "focus",
          categoryName: form.categoryName || "房市焦點",
          title: form.title || "",
          date: form.date || "",
          summary: form.summary || "",
          body: form.body || "",
          image: form.image ?? null,
        });
      } else {
        const idx = articles.findIndex((a) => a.id === id);
        if (idx >= 0) {
          articles[idx] = {
            ...articles[idx],
            category: form.category || "focus",
            categoryName: form.categoryName || "房市焦點",
            title: form.title || "",
            date: form.date || "",
            summary: form.summary || "",
            body: form.body || "",
            image: form.image ?? null,
          };
        }
      }
      await apiPutMarketNews({ ...data, articles });
      if (isNew && savedId) {
        window.location.href = `/admin/market-news/edit/${savedId}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">載入中…</p>;
  if (!data && !isNew) return <p className="text-destructive">找不到該篇文章</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/admin/market-news">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回列表
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">{isNew ? "新增市場動態文章" : "編輯市場動態文章"}</h1>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>分類</Label>
          <Select
            value={form.category || "focus"}
            onValueChange={(v) => update("category", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>標題</Label>
          <Input
            value={form.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>日期</Label>
          <Input
            type="date"
            value={form.date ?? ""}
            onChange={(e) => update("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>摘要（列表卡片顯示）</Label>
          <Textarea
            value={form.summary ?? ""}
            onChange={(e) => update("summary", e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>卡片圖片（顯眼圖，選填）</Label>
          {form.image && (
            <div className="mb-2">
              <img
                src={form.image}
                alt="卡片預覽"
                className="max-w-xs rounded border object-cover max-h-32"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              disabled={uploading}
              className="max-w-xs"
            />
            {uploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="text-xs text-muted-foreground">建議比例約 4:3，單檔 3MB 內</p>
        </div>

        <div className="space-y-2">
          <Label>完整內文</Label>
          <Textarea
            value={form.body ?? ""}
            onChange={(e) => update("body", e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "儲存中…" : "儲存"}
          </Button>
          <Link href="/admin/market-news">
            <Button type="button" variant="outline">取消</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
