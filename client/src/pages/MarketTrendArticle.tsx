/**
 * 市場動態：單篇文章詳情（完整內文）；資料優先從 API 取得
 */
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import marketNewsData from "@/data/market-news.json";
import { Calendar, ArrowLeft, FileDown } from "lucide-react";

type Article = {
  id: string;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  summary: string;
  body: string;
};

const staticArticles: Article[] = marketNewsData.articles as Article[];

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

export default function MarketTrendArticle() {
  const [, params] = useRoute("/market-trends/:id");
  const id = params?.id;
  const [articles, setArticles] = useState<Article[]>(staticArticles);

  useEffect(() => {
    fetch("/api/public/market-news")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d: { articles?: Article[] }) => d.articles && setArticles(d.articles))
      .catch(() => {});
  }, []);

  const article = id ? articles.find((a) => a.id === id) : null;

  if (!article) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">找不到該篇文章。</p>
          <Link href="/market-trends" className="mt-4 inline-flex items-center gap-1 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            返回市場動態
          </Link>
        </div>
      </div>
    );
  }

  const isHtmlBody =
    typeof article.body === "string" &&
    (article.body.trimStart().startsWith("<") || article.body.includes("<h1"));

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-muted/40 to-background">
      <section className="border-b border-border/80 bg-card/50 backdrop-blur-sm">
        <div className="container py-5">
          <Link
            href="/market-trends"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            返回市場動態
          </Link>
        </div>
      </section>

      <article className="container py-8 md:py-12 max-w-3xl">
        <div className="rounded-2xl border border-border/80 bg-card px-6 py-8 shadow-sm md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={
                article.category === "focus"
                  ? "inline-flex w-fit rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400"
                  : "inline-flex w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary"
              }
            >
              {article.categoryName}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {formatDate(article.date)}
            </span>
            {id === "1" && (
              <a
                href="/買房須知.pdf"
                download="買房須知.pdf"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <FileDown className="h-4 w-4 shrink-0" />
                下載買方必備明細
              </a>
            )}
          </div>
          {!isHtmlBody && (
            <h1 className="mt-4 text-2xl md:text-3xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>
          )}
          <div
            className={
              isHtmlBody
                ? "market-trend-article-content mt-8 prose prose-neutral dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-img:rounded-xl prose-img:shadow-md"
                : "mt-8 prose prose-neutral dark:prose-invert max-w-none"
            }
          >
            {isHtmlBody ? (
              <div dangerouslySetInnerHTML={{ __html: article.body }} />
            ) : (
              (() => {
                const paragraphs = article.body.split(/\n\n+/).filter(Boolean);
                return paragraphs.map((para, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                    {para.split("\n").map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < para.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ));
              })()
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
