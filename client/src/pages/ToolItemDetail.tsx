/**
 * 房產工具項目詳情頁（有文案／圖片／YouTube 時從房產工具列表進入）
 * 若項目同時有圖片（或文案／YouTube）且連結為流程 demo，則呈現「左圖右流程」：左側圖片、右側層次說明＋深入解說。
 */
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ProcessFlowContent from "@/components/ProcessFlowContent";
import { getProcessStepsForHref } from "@/data/processSteps";

interface ToolItem {
  id: string;
  label: string;
  order: number;
  href?: string;
  external?: boolean;
  body?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
}

interface ToolBlock {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: ToolItem[];
}

function stripCiteTags(s: string): string {
  return s.replace(/\[cite_start\]/gi, "").replace(/\[cite:\s*[^\]]*\]/gi, "");
}

/** 行內 Markdown：**粗體**、[文字](url) 連結 */
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

function getYouTubeVideoId(url: string): string | null {
  if (!url?.trim()) return null;
  const m = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function ToolItemDetail() {
  const [, params] = useRoute("/tools/item/:blockId/:itemId");
  const blockId = params?.blockId ?? "";
  const itemId = params?.itemId ?? "";
  const [item, setItem] = useState<ToolItem | null>(null);
  const [blockTitle, setBlockTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blockId || !itemId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetch("/api/public/tool-blocks")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("讀取失敗"))))
      .then((data: { blocks: ToolBlock[] }) => {
        const block = data.blocks.find((b) => b.id === blockId);
        const found = block?.items.find((i) => i.id === itemId) ?? null;
        setItem(found);
        setBlockTitle(block?.title ?? "");
      })
      .catch((e) => setError(e.message ?? "載入失敗"))
      .finally(() => setLoading(false));
  }, [blockId, itemId]);

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
        <p className="text-destructive mb-4">{error || "找不到此項目"}</p>
        <Link href="/tools">
          <a className="inline-flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" />
            返回房產工具
          </a>
        </Link>
      </div>
    );
  }

  const hasRich = (item.body?.trim() || (item.imageUrls?.length ?? 0) > 0 || item.youtubeUrl?.trim());
  const ytId = item.youtubeUrl ? getYouTubeVideoId(item.youtubeUrl) : null;
  /** 若為站內流程 demo 連結，則呈現左圖右流程，不再另跳詳情 */
  const processSteps = !item.external ? getProcessStepsForHref(item.href) : null;
  const showLeftImageRightProcess = hasRich && processSteps && processSteps.length > 0;

  return (
    <div className="min-h-screen pb-20">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-4">
          <Link href="/tools">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              房產工具 · {blockTitle}
            </a>
          </Link>
          {showLeftImageRightProcess && (
            <h1 className="text-xl font-bold text-foreground mt-2">{item.label}</h1>
          )}
        </div>
      </div>
      <div className="container py-10">
        {showLeftImageRightProcess ? (
          /* 左圖右流程：左側圖片／影片／文案，右側層次說明（解說內嵌於卡片） */
          <div className="grid gap-8 lg:grid-cols-[1fr,1.2fr]">
            <div className="space-y-4">
              {(item.imageUrls?.length ?? 0) > 0 &&
                item.imageUrls!.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border bg-muted">
                    <img src={url} alt={`${item.label} ${i + 1}`} className="w-full h-auto object-contain" />
                  </div>
                ))}
              {ytId && (
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {item.body?.trim() && (
                <div className="prose prose-sm max-w-none text-foreground">{renderMarkdown(item.body)}</div>
              )}
            </div>
            <div>
              <ProcessFlowContent steps={processSteps!} />
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
            <div className="space-y-4">
              {(item.imageUrls?.length ?? 0) > 0 &&
                item.imageUrls!.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border bg-muted">
                    <img src={url} alt={`${item.label} ${i + 1}`} className="w-full h-auto object-contain" />
                  </div>
                ))}
              {ytId && (
                <div className="rounded-xl overflow-hidden border border-border bg-muted">
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title="YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
              {!hasRich && (
                <p className="text-muted-foreground text-sm">本項目無額外圖文說明。</p>
              )}
            </div>
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">{item.label}</h1>
              {item.body?.trim() && (
                <div className="prose prose-sm max-w-none text-foreground">{renderMarkdown(item.body)}</div>
              )}
              {item.href && (
                <div className="pt-4">
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.href!, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      前往連結
                    </a>
                  ) : (
                    <Link href={item.href}>
                      <a className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                        <ExternalLink className="w-4 h-4" />
                        前往
                      </a>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
