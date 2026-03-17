/**
 * 五義地產筆記：單則詳情頁，左側多圖上下排、右側 Markdown 解說
 * 右側使用簡易 Markdown 渲染（不依賴 react-markdown）
 */
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Download, FileText, X } from "lucide-react";

/** 移除引用標記（避免以原始文字顯示）：[cite_start]、[cite:11]、[cite:17,19] 等 */
function stripCiteTags(s: string): string {
  return s
    .replace(/\[cite_start\]/gi, "")
    .replace(/\[cite:\s*[^\]]*\]/gi, "");
}

/** 簡易 Markdown 轉 React 節點：段落、**粗體**、## 標題、[文字](url) 連結、換行 */
function renderMarkdown(text: string): React.ReactNode {
  text = stripCiteTags(text);
  const lines = text.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      blocks.push(<h2 key={i} className="text-lg font-semibold text-foreground mt-4 mb-1">{parseInline(trimmed.slice(3))}</h2>);
      i += 1;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      blocks.push(<h3 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">{parseInline(trimmed.slice(4))}</h3>);
      i += 1;
      continue;
    }
    if (trimmed === "") {
      i += 1;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <p key={i} className="text-foreground leading-relaxed mb-2">
        {para.map((p, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {parseInline(p)}
          </span>
        ))}
      </p>
    );
  }
  return <>{blocks}</>;
}

function parseInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  while (rest.length > 0) {
    const link = /^\[([^\]]*)\]\(([^)]*)\)/.exec(rest);
    const bold = /^\*\*([^*]+)\*\*/.exec(rest);
    if (link) {
      parts.push(<a key={key++} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link[1]}</a>);
      rest = rest.slice(link[0].length);
    } else if (bold) {
      parts.push(<strong key={key++} className="font-semibold">{bold[1]}</strong>);
      rest = rest.slice(bold[0].length);
    } else {
      const match = /^(.*?)(\[[^\]]*\]\([^)]*\)|\*\*[^*]+\*\*)/.exec(rest);
      const raw = match ? match[1] : rest;
      if (raw) parts.push(raw);
      rest = match ? rest.slice(match[1].length) : "";
    }
  }
  return <>{parts}</>;
}

export interface KungfuItem {
  id: string;
  title: string;
  slug: string;
  imageUrls: string[];
  pdfUrls?: string[];
  youtubeUrl?: string;
  body: string;
  order: number;
}

/** 從 YouTube 網址取出 video id */
function getYouTubeVideoId(url: string): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  const m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function KungfuDetail() {
  const [, params] = useRoute("/tools/kungfu/:slug");
  const slug = params?.slug ?? "";
  const [item, setItem] = useState<KungfuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch("/api/public/kungfu")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("讀取失敗"))))
      .then((data: { items: KungfuItem[] }) => {
        const found = data.items.find((x) => x.slug === slug);
        setItem(found ?? null);
      })
      .catch((e) => setError(e.message ?? "載入失敗"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">載入中…</p>
      </div>
    );
  }
  if (error || !item) {
    return (
      <div className="min-h-screen container py-10">
        <p className="text-destructive mb-4">{error || "找不到此則筆記"}</p>
        <Link href="/tools/notes">
          <a className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            返回五義地產筆記
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 點擊放大：lightbox，點背景或 X 關閉 */}
      {enlargedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="放大圖片"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="放大檢視"
            className="max-w-full max-h-full object-contain pointer-events-none"
          />
          <button
            type="button"
            onClick={() => setEnlargedImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="關閉"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className="border-b border-border bg-muted/30">
        <div className="container py-4">
          <Link href="/tools/notes">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              五義地產筆記
            </a>
          </Link>
        </div>
      </div>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 左側：多圖上下排、下載連結、PDF、YouTube */}
          <div className="space-y-4">
            {item.imageUrls.length > 0 ? (
              item.imageUrls.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-muted">
                  <button
                    type="button"
                    onClick={() => setEnlargedImage(url)}
                    className="w-full block text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-t-xl overflow-hidden"
                    aria-label={`放大圖片 ${i + 1}`}
                  >
                    <img src={url} alt={`${item.title} ${i + 1}`} className="w-full h-auto object-contain cursor-zoom-in hover:opacity-95 transition-opacity" />
                  </button>
                  <div className="p-2 bg-muted/50 flex justify-end">
                    <a href={url} download className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Download className="w-4 h-4" />
                      下載圖片
                    </a>
                  </div>
                </div>
              ))
            ) : (
              (item.pdfUrls?.length ?? 0) === 0 && !item.youtubeUrl && (
                <div className="rounded-xl border border-dashed border-border bg-muted/50 flex items-center justify-center min-h-[200px] text-muted-foreground text-sm">
                  尚無圖片
                </div>
              )
            )}
            {(item.pdfUrls?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF 下載
                </p>
                <ul className="space-y-1">
                  {item.pdfUrls.map((url, i) => (
                    <li key={i}>
                      <a href={url} target="_blank" rel="noopener noreferrer" download className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <Download className="w-3.5 h-3.5" />
                        下載 PDF {item.pdfUrls!.length > 1 ? `（${i + 1}）` : ""}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.youtubeUrl && getYouTubeVideoId(item.youtubeUrl) && (
              <div className="rounded-xl overflow-hidden border border-border bg-muted">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(item.youtubeUrl)}`}
                    title="YouTube"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
          {/* 右側：標題 + Markdown 解說 */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <h1 className="text-2xl font-bold text-foreground mb-4">{item.title}</h1>
            <div className="text-sm text-foreground/90 space-y-1">
              {item.body ? (
                renderMarkdown(item.body)
              ) : (
                <p className="text-muted-foreground">尚無文字解說。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
