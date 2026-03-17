/**
 * 五義地產筆記：獨立列表頁，列出所有筆記並連結至詳情
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";

interface KungfuItem {
  id: string;
  title: string;
  slug: string;
  imageUrls: string[];
  body: string;
  order: number;
}

export default function KungfuNotesList() {
  const [items, setItems] = useState<KungfuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/kungfu")
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items: KungfuItem[] }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen pb-20">
      <section className="border-b border-border bg-muted/30">
        <div className="container py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">五義地產筆記</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            委託、要約、履約、稅費與屋況等實務說明，點選進入圖文解說。
          </p>
        </div>
      </section>

      <div className="container py-10">
        {loading ? (
          <p className="text-muted-foreground text-sm">載入中…</p>
        ) : sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm">尚無筆記。</p>
        ) : (
          <ul className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
            {sorted.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/tools/kungfu/${item.slug}`}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span>{item.title}</span>
                  <span className="text-muted-foreground shrink-0">前往</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
