/**
 * 後台：房產工具區塊管理（買賣前先搞懂、查行情與區域、查證與進階工具）
 * 每則可設定：標題、外部／站內連結、文案（Markdown）、圖片、YouTube
 */
import { useEffect, useState, useRef } from "react";
import { nanoid } from "nanoid";
import {
  apiGetToolBlocks,
  apiPutToolBlocks,
  apiUploadToolBlockImage,
  type ToolBlocksData,
  type ToolBlock,
  type ToolItem,
} from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X, ExternalLink } from "lucide-react";

export default function ToolBlocksPage() {
  const [data, setData] = useState<ToolBlocksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<{ blockId: string; item: ToolItem } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pastedUrl, setPastedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError("");
    // 使用公開 API 讀取，避免未登入或非 owner 時卡在載入；儲存時仍會用需權限的 PUT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch("/api/public/tool-blocks", { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(res.status === 401 ? "請先登入" : res.status === 403 ? "僅管理員可操作" : "讀取失敗");
        return res.json();
      })
      .then(setData)
      .catch((e) => {
        clearTimeout(timeoutId);
        setError(e.name === "AbortError" ? "連線逾時，請確認已啟動伺服器（npm run dev）" : e.message ?? "載入失敗");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const getBlock = (blockId: string): ToolBlock | undefined => data?.blocks.find((b) => b.id === blockId);
  const getItemIndex = (blockId: string, itemId: string) => {
    const block = getBlock(blockId);
    return block?.items.findIndex((i) => i.id === itemId) ?? -1;
  };

  const handleSave = () => {
    if (!data) return;
    setSaving(true);
    setMessage("");
    setError("");
    apiPutToolBlocks(data)
      .then((updated) => {
        setData(updated);
        setEditing(null);
        setMessage("已儲存");
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  const addItem = (blockId: string) => {
    const block = getBlock(blockId);
    if (!block || !data) return;
    const newItem: ToolItem = {
      id: nanoid(),
      label: "新項目",
      order: block.items.length,
      href: "",
      external: true,
    };
    const blocks = data.blocks.map((b) =>
      b.id === blockId ? { ...b, items: [...b.items, newItem] } : b
    );
    setData({ ...data, blocks });
    setEditing({ blockId, item: newItem });
  };

  const removeItem = (blockId: string, itemId: string) => {
    if (!data || !confirm("確定要刪除此項目？")) return;
    const blocks = data.blocks.map((b) => {
      if (b.id !== blockId) return b;
      const items = b.items.filter((i) => i.id !== itemId);
      return { ...b, items };
    });
    setData({ ...data, blocks });
    if (editing?.item.id === itemId) setEditing(null);
  };

  const moveItem = (blockId: string, itemId: string, delta: number) => {
    const block = getBlock(blockId);
    if (!block || !data) return;
    const idx = getItemIndex(blockId, itemId);
    if (idx < 0 || idx + delta < 0 || idx + delta >= block.items.length) return;
    const items = [...block.items];
    const [removed] = items.splice(idx, 1);
    items.splice(idx + delta, 0, removed);
    items.forEach((it, i) => (it.order = i));
    const blocks = data.blocks.map((b) => (b.id === blockId ? { ...b, items } : b));
    setData({ ...data, blocks });
  };

  const updateEditingItem = (updates: Partial<ToolItem>) => {
    if (!editing || !data) return;
    const block = getBlock(editing.blockId);
    if (!block) return;
    const item = { ...editing.item, ...updates };
    const items = block.items.map((i) => (i.id === item.id ? item : i));
    const blocks = data.blocks.map((b) => (b.id === editing.blockId ? { ...b, items } : b));
    setData({ ...data, blocks });
    setEditing({ ...editing, item });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!editing || !files?.length) return;
    const imageUrls = editing.item.imageUrls ?? [];
    setUploadError("");
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const { url } = await apiUploadToolBlockImage(file);
        updateEditingItem({ imageUrls: [...imageUrls, url] });
        imageUrls.push(url);
      } catch (e) {
        setUploadError((prev) => (prev ? `${prev}; ` : "") + `${file.name}: ${(e as Error)?.message ?? "上傳失敗"}`);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const urls = [...(editing?.item.imageUrls ?? [])];
    urls.splice(index, 1);
    updateEditingItem({ imageUrls: urls });
  };

  if (loading || !data) {
    return <div className="p-6">載入中…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">房產工具區塊</h1>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-sm text-muted-foreground">
        管理「買賣前先搞懂」「查行情與區域」「查證與進階工具」三區塊。每則可設標題、連結（外部／站內）、文案（Markdown）、圖片、YouTube；有文案或圖片或 YouTube 的項目會顯示詳情頁。
      </p>

      {/* 編輯表單 */}
      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">編輯項目（{getBlock(editing.blockId)?.title}）</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>標題</Label>
              <Input
                value={editing.item.label}
                onChange={(e) => updateEditingItem({ label: e.target.value })}
                placeholder="例：內政部實價登錄查詢"
              />
            </div>
            <div className="space-y-2">
              <Label>連結網址（選填，可連外部或站內如 /about）</Label>
              <Input
                value={editing.item.href ?? ""}
                onChange={(e) => updateEditingItem({ href: e.target.value })}
                placeholder="https://... 或 /about"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="external"
              checked={editing.item.external ?? true}
              onChange={(e) => updateEditingItem({ external: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="external" className="cursor-pointer">連結以新分頁開啟（外部連結建議勾選）</Label>
          </div>
          <div className="space-y-2">
            <Label>文案（選填，支援 Markdown；有填則前台顯示詳情頁）</Label>
            <Textarea
              value={editing.item.body ?? ""}
              onChange={(e) => updateEditingItem({ body: e.target.value })}
              rows={6}
              placeholder="可輸入說明文字或 Markdown…"
              className="resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label>圖片（選填，詳情頁顯示）</Label>
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center bg-muted/30 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleUpload(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploading ? "上傳中…" : "點選上傳圖片（或拖曳）"}
            </div>
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            {(editing.item.imageUrls?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {editing.item.imageUrls!.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-1 -right-1 h-5 w-5"
                      onClick={() => removeImage(i)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Input
                className="flex-1 text-sm"
                placeholder="或貼上圖片網址"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pastedUrl.trim()) {
                    updateEditingItem({ imageUrls: [...(editing.item.imageUrls ?? []), pastedUrl.trim()] });
                    setPastedUrl("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (pastedUrl.trim()) {
                    updateEditingItem({ imageUrls: [...(editing.item.imageUrls ?? []), pastedUrl.trim()] });
                    setPastedUrl("");
                  }
                }}
              >
                新增
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>YouTube 影片網址（選填）</Label>
            <Input
              value={editing.item.youtubeUrl ?? ""}
              onChange={(e) => updateEditingItem({ youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? "儲存中…" : "儲存"}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>取消</Button>
          </div>
        </div>
      )}

      {/* 區塊列表 */}
      {data.blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <div key={block.id} className="rounded-lg border bg-card overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{block.title}</h2>
                {block.description && <p className="text-sm text-muted-foreground">{block.description}</p>}
              </div>
              <Button size="sm" onClick={() => addItem(block.id)}>
                <Plus className="w-4 h-4 mr-1" />
                新增項目
              </Button>
            </div>
            <ul className="divide-y">
              {block.items
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item, idx) => (
                  <li key={item.id} className="flex items-center gap-2 p-3 hover:bg-muted/20">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(block.id, item.id, -1)} disabled={idx === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(block.id, item.id, 1)} disabled={idx === block.items.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href && <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ blockId: block.id, item: { ...item } })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeItem(block.id, item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
            </ul>
            {block.items.length === 0 && <p className="p-4 text-sm text-muted-foreground">尚無項目，可點「新增項目」</p>}
          </div>
        ))}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? "儲存中…" : "儲存全部"}</Button>
      </div>
    </div>
  );
}
