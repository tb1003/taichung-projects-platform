/**
 * 首頁風格 Demo 2：現代 SaaS／平台感 — 活潑版（多色漸層＋動效）
 * 路徑：/demo/home-style-2
 */
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Search, Building2, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useSiteContent } from "@/hooks/useSiteContent";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_SKYLINE = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_CONSULTATION = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/real-estate-consultation-7cGkbCY8HTENe5HpHUNiYg.webp";
const DEFAULT_LINE = "https://lin.ee/OQ9zdLK";
const DEFAULT_FEATURED_NAMES = ["勤美之森", "寶輝花園紀", "惠宇大聚", "國泰聚", "雙橡園S1", "總太織築"];

const HOT_ZONES = [
  { name: "機捷特區", count: 54, gradient: "from-blue-500 to-cyan-400" },
  { name: "14期重劃區", count: 52, gradient: "from-violet-500 to-purple-400" },
  { name: "水湳經貿園區", count: 28, gradient: "from-emerald-500 to-teal-400" },
  { name: "7期重劃區", count: 22, gradient: "from-rose-500 to-pink-400" },
  { name: "13期重劃區", count: 21, gradient: "from-amber-500 to-orange-400" },
  { name: "單元12", count: 19, gradient: "from-indigo-500 to-blue-400" },
  { name: "12期重劃區", count: 15, gradient: "from-cyan-500 to-teal-400" },
  { name: "烏日高鐵特區", count: 13, gradient: "from-orange-500 to-amber-400" },
];

export default function HomeStyle2Demo() {
  const { allProjects } = useProjects();
  const { data: site } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState("");
  const home = site?.home;
  const skylineImage = home?.skylineImage ?? DEFAULT_SKYLINE;
  const consultationImage = home?.consultationImage ?? DEFAULT_CONSULTATION;
  const lineUrl = home?.lineUrl ?? DEFAULT_LINE;
  const featuredNames = home?.featuredProjectNames?.length ? home.featuredProjectNames : DEFAULT_FEATURED_NAMES;
  const featured = allProjects.filter((p) => featuredNames.includes(p.建案名稱)).slice(0, 6);
  const displayFeatured = featured.length >= 4 ? featured : allProjects.filter((p) => p.slogans?.地段價值 && p.units?.total > 50).slice(0, 6);

  const handleSearch = () => {
    if (searchQuery.trim()) window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Demo 導覽條 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs py-2 px-4 flex items-center justify-between"
      >
        <Link href="/demo/home-styles">
          <a className="inline-flex items-center gap-1 opacity-90 hover:opacity-100">← 風格總覽</a>
        </Link>
        <span className="opacity-90 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Demo 2 · 現代 SaaS</span>
      </motion.div>

      {/* Hero：多色漸層底、活潑搜尋＋數字 */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-violet-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-violet-800 bg-clip-text text-transparent"
            >
              台中建案導覽與比較平台
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-3 text-slate-600"
            >
              {allProjects.length}+ 個建案 · 13 行政區 · 14+ 重劃區，一站式搜尋與比較
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-8 flex gap-2 max-w-lg mx-auto"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜尋建案、建設公司、地址..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all"
                />
              </div>
              <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-2xl px-6 shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform">
                搜尋
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 flex justify-center gap-8 md:gap-12 text-center"
            >
              {[
                [allProjects.length + "+", "建案"],
                ["13", "行政區"],
                ["14+", "重劃區"],
              ].map(([num, label], i) => (
                <div key={label} className="px-4 py-2 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{num}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 熱區：每卡一漸層、hover 彈跳 */}
      <section className="py-14 md:py-20">
        <div className="container">
          <h2 className="text-2xl font-bold text-slate-800">熱門重劃區</h2>
          <p className="text-slate-500 text-sm mt-1">快速瀏覽最受關注的區域建案</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {HOT_ZONES.map((z, i) => (
              <motion.div
                key={z.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/projects?zone=${encodeURIComponent(z.name)}`}>
                  <a className="block p-5 rounded-2xl border-0 bg-white shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${z.gradient} mb-3 rounded-full`} />
                    <p className="font-semibold text-slate-800 group-hover:text-slate-900">{z.name}</p>
                    <p className="text-2xl font-bold mt-1 text-slate-700">{z.count}</p>
                    <p className="text-xs text-slate-400">個建案</p>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 精選建案：進場動畫 */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="container">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">精選建案</h2>
              <p className="text-slate-500 text-sm mt-1">為您推薦的優質建案</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="rounded-2xl gap-1 hover:border-blue-400 hover:text-blue-600 transition-colors">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayFeatured.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="hover:-translate-y-1 transition-transform duration-200"
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 關於：雙欄、小卡 */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <img src={consultationImage} alt="諮詢" className="w-full rounded-2xl shadow-lg" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">您的台中購屋好夥伴</h2>
              <p className="text-slate-600 mt-4 leading-relaxed">
                陳學韜，永慶不動產西屯未來店。深耕台中房市，熟悉各重劃區發展與建案特色，為您提供專業、貼心的購屋建議。
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <Building2 className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">專業建案分析</p>
                  <p className="text-xs text-slate-500 mt-1">深度了解優勢與特色</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <MapPin className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">在地深耕</p>
                  <p className="text-xs text-slate-500 mt-1">熟悉區域發展與潛力</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild className="bg-green-500 hover:bg-green-600 rounded-xl px-6">
                  <a href={lineUrl} target="_blank" rel="noopener noreferrer">Line 預約諮詢</a>
                </Button>
                <Link href="/about">
                  <Button variant="outline" className="rounded-xl">了解更多</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA：漸層＋動效 */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="container relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">找到您的理想家園</h2>
          <p className="text-blue-100 mt-2">瀏覽 {allProjects.length} 個建案，使用比較功能找出最適合的選擇</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link href="/projects">
              <Button className="bg-white text-blue-600 hover:bg-slate-100 rounded-2xl px-6 shadow-lg hover:scale-105 transition-transform">開始瀏覽建案</Button>
            </Link>
            <Button asChild variant="outline" className="text-white border-2 border-white/60 hover:bg-white/20 rounded-2xl">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer">聯絡學韜</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-slate-200 py-4">
        <div className="container flex justify-between text-sm text-slate-500">
          <Link href="/demo/home-styles"><a className="hover:text-slate-800">← 風格總覽</a></Link>
          <Link href="/"><a className="hover:text-slate-800">回首頁</a></Link>
        </div>
      </div>
    </div>
  );
}
