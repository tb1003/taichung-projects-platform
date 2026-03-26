/**
 * 首頁風格 Demo 3：在地生活／故事感 — 活潑版（飽和暖色＋動效＋裝飾）
 * 路徑：/demo/home-style-3
 */
import { Link } from "wouter";
import { ArrowRight, Heart, Users, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useSiteContent } from "@/hooks/useSiteContent";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/hero-opening_c6e5cdbc.jpeg";
const DEFAULT_CONSULTATION = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/real-estate-consultation-7cGkbCY8HTENe5HpHUNiYg.webp";
const DEFAULT_COMMUNITY = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-park-community-EGrfCxm52KjhU3K2vsb5kz.webp";
const DEFAULT_LINE = "https://line.me/R/ti/p/@368bruzx";
const DEFAULT_FEATURED_NAMES = ["勤美之森", "寶輝花園紀", "惠宇大聚", "國泰聚", "雙橡園S1", "總太織築"];

const HOT_ZONES = [
  { name: "機捷特區", count: 54 },
  { name: "14期重劃區", count: 52 },
  { name: "水湳經貿園區", count: 28 },
  { name: "7期重劃區", count: 22 },
  { name: "13期重劃區", count: 21 },
  { name: "單元12", count: 19 },
  { name: "12期重劃區", count: 15 },
  { name: "烏日高鐵特區", count: 13 },
];

export default function HomeStyle3Demo() {
  const { allProjects } = useProjects();
  const { data: site } = useSiteContent();
  const home = site?.home;
  const heroImage = home?.heroImage ?? DEFAULT_HERO;
  const consultationImage = home?.consultationImage ?? DEFAULT_CONSULTATION;
  const communityImage = home?.communityImage ?? DEFAULT_COMMUNITY;
  const lineUrl = home?.lineUrl ?? DEFAULT_LINE;
  const featuredNames = home?.featuredProjectNames?.length ? home.featuredProjectNames : DEFAULT_FEATURED_NAMES;
  const featured = allProjects.filter((p) => featuredNames.includes(p.建案名稱)).slice(0, 6);
  const displayFeatured = featured.length >= 4 ? featured : allProjects.filter((p) => p.slogans?.地段價值 && p.units?.total > 50).slice(0, 6);

  return (
    <div className="min-h-screen bg-amber-50/50">
      {/* Demo 導覽條 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs py-2 px-4 flex items-center justify-between"
      >
        <Link href="/demo/home-styles">
          <a className="inline-flex items-center gap-1 hover:text-amber-100">← 風格總覽</a>
        </Link>
        <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Demo 3 · 在地生活</span>
      </motion.div>

      {/* Hero：飽和暖色、光暈、動效按鈕 */}
      <section className="relative overflow-hidden rounded-b-[2rem] shadow-2xl">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/85 via-amber-800/50 to-orange-400/20" />
        </div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-amber-400/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full blur-3xl" />
        <div className="container relative z-10 py-20 md:py-28">
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400/25 text-amber-50 text-sm font-medium mb-5 border border-amber-300/40 shadow-lg"
            >
              <Heart className="w-4 h-4" />
              永慶不動產 西屯未來店
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-md"
            >
              在台中，找到屬於你的家
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-lg text-amber-50/95"
            >
              我是陳學韜，在這裡幫您整理 {allProjects.length}+ 個建案，用最接地氣的方式帶您看遍西屯與台中的好房子。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/projects">
                <Button className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-semibold rounded-full px-7 py-6 text-base shadow-xl shadow-amber-600/30 hover:scale-105 hover:shadow-amber-500/40 transition-all duration-200">
                  逛逛建案
                </Button>
              </Link>
              <Button asChild variant="outline" className="rounded-full border-2 border-amber-200 text-white hover:bg-amber-500/30 px-6 hover:border-amber-300 transition-all">
                <a href={lineUrl} target="_blank" rel="noopener noreferrer">Line 跟我聊</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 熱區：圓角卡、hover 彈跳、飽和色 */}
      <section className="py-14 md:py-20">
        <div className="container">
          <h2 className="text-2xl font-bold text-amber-900">熱門重劃區</h2>
          <p className="text-amber-800/80 mt-1">一起看看大家最關注的區域</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {HOT_ZONES.map((z, i) => (
              <motion.div
                key={z.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/projects?zone=${encodeURIComponent(z.name)}`}>
                  <a className="block p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-md hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 hover:bg-amber-50/80 transition-all duration-300 text-center">
                    <p className="font-semibold text-amber-900">{z.name}</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{z.count}</p>
                    <p className="text-xs text-amber-700/70">個建案</p>
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 精選建案：進場動畫、hover 上浮 */}
      <section className="py-14 md:py-20 bg-white/70 rounded-3xl mx-4 md:mx-6 shadow-inner">
        <div className="container">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-amber-900">精選建案</h2>
              <p className="text-amber-800/80 mt-1">為您挑選的優質建案</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="rounded-full gap-1 border-amber-400 text-amber-800 hover:bg-amber-100 hover:border-amber-500 transition-all">
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

      {/* 關於：大區塊、故事感 */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-amber-100/50 to-amber-50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
              <img src={consultationImage} alt="陳學韜與客戶" className="w-full rounded-3xl shadow-xl" />
              <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden md:block">
                <img src={communityImage} alt="社區" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-200/50 text-amber-900 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                關於我們
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-amber-900">
                您的台中購屋好夥伴
              </h2>
              <p className="text-amber-900/80 mt-4 leading-relaxed text-base">
                陳學韜，永慶不動產西屯未來店的專業經紀人。深耕台中房地產市場，熟悉各重劃區的發展脈動與建案特色。無論您是首購族、換屋族還是投資客，我都能為您提供最專業、最貼心的購屋建議。
              </p>
              <div className="mt-8 flex gap-4">
                <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 gap-2 shadow-md">
                  <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4" />
                    Line 預約諮詢
                  </a>
                </Button>
                <Link href="/about">
                  <Button variant="outline" className="rounded-full border-amber-400 text-amber-800 hover:bg-amber-100 px-6">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA：漸層＋光暈、按鈕動效 */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="container relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">找到您的理想家園</h2>
          <p className="text-amber-100 mt-2">從 {allProjects.length} 個建案開始，我陪您一起挑</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link href="/projects">
              <Button className="bg-amber-300 hover:bg-amber-200 text-amber-950 font-semibold rounded-full px-6 shadow-lg hover:scale-105 transition-transform">
                開始瀏覽建案
              </Button>
            </Link>
            <Button asChild variant="outline" className="rounded-full text-amber-50 border-2 border-amber-200/80 hover:bg-amber-500/30">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer">聯絡學韜</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-amber-200/50 py-4 bg-amber-50/30">
        <div className="container flex justify-between text-sm text-amber-800/70">
          <Link href="/demo/home-styles"><a className="hover:text-amber-900">← 風格總覽</a></Link>
          <Link href="/"><a className="hover:text-amber-900">回首頁</a></Link>
        </div>
      </div>
    </div>
  );
}
