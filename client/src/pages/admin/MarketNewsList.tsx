/**
 * 後台：市場動態（房市快訊）文章列表，可新增、編輯
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { apiGetMarketNews, type MarketNewsData, type MarketNewsArticle } from "./api";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";

export default function MarketNewsList() {
  const [data, setData] = useState<MarketNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGetMarketNews()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">載入中…</p>;
  if (error) return <p className="text-destructive">錯誤：{error}</p>;
  if (!data) return null;

  const articles = data.articles as MarketNewsArticle[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">市場動態（房市快訊）</h1>
        <Link href="/admin/market-news/new">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            新增文章
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">共 {articles.length} 篇，可編輯標題、摘要、內文與卡片圖片。</p>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">分類</th>
              <th className="text-left p-3 font-medium">標題</th>
              <th className="text-left p-3 font-medium">日期</th>
              <th className="text-left p-3 font-medium w-24">卡片圖</th>
              <th className="text-right p-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="p-3">{a.categoryName}</td>
                <td className="p-3 max-w-xs truncate">{a.title}</td>
                <td className="p-3">{a.date}</td>
                <td className="p-3">
                  {a.image ? (
                    <img src={a.image} alt="" className="w-14 h-10 object-cover rounded" />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/market-news/edit/${a.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="w-4 h-4 mr-1" />
                      編輯
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
