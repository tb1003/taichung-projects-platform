/**
 * 後台：五義地產筆記列表與編輯（owner 專用）
 * 可新增、編輯、刪除、調整排序；右側解說支援 Markdown。
 */
import { useEffect, useState, useRef } from "react";
import { nanoid } from "nanoid";
import { apiGetKungfu, apiPutKungfu, apiUploadKungfuFile, type KungfuItem, type KungfuData } from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Upload, X } from "lucide-react";

function slugify(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, "")
    .toLowerCase() || "item";
}

export default function KungfuPage() {
  const [data, setData] = useState<KungfuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<KungfuItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pastedUrl, setPastedUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError("");
    apiGetKungfu()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = () => {
    if (!editing || !data) return;
    setSaving(true);
    setMessage("");
    setError("");
    const items = [...data.items];
    const idx = items.findIndex((x) => x.id === editing.id);
    const toSave: KungfuItem = {
      id: editing.id,
      title: editing.title.trim() || "未命名",
      slug: slugify(editing.title) || "item",
      imageUrls: Array.isArray(editing.imageUrls) ? editing.imageUrls : [],
      pdfUrls: Array.isArray(editing.pdfUrls) ? editing.pdfUrls : [],
      youtubeUrl: editing.youtubeUrl?.trim() || undefined,
      body: editing.body ?? "",
      order: typeof editing.order === "number" ? editing.order : items.length,
    };
    if (idx >= 0) items[idx] = toSave;
    else items.push(toSave);
    apiPutKungfu({ items })
      .then((updated) => {
        setData(updated);
        setEditing(null);
        setMessage("已儲存");
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  const handleDelete = (id: string) => {
    if (!data || !confirm("確定要刪除這則嗎？")) return;
    setSaving(true);
    setError("");
    const items = data.items.filter((x) => x.id !== id);
    apiPutKungfu({ items })
      .then((updated) => {
        setData(updated);
        if (editing?.id === id) setEditing(null);
        setMessage("已刪除");
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  const imageUrls = editing?.imageUrls ?? [];
  const pdfUrls = editing?.pdfUrls ?? [];

  const handleUploadFiles = async (files: FileList | null) => {
    if (!editing || !files?.length) return;
    const accepted = Array.from(files).filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
    if (!accepted.length) {
      setUploadError("請選擇圖片（png、jpg、gif、webp）或 PDF");
      return;
    }
    setUploadError("");
    setUploading(true);
    const newImageUrls: string[] = [];
    const newPdfUrls: string[] = [];
    for (const file of accepted) {
      try {
        const { url, type } = await apiUploadKungfuFile(file);
        if (type === "pdf") newPdfUrls.push(url);
        else newImageUrls.push(url);
      } catch (e) {
        setUploadError((prev) => (prev ? `${prev}；` : "") + `${file.name}: ${(e as Error)?.message ?? "上傳失敗"}`);
      }
    }
    if (newImageUrls.length || newPdfUrls.length) {
      setEditing({
        ...editing,
        imageUrls: [...imageUrls, ...newImageUrls],
        pdfUrls: [...pdfUrls, ...newPdfUrls],
      });
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUploadFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, imageUrls: imageUrls.filter((_, i) => i !== index) });
  };

  const removePdf = (index: number) => {
    if (!editing) return;
    setEditing({ ...editing, pdfUrls: pdfUrls.filter((_, i) => i !== index) });
  };

  const moveImage = (index: number, delta: number) => {
    if (!editing) return;
    const next = [...imageUrls];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setEditing({ ...editing, imageUrls: next });
  };

  const moveOrder = (index: number, delta: number) => {
    if (!data) return;
    const items = [...data.items].sort((a, b) => a.order - b.order);
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    [items[index], items[to]] = [items[to], items[index]];
    items.forEach((x, i) => ((x as KungfuItem).order = i));
    setSaving(true);
    apiPutKungfu({ items })
      .then((updated) => {
        setData(updated);
        setMessage("已更新排序");
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-muted-foreground">載入中…</p>;
  if (error && !data) return <p className="text-destructive">錯誤：{error}</p>;
  if (!data) return null;

  const sorted = [...data.items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">五義地產筆記</h1>
        <Button
          onClick={() =>
            setEditing({
              id: nanoid(),
              title: "",
              slug: "",
              imageUrls: [],
              pdfUrls: [],
              youtubeUrl: "",
              body: "",
              order: data.items.length,
            })
          }
        >
          <Plus className="w-4 h-4 mr-1" />
          新增
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      <p className="text-sm text-muted-foreground">
        顯示於房產實用工具頁「買賣前先搞懂」與「查行情與區域」之間，並可從頁首「五義地產筆記」獨立進入；點選後詳情頁左側為多圖上下排、右側為 Markdown 解說。
      </p>

      {/* 編輯表單 */}
      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">{data.items.some((x) => x.id === editing.id) ? "編輯" : "新增"}</h2>
          <div className="space-y-2">
            <Label>標題</Label>
            <Input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="例：專任委託銷售契約書"
            />
          </div>
          <div className="space-y-2">
            <Label>圖片與 PDF（左側由上而下顯示；可下載）</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleUploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              {uploading ? (
                <p className="text-sm text-muted-foreground">上傳中…</p>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">拖曳圖片或 PDF 至此，或點選上傳</p>
                  <p className="text-xs text-muted-foreground mt-1">圖片 png/jpg/gif/webp 單檔 10MB；PDF 單檔 20MB</p>
                </>
              )}
            </div>
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
            {imageUrls.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-muted-foreground">已選圖片（由上而下為顯示順序，可拖曳下方縮圖調整順序或刪除）</p>
                <div className="flex flex-wrap gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group">
                      <div className="w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center">
                        <img src={url} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); moveImage(index, -1); }}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); moveImage(index, 1); }}
                          disabled={index === imageUrls.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <Label className="text-muted-foreground text-xs shrink-0">或貼上圖片網址：</Label>
              <Input
                className="flex-1 text-sm"
                placeholder="https://... 或 /kungfu/xxx.png"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  const v = pastedUrl.trim();
                  if (v && editing) {
                    setEditing({ ...editing, imageUrls: [...imageUrls, v] });
                    setPastedUrl("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const v = pastedUrl.trim();
                  if (v && editing) {
                    setEditing({ ...editing, imageUrls: [...imageUrls, v] });
                    setPastedUrl("");
                  }
                }}
              >
                新增
              </Button>
            </div>
            {pdfUrls.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs text-muted-foreground">已選 PDF（可下載）</p>
                <ul className="flex flex-wrap gap-2">
                  {pdfUrls.map((url, index) => (
                    <li key={url + index} className="flex items-center gap-1 rounded border border-border px-2 py-1 bg-muted/50 text-sm">
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                        PDF {index + 1}
                      </a>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removePdf(index)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <Label>YouTube 影片網址（選填，詳情頁會嵌入播放）</Label>
              <Input
                value={editing.youtubeUrl ?? ""}
                onChange={(e) => setEditing({ ...editing, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>右側文字解說（支援 Markdown：標題、列表、粗體、連結等）</Label>
            <Textarea
              value={editing.body ?? ""}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={10}
              placeholder="可輸入純文字或 Markdown…"
              className="resize-y"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "儲存中…" : "儲存"}
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium w-10">排序</th>
              <th className="text-left p-3 font-medium">標題</th>
              <th className="text-left p-3 font-medium">slug</th>
              <th className="text-left p-3 font-medium w-20">圖片數</th>
              <th className="text-right p-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, index) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveOrder(index, -1)} disabled={index === 0 || saving}>
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveOrder(index, 1)} disabled={index === sorted.length - 1 || saving}>
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
                <td className="p-3 max-w-xs truncate">{item.title}</td>
                <td className="p-3 text-muted-foreground font-mono text-xs">{item.slug}</td>
                <td className="p-3">{(item.imageUrls || []).length}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing({ ...item })}>
                    <Pencil className="w-4 h-4 mr-1" />
                    編輯
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)} disabled={saving}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    刪除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">尚無項目，請點「新增」建立第一則。</p>
        )}
      </div>
    </div>
  );
}
