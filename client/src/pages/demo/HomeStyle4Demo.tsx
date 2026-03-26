/**
 * 首頁風格 Demo 4：參考 陳安森｜台中好建築 編排
 * https://0979616027.com/
 * 編排：主標＋雙行副標 → 最新好案推薦＋橫向分類 → 社群／聯絡
 * 路徑：/demo/home-style-4
 */
import { Link } from "wouter";
import { Building2, MapPin, Phone, FileText } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useSiteContent } from "@/hooks/useSiteContent";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp";
const DEFAULT_LINE = "https://line.me/R/ti/p/@368bruzx";
const DEFAULT_FEATURED_NAMES = ["勤美之森", "寶輝花園紀", "惠宇大聚", "國泰聚", "雙橡園S1", "總太織築"];

const CATEGORIES = [
  { key: "all", label: "全部建案", href: "/projects" },
  { key: "zone", label: "機捷特區", href: "/projects?zone=機捷特區" },
  { key: "zone", label: "14期重劃區", href: "/projects?zone=14期重劃區" },
  { key: "zone", label: "水湳經貿園區", href: "/projects?zone=水湳經貿園區" },
  { key: "zone", label: "7期重劃區", href: "/projects?zone=7期重劃區" },
  { key: "zone", label: "13期重劃區", href: "/projects?zone=13期重劃區" },
];

export default function HomeStyle4Demo() {
  const { allProjects } = useProjects();
  const { data: site } = useSiteContent();
  const home = site?.home;
  const heroImage = home?.skylineImage ?? DEFAULT_HERO;
  const lineUrl = home?.lineUrl ?? DEFAULT_LINE;
  const featuredNames = home?.featuredProjectNames?.length ? home.featuredProjectNames : DEFAULT_FEATURED_NAMES;
  const featured = allProjects.filter((p) => featuredNames.includes(p.建案名稱)).slice(0, 6);
  const displayFeatured = featured.length >= 4 ? featured : allProjects.filter((p) => p.slogans?.地段價值 && p.units?.total > 50).slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Demo 導覽條 */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-2 px-4 flex items-center justify-between">
        <Link href="/demo/home-styles">
          <a className="inline-flex items-center gap-1 hover:text-white">← 風格總覽</a>
        </Link>
        <span>Demo 4 · 參考 0979616027.com 編排</span>
      </div>

      {/* Hero：主標 ＋ 雙行副標（陳安森式） */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 py-20">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-neutral-900/65" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight"
          >
            從學韜視角，帶您發現台中建築美學
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 md:mt-8 text-lg md:text-xl text-neutral-200 leading-relaxed"
          >
            用整理的功夫，看見建案價值；
            <br className="hidden sm:block" />
            用房仲的專業，實現家的夢想。
          </motion.p>
        </div>
      </section>

      {/* 最新好案推薦 ＋ 橫向分類（對應 0979616027 的 architecture / street / ...） */}
      <section className="py-16 md:py-24 border-t border-neutral-200">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-10">
            最新好案推薦
          </h2>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
            {CATEGORIES.map((c) => (
              <Link key={c.href + c.label} href={c.href}>
                <a className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors">
                  {c.label}
                </a>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatured.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/projects">
              <a className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 font-medium text-sm">
                查看全部建案
                <span aria-hidden>→</span>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* 社群／聯絡區（對應 0979616027 的 Facebook Instagram Line） */}
      <section className="py-12 md:py-16 bg-neutral-100 border-t border-neutral-200">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#06C755] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Phone className="w-4 h-4" />
              Line
            </a>
            <Link href="/about">
              <a className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white hover:border-neutral-400 transition-colors">
                <FileText className="w-4 h-4" />
                關於我們
              </a>
            </Link>
            <Link href="/projects">
              <a className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white hover:border-neutral-400 transition-colors">
                <Building2 className="w-4 h-4" />
                建案總覽
              </a>
            </Link>
            <Link href="/zones">
              <a className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-white hover:border-neutral-400 transition-colors">
                <MapPin className="w-4 h-4" />
                重劃區
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* 頁尾（簡潔，對應 0979616027 的 Copyright） */}
      <footer className="py-8 border-t border-neutral-200">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="/about"><a className="hover:text-neutral-800">關於</a></Link>
            <Link href="/projects"><a className="hover:text-neutral-800">建案總覽</a></Link>
            <Link href="/tools"><a className="hover:text-neutral-800">房產工具</a></Link>
            <a href={lineUrl} target="_blank" rel="noopener noreferrer" className="hover:text-neutral-800">聯絡我</a>
          </nav>
          <p>© {new Date().getFullYear()} 陳學韜 · 永慶不動產西屯未來店</p>
        </div>
      </footer>

      <div className="border-t border-neutral-200 py-3 bg-neutral-50">
        <div className="container flex justify-between text-xs text-neutral-500">
          <Link href="/demo/home-styles"><a className="hover:text-neutral-800">← 風格總覽</a></Link>
          <Link href="/"><a className="hover:text-neutral-800">回首頁</a></Link>
        </div>
      </div>
    </div>
  );
}
