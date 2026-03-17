/**
 * 關於我們 － 團隊介紹／電子名片 10 款風格 Demo 索引
 * 路徑：/demo/about-team
 */
import { Link } from "wouter";
import { ArrowLeft, User, Layout, Palette } from "lucide-react";

const STYLES = [
  { id: 1, path: "/demo/about-team/1", title: "原版參考", subtitle: "漸層橫幅＋圓照＋雙按鈕", desc: "藍綠漸層、大頭照置中、一鍵撥打／加 LINE，為什麼找我＋標籤＋精選好案。" },
  { id: 2, path: "/demo/about-team/2", title: "極簡白卡", subtitle: "留白與陰影", desc: "純白卡片、柔和陰影、最少裝飾，突出姓名與聯絡方式。" },
  { id: 3, path: "/demo/about-team/3", title: "深色專業", subtitle: "沉穩商務", desc: "深灰／炭黑底、金或白字、專業感強，適合高端房產形象。" },
  { id: 4, path: "/demo/about-team/4", title: "暖陽品牌", subtitle: "在地溫暖", desc: "琥珀／暖棕主色、圓角卡片，與本站品牌一致、親和力高。" },
  { id: 5, path: "/demo/about-team/5", title: "左圖右文", subtitle: "橫向資訊卡", desc: "大頭照在左、姓名職稱與按鈕在右，資訊層次清楚。" },
  { id: 6, path: "/demo/about-team/6", title: "橫條卡片", subtitle: "緊湊多成員", desc: "橫向窄條、多成員並列時不占高度，適合團隊一覽。" },
  { id: 7, path: "/demo/about-team/7", title: "Bento 網格", subtitle: "區塊拼貼", desc: "頭像、文案、好案、按鈕分格呈現，現代感強。" },
  { id: 8, path: "/demo/about-team/8", title: "時間軸", subtitle: "垂直動線", desc: "從上到下：頭像 → 介紹 → 好案 → CTA，閱讀動線明確。" },
  { id: 9, path: "/demo/about-team/9", title: "玻璃擬態", subtitle: "半透明層次", desc: "毛玻璃卡片、輕盈陰影，適合疊在 Hero 圖上。" },
  { id: 10, path: "/demo/about-team/10", title: "雜誌編輯", subtitle: "大標與留白", desc: "大字姓名、副標、大留白，雜誌式排版、個人品牌感強。" },
];

export default function AboutTeamDemoIndex() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <Link href="/about">
            <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              返回關於我們
            </a>
          </Link>
          <h1 className="text-xl font-bold mt-2 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            關於我們 － 團隊介紹／電子名片 Demo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">10 款不同風格，供挑選後套用至正式「關於我們」頁面。每款皆含：聯絡資訊、為什麼找我、專長標籤、精選好案、存入手機聯絡人。</p>
        </div>
      </div>
      <div className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STYLES.map((s) => (
            <Link key={s.id} href={s.path}>
              <a className="block group">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:border-primary/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-foreground">風格 {s.id}：{s.title}</h2>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                  <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary">
                    <Palette className="w-4 h-4" />
                    前往預覽
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
