/**
 * 首頁風格 Demo 索引：四種樣式參考
 * 路徑：/demo/home-styles
 */
import { Link } from "wouter";
import { ArrowLeft, Layout, Zap, Heart, Type } from "lucide-react";

const STYLES = [
  {
    id: "luxury",
    path: "/demo/home-style-1",
    title: "高端房產品牌",
    subtitle: "沉穩大圖 ＋ 留白",
    desc: "深灰／米白、全幅主視覺、標題大而少，強調專業與信任。",
    icon: Layout,
    bg: "bg-slate-800",
    accent: "text-amber-200",
  },
  {
    id: "saas",
    path: "/demo/home-style-2",
    title: "現代 SaaS／平台感",
    subtitle: "清爽卡片 ＋ 數據",
    desc: "白底、鮮明主色、搜尋與數據突出，強調好用與效率。",
    icon: Zap,
    bg: "bg-slate-100",
    accent: "text-blue-600",
  },
  {
    id: "local",
    path: "/demo/home-style-3",
    title: "在地生活／故事感",
    subtitle: "溫暖圖文 ＋ 人情味",
    desc: "暖色、人物與生活感、關於區塊大，強調個人品牌與在地信任。",
    icon: Heart,
    bg: "bg-amber-50",
    accent: "text-amber-800",
  },
  {
    id: "anson",
    path: "/demo/home-style-4",
    title: "陳安森式編排",
    subtitle: "主標＋副標 ＋ 好案推薦",
    desc: "參考 0979616027.com：一句主標、雙行副標、最新好案推薦＋橫向分類、社群聯絡。",
    icon: Type,
    bg: "bg-neutral-800",
    accent: "text-neutral-200",
  },
];

export default function HomeStylesDemoIndex() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              返回首頁
            </a>
          </Link>
          <h1 className="text-xl font-bold mt-2">首頁風格 Demo</h1>
          <p className="text-sm text-muted-foreground mt-1">點選下方任一風格預覽該版型</p>
        </div>
      </div>
      <div className="container py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((s) => (
            <Link key={s.id} href={s.path}>
              <a className="block group">
                <div className={`rounded-2xl overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-primary/30 ${s.bg}`}>
                  <div className="p-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
                      <s.icon className={`w-6 h-6 ${s.accent}`} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">{s.title}</h2>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                    <span className="inline-block mt-4 text-sm font-medium text-primary">前往預覽 →</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
