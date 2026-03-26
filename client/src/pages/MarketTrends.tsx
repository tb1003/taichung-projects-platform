/**
 * 市場動態：房市快訊（房市焦點、最新法規），可點入看詳情；資料優先從 API 取得
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import marketNewsData from "@/data/market-news.json";
import { Calendar } from "lucide-react";

type Article = {
  id: string;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  summary: string;
  image?: string | null;
};

function sortByNewest(list: Article[]): Article[] {
  return [...list].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

const staticArticles: Article[] = sortByNewest(marketNewsData.articles as Article[]);

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

export default function MarketTrends() {
  const [articles, setArticles] = useState<Article[]>(staticArticles);

  useEffect(() => {
    fetch("/api/public/market-news")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { articles?: Article[] }) => d.articles && setArticles(sortByNewest(d.articles)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <section className="border-b border-border bg-muted/30">
        <div className="container py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">市場動態</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            房市焦點與最新法規整理，掌握趨勢與稅制變化。
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((a) => (
            <Link key={a.id} href={`/market-trends/${a.id}`}>
              <article
                className="flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md cursor-pointer h-full"
              >
                {a.image && (
                  <div className="relative w-full aspect-[4/3] bg-muted shrink-0">
                    <img
                      src={a.image}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-1 p-5">
                  <span
                    className={
                      a.category === "focus"
                        ? "inline-flex w-fit rounded bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                        : "inline-flex w-fit rounded bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary"
                    }
                  >
                    {a.categoryName}
                  </span>
                  <h2 className="mt-3 text-base font-bold leading-snug text-foreground line-clamp-2">
                    {a.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(a.date)}
                  </p>
                  <p className="mt-3 line-clamp-4 flex-1 text-sm text-muted-foreground leading-relaxed">
                    {a.summary}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
