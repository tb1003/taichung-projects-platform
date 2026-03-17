/**
 * 房產實用工具：買賣前先搞懂 → 五義地產筆記 → 查行情與區域 → 查證與進階工具
 * 前後兩區塊由後台「房產工具區塊」管理；中間為五義地產筆記。
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Wrench } from "lucide-react";

interface KungfuItem {
  id: string;
  title: string;
  slug: string;
  imageUrls: string[];
  body: string;
  order: number;
}

interface ToolItemApi {
  id: string;
  label: string;
  order: number;
  href?: string;
  external?: boolean;
  body?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
}

interface ToolBlockApi {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: ToolItemApi[];
}

type DisplayItem = { label: string; href: string; external: boolean; blockId?: string; itemId?: string };

export default function RealEstateTools() {
  const [toolBlocks, setToolBlocks] = useState<ToolBlockApi[]>([]);
  const [kungfuItems, setKungfuItems] = useState<KungfuItem[]>([]);

  useEffect(() => {
    fetch("/api/public/tool-blocks")
      .then((res) => (res.ok ? res.json() : { blocks: [] }))
      .then((data: { blocks: ToolBlockApi[] }) => setToolBlocks(data.blocks ?? []))
      .catch(() => setToolBlocks([]));
  }, []);
  useEffect(() => {
    fetch("/api/public/kungfu")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: KungfuItem[] }) => setKungfuItems(data.items ?? []))
      .catch(() => setKungfuItems([]));
  }, []);

  const sortedToolBlocks = [...toolBlocks].sort((a, b) => a.order - b.order);

  /** 區塊順序：買賣前先搞懂 → 五義地產筆記（若有）→ 查行情與區域 → 查證與進階工具 */
  const blocks: { title: string; description?: string; items: DisplayItem[] }[] = [
    ...sortedToolBlocks.slice(0, 1).map((b) => ({
      title: b.title,
      description: b.description,
      items: b.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((i) => {
          const hasRich = !!(i.body?.trim() || (i.imageUrls?.length ?? 0) > 0 || i.youtubeUrl?.trim());
          return {
            label: i.label,
            href: hasRich ? `/tools/item/${b.id}/${i.id}` : (i.href ?? "#"),
            external: hasRich ? false : (i.external ?? true),
            blockId: hasRich ? b.id : undefined,
            itemId: hasRich ? i.id : undefined,
          };
        }),
    })),
    ...(kungfuItems.length > 0
      ? [
          {
            title: "五義地產筆記",
            description: "委託、要約、履約、稅費與屋況等實務說明，點選進入圖文解說。",
            items: kungfuItems
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((i) => ({ label: i.title, href: `/tools/kungfu/${i.slug}`, external: false as const })),
          },
        ]
      : []),
    ...sortedToolBlocks.slice(1).map((b) => ({
      title: b.title,
      description: b.description,
      items: b.items
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((i) => {
          const hasRich = !!(i.body?.trim() || (i.imageUrls?.length ?? 0) > 0 || i.youtubeUrl?.trim());
          return {
            label: i.label,
            href: hasRich ? `/tools/item/${b.id}/${i.id}` : (i.href ?? "#"),
            external: hasRich ? false : (i.external ?? true),
            blockId: hasRich ? b.id : undefined,
            itemId: hasRich ? i.id : undefined,
          };
        }),
    })),
  ];

  return (
    <div className="min-h-screen pb-20">
      <section className="border-b border-border bg-muted/30">
        <div className="container py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">房產實用工具</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            依使用情境整理：買賣前先搞懂（賣屋／土地／貸款流程）、查行情與區域、進階查證工具。
          </p>
        </div>
      </section>

      <div className="container py-10 space-y-14">
        {blocks.map((block, idx) => (
          <section key={idx} className="scroll-mt-24">
            <h2 className="text-lg font-bold text-foreground mb-1">{block.title}</h2>
            {block.description && (
              <p className="text-muted-foreground text-sm mb-4">{block.description}</p>
            )}
            <ul className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
              {block.items.map((item, i) => (
                <li key={item.blockId && item.itemId ? `${item.blockId}-${item.itemId}` : i}>
                  {item.external === false ? (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <span className="text-muted-foreground shrink-0">前往</span>
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.href, "_blank", "noopener,noreferrer");
                      }}
                    >
                      <span>{item.label}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
