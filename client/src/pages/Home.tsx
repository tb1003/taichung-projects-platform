/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * Home: 首頁 - 英雄區（開幕照）→ 熱區快選 → 精選建案 → 關於學韜（內容可由後台網站設定）
 */
import { Link } from "wouter";
import { ArrowRight, Building2, MapPin, Search, Users, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useSiteContent } from "@/hooks/useSiteContent";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";
import { useState } from "react";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/hero-opening_c6e5cdbc.jpeg";
const DEFAULT_SKYLINE = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_CONSULTATION = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/real-estate-consultation-7cGkbCY8HTENe5HpHUNiYg.webp";
const DEFAULT_COMMUNITY = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-park-community-EGrfCxm52KjhU3K2vsb5kz.webp";
const DEFAULT_LINE = "https://line.me/R/ti/p/@368bruzx";

const HOT_ZONES = [
  { name: "機捷特區", count: 54, color: "from-blue-500 to-cyan-500" },
  { name: "14期重劃區", count: 52, color: "from-amber-500 to-orange-500" },
  { name: "水湳經貿園區", count: 28, color: "from-emerald-500 to-teal-500" },
  { name: "7期重劃區", count: 22, color: "from-rose-500 to-pink-500" },
  { name: "13期重劃區", count: 21, color: "from-violet-500 to-purple-500" },
  { name: "單元12", count: 19, color: "from-sky-500 to-indigo-500" },
  { name: "12期重劃區", count: 15, color: "from-teal-500 to-emerald-500" },
  { name: "烏日高鐵特區", count: 13, color: "from-orange-500 to-amber-500" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

/** 從完工日期字串解析出完工時間（用於判斷屋齡一年內） */
function getCompletionTime(完工日期: string | null | undefined): number | null {
  if (!完工日期 || typeof 完工日期 !== "string") return null;
  const s = 完工日期.trim();
  if (!s || /工程中|資料不足|無法確認/i.test(s)) return null;
  const ymd = s.match(/^(20\d{2})-(0?[1-9]|1[0-2])(?:-(0?[1-9]|[12]\d|3[01]))?/);
  if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]) || 1).getTime();
  const yearOnly = s.match(/^(20\d{2}|19\d{2})年?/);
  if (yearOnly) return new Date(Number(yearOnly[1]), 0, 1).getTime();
  const roc = s.match(/(\d{2,3})年/);
  if (roc) {
    const rocYear = Number(roc[1]);
    const ad = rocYear >= 100 ? 1911 + rocYear : 1911 + rocYear;
    return new Date(ad, 0, 1).getTime();
  }
  return null;
}

/** 是否為屋齡一年內（完工日距今 12 個月內） */
function isCompletedWithinOneYear(完工日期: string | null | undefined): boolean {
  const t = getCompletionTime(完工日期);
  if (t == null) return false;
  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
  return t >= oneYearAgo;
}

export default function Home() {
  const { allProjects } = useProjects();
  const { data: site } = useSiteContent();
  const [searchQuery, setSearchQuery] = useState("");

  const home = site?.home;
  const heroImage = home?.heroImage ?? DEFAULT_HERO;
  const heroBadge = home?.heroBadge ?? "永慶不動產 西屯未來店";
  const heroTitle = home?.heroTitle ?? "台中建案";
  const heroHighlight = home?.heroHighlight ?? "導覽與比較";
  const heroSuffix = home?.heroSuffix ?? "平台";
  const heroDesc = home?.heroDesc ?? `精心整理台中市 {{count}} 個建案，涵蓋 14 期、水湳、機捷等熱門重劃區。一站式瀏覽、比較，找到您的理想家園。`;
  const aboutBadge = home?.aboutSectionBadge ?? "關於我們";
  const aboutTitle = home?.aboutSectionTitle ?? "您的台中購屋好夥伴";
  const aboutDesc = home?.aboutSectionDesc ?? "陳學韜，永慶不動產西屯未來店的專業經紀人。深耕台中房地產市場，熟悉各重劃區的發展脈動與建案特色。無論您是首購族、換屋族還是投資客，我都能為您提供最專業、最貼心的購屋建議。";
  const ctaTitle = home?.ctaTitle ?? "找到您的理想家園";
  const ctaDesc = home?.ctaDesc ?? "瀏覽 {{count}} 個台中建案，使用比較功能找出最適合您的選擇";
  const skylineImage = home?.skylineImage ?? DEFAULT_SKYLINE;
  const consultationImage = home?.consultationImage ?? DEFAULT_CONSULTATION;
  const communityImage = home?.communityImage ?? DEFAULT_COMMUNITY;
  const lineUrl = home?.lineUrl ?? DEFAULT_LINE;
  const featuredNames = home?.featuredProjectNames?.length ? home.featuredProjectNames : null;

  // 精選建案：後台有指定則用指定名單；否則預設為 1.熱門重劃區 2.屋齡一年內 3.戶數最多
  const hotZoneNames = new Set(HOT_ZONES.map((z) => z.name));
  const defaultFeatured =
    allProjects
      .filter(
        (p) =>
          p.重劃區 && hotZoneNames.has(p.重劃區) && isCompletedWithinOneYear(p.完工日期) && (p.units?.total ?? 0) > 0
      )
      .sort((a, b) => (b.units?.total ?? 0) - (a.units?.total ?? 0))
      .slice(0, 6);

  const featured = featuredNames
    ? allProjects.filter((p) => featuredNames.includes(p.建案名稱)).slice(0, 6)
    : defaultFeatured;

  const displayFeatured = featured.length >= 4 ? featured : defaultFeatured;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-[#3D3529]">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="永慶不動產西屯未來店開幕"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D3529]/90 via-[#3D3529]/70 to-[#3D3529]/50" />
        </div>

        <div className="container relative z-10 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
                <Star className="w-3 h-3" />
                {heroBadge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              {heroTitle}
              <span className="highlight-marker" style={{ background: "linear-gradient(180deg, transparent 60%, rgba(255,184,0,0.4) 60%)" }}>
                {heroHighlight}
              </span>
              {heroSuffix}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 mt-4 text-base md:text-lg leading-relaxed"
            >
              {heroDesc.split(/\{\{\s*count\s*\}\}/).map((part, i) => (
                <span key={i}>
                  {i > 0 && <strong className="text-primary font-semibold">{allProjects.length}</strong>}
                  {part}
                </span>
              ))}
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex gap-2"
            >
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜尋建案名稱、建設公司、地址..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                搜尋
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex gap-6"
            >
              <div>
                <p className="text-2xl font-bold text-primary" style={{ fontFamily: "DM Sans" }}>{allProjects.length}+</p>
                <p className="text-xs text-white/50">建案收錄</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary" style={{ fontFamily: "DM Sans" }}>13</p>
                <p className="text-xs text-white/50">行政區</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary" style={{ fontFamily: "DM Sans" }}>14+</p>
                <p className="text-xs text-white/50">重劃區</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== HOT ZONES ===== */}
      <section className="py-14 md:py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-10"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-2xl md:text-3xl font-bold text-foreground">
              熱門重劃區
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-2 text-sm">
              快速瀏覽台中市最受關注的重劃區建案
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {HOT_ZONES.map((zone, i) => (
              <motion.div key={zone.name} variants={fadeUp} custom={i + 2}>
                <Link href={`/projects?zone=${encodeURIComponent(zone.name)}`}>
                  <div className="group relative overflow-hidden rounded-xl p-5 bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 text-center">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${zone.color}`} />
                    <h3 className="font-semibold text-base text-card-foreground group-hover:text-primary/90 transition-colors">
                      {zone.name}
                    </h3>
                    <p className="text-xl font-bold mt-1.5" style={{ fontFamily: "DM Sans", color: "#9a7b00" }}>
                      {zone.count}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">個建案</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="py-14 md:py-20 bg-secondary/30">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">精選建案</h2>
              <p className="text-muted-foreground mt-1 text-sm">為您推薦的優質建案</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm" className="gap-1 rounded-full">
                查看全部
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayFeatured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="py-14 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Image */}
            <div className="relative">
              <img
                src={consultationImage}
                alt="專業諮詢服務"
                className="w-full rounded-2xl shadow-lg"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl overflow-hidden shadow-lg hidden lg:block">
                <img
                  src={communityImage}
                  alt="社區環境"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium mb-4" style={{ color: "#9a7b00" }}>
                <Users className="w-3 h-3" />
                {aboutBadge}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {aboutTitle}
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed text-sm">
                {aboutDesc}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border">
                  <Building2 className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-card-foreground">專業建案分析</p>
                  <p className="text-xs text-muted-foreground mt-1">深度了解每個建案的優勢與特色</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border">
                  <MapPin className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-semibold text-card-foreground">在地深耕</p>
                  <p className="text-xs text-muted-foreground mt-1">熟悉台中各區域發展與潛力</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button asChild className="bg-[#06C755] hover:bg-[#05b34d] text-white gap-2 rounded-full px-6">
                  <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-4 h-4" />
                    Line 預約諮詢
                  </a>
                </Button>
                <Link href="/about">
                  <Button variant="outline" className="rounded-full px-6">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={skylineImage} alt="台中天際線" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#3D3529]/80" />
        </div>
        <div className="container relative z-10 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {ctaTitle}
          </h2>
          <p className="text-white/70 mt-3 text-sm max-w-lg mx-auto">
            {ctaDesc.split(/\{\{\s*count\s*\}\}/).map((part, i) => (
              <span key={i}>
                {i > 0 && allProjects.length}
                {part}
              </span>
            ))}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/projects">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full px-6">
                <Search className="w-4 h-4" />
                開始瀏覽建案
              </Button>
            </Link>
            <Button asChild variant="outline" className="text-white border-white/30 hover:bg-white/10 rounded-full px-6">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                聯絡學韜
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
