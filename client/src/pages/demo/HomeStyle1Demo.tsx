/**
 * 首頁風格 Demo 1：高端房產品牌 — 活潑版（動效＋金橙漸層）
 * 路徑：/demo/home-style-1
 */
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useSiteContent } from "@/hooks/useSiteContent";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_SKYLINE = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_CONSULTATION = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/real-estate-consultation-7cGkbCY8HTENe5HpHUNiYg.webp";
const DEFAULT_LINE = "https://line.me/R/ti/p/@368bruzx";
const DEFAULT_FEATURED_NAMES = ["勤美之森", "寶輝花園紀", "惠宇大聚", "國泰聚", "雙橡園S1", "總太織築"];

const HOT_ZONES = [
  { name: "機捷特區", count: 54 },
  { name: "14期重劃區", count: 52 },
  { name: "水湳經貿園區", count: 28 },
  { name: "7期重劃區", count: 22 },
  { name: "13期重劃區", count: 21 },
  { name: "單元12", count: 19 },
];

export default function HomeStyle1Demo() {
  const { allProjects } = useProjects();
  const { data: site } = useSiteContent();
  const home = site?.home;
  const heroImage = home?.skylineImage ?? DEFAULT_HERO;
  const skylineImage = home?.skylineImage ?? DEFAULT_SKYLINE;
  const consultationImage = home?.consultationImage ?? DEFAULT_CONSULTATION;
  const lineUrl = home?.lineUrl ?? DEFAULT_LINE;
  const featuredNames = home?.featuredProjectNames?.length ? home.featuredProjectNames : DEFAULT_FEATURED_NAMES;
  const featured = allProjects.filter((p) => featuredNames.includes(p.建案名稱)).slice(0, 6);
  const displayFeatured = featured.length >= 4 ? featured : allProjects.filter((p) => p.slogans?.地段價值 && p.units?.total > 50).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Demo 導覽條 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 text-xs py-2 px-4 flex items-center justify-between"
      >
        <Link href="/demo/home-styles">
          <a className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors">
            <ArrowLeft className="w-3 h-3" /> 風格總覽
          </a>
        </Link>
        <span className="text-amber-300/90">Demo 1 · 高端房產品牌</span>
      </motion.div>

      {/* Hero：全幅大圖、動效、金橙漸層 CTA */}
      <section className="relative h-[75vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-amber-900/30" />
        </div>
        {/* 裝飾光點 */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl" />
        <div className="relative z-10 text-center px-4">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400/20 text-amber-200 text-sm font-medium mb-6 border border-amber-400/30"
          >
            <Sparkles className="w-4 h-4" /> 永慶不動產 西屯未來店
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg"
          >
            台中建案
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-lg text-white/90 max-w-md mx-auto"
          >
            專業整理，一站瀏覽與比較
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-10"
          >
            <Link href="/projects">
              <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold rounded-full px-8 py-6 text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-200">
                瀏覽建案
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 熱區：活潑列表、hover 動效 */}
      <section className="py-20 md:py-28">
        <div className="container max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-slate-800 mb-2 flex items-center gap-2"
          >
            <span className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
            熱門重劃區
          </motion.h2>
          <p className="text-slate-500 text-sm mb-12">快速進入關注區域</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {HOT_ZONES.map((z, i) => (
              <motion.div
                key={z.name}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/projects?zone=${encodeURIComponent(z.name)}`}>
                  <a className="block py-4 px-4 rounded-xl border border-slate-200 group hover:border-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-all duration-200">
                    <span className="font-medium text-slate-800 group-hover:text-amber-600 transition-colors">{z.name}</span>
                    <span className="text-amber-500 font-semibold text-sm ml-2">{z.count} 案</span>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 精選建案：進場動畫、hover 活潑 */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                精選建案
              </h2>
              <p className="text-slate-500 text-sm mt-1">嚴選優質建案</p>
            </div>
            <Link href="/projects">
              <a className="text-sm font-medium text-slate-600 hover:text-amber-600 flex items-center gap-1 transition-colors group">
                查看全部 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayFeatured.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group/card"
              >
                <div className="transition-transform duration-300 group-hover/card:-translate-y-1">
                  <ProjectCard project={p} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 關於：單欄、大圖＋簡短文案 */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <img src={consultationImage} alt="專業諮詢" className="w-full aspect-[4/3] object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">關於我們</p>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-800">您的台中購屋夥伴</h2>
              <p className="text-slate-600 mt-6 leading-relaxed">
                陳學韜，永慶不動產西屯未來店。深耕台中房市，熟悉各重劃區發展與建案特色，為您提供專業購屋建議。
              </p>
              <div className="mt-8 flex gap-4">
                <Button asChild className="bg-slate-800 hover:bg-slate-900 rounded-none px-6">
                  <a href={lineUrl} target="_blank" rel="noopener noreferrer">Line 預約</a>
                </Button>
                <Link href="/about">
                  <Button variant="outline" className="rounded-none border-slate-300 text-slate-700">了解更多</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA：全幅圖、漸層按鈕＋動效 */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={skylineImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-800/60 to-amber-900/20" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_50%_80%,rgba(251,191,36,0.15),transparent_60%)]" />
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white drop-shadow-md">從 {allProjects.length} 個建案中，找到您的理想家</h2>
          <Link href="/projects">
            <Button className="mt-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-semibold rounded-full px-8 py-6 shadow-lg shadow-amber-500/30 hover:scale-105 transition-transform duration-200">
              開始瀏覽
            </Button>
          </Link>
        </div>
      </section>

      {/* 頁尾導覽 */}
      <div className="border-t border-slate-200 py-4">
        <div className="container flex justify-between text-sm text-slate-500">
          <Link href="/demo/home-styles"><a className="hover:text-slate-800">← 風格總覽</a></Link>
          <Link href="/"><a className="hover:text-slate-800">回首頁</a></Link>
        </div>
      </div>
    </div>
  );
}
