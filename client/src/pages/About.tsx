/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * About: 關於學韜 / 永慶不動產西屯未來店（內容可由後台網站設定）
 * 含團隊成員介紹（電子名片），可連結 591／銷售平台
 */
import { Link } from "wouter";
import { MapPin, Phone, Building2, Users, Star, Award, ExternalLink, Palette, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";

const DEFAULT_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/hero-opening_c6e5cdbc.jpeg";
const DEFAULT_LINE = "https://lin.ee/OQ9zdLK";
const DEFAULT_VALUES = [
  { icon: Star, title: "專業分析", desc: "深度了解每個建案的優勢與特色，提供客觀的市場分析與建議。" },
  { icon: Users, title: "以客為尊", desc: "傾聽您的需求，量身推薦最適合的建案，陪伴您完成人生重要決定。" },
  { icon: Award, title: "在地深耕", desc: "熟悉台中各區域發展脈動，掌握最新建案資訊與市場趨勢。" },
];

/** 依電子名片樣式（1–10）回傳對應的卡片視覺，與 Demo 風格一致 */
function getCardStyleForECard(styleKey: string): {
  card: string;
  cardTop: string | null;
  photoRing: string;
  nameClass: string;
  titleClass: string;
  tagClass: string;
  btnClass: string;
} {
  const key = (styleKey || "1").toString();
  const styles: Record<string, ReturnType<typeof getCardStyleForECard>> = {
    "1": {
      card: "bg-white rounded-b-[1.5rem] border border-slate-200 overflow-hidden shadow-lg",
      cardTop: "h-16 bg-gradient-to-br from-blue-600 via-blue-500 to-teal-400",
      photoRing: "border-4 border-white shadow-xl ring-2 ring-blue-500/20",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-blue-500/10 text-blue-700",
      btnClass: "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white",
    },
    "2": {
      card: "bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden",
      cardTop: null,
      photoRing: "border border-slate-100 shadow-sm",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-slate-100 text-slate-700",
      btnClass: "bg-slate-800 hover:bg-slate-700 text-white",
    },
    "3": {
      card: "bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl",
      cardTop: null,
      photoRing: "ring-2 ring-amber-500/50 border-2 border-slate-700",
      nameClass: "text-white",
      titleClass: "text-amber-400",
      tagClass: "bg-amber-500/20 text-amber-300",
      btnClass: "bg-amber-500 hover:bg-amber-400 text-slate-900",
    },
    "4": {
      card: "bg-white rounded-2xl border border-amber-100 shadow-md overflow-hidden",
      cardTop: "h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/10",
      photoRing: "border-4 border-amber-200/80 shadow-sm",
      nameClass: "text-amber-900",
      titleClass: "text-amber-700",
      tagClass: "bg-amber-100 text-amber-800",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    "5": {
      card: "bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden",
      cardTop: null,
      photoRing: "border-2 border-slate-200 shadow-md",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-slate-100 text-slate-700",
      btnClass: "bg-slate-800 hover:bg-slate-700 text-white",
    },
    "6": {
      card: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden",
      cardTop: null,
      photoRing: "border border-slate-100",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-slate-100 text-slate-600",
      btnClass: "bg-slate-800 hover:bg-slate-700 text-white",
    },
    "7": {
      card: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden",
      cardTop: null,
      photoRing: "border-2 border-slate-200",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-slate-100 text-slate-700",
      btnClass: "bg-slate-800 hover:bg-slate-700 text-white",
    },
    "8": {
      card: "bg-white rounded-2xl border-l-4 border-l-primary border border-slate-200 shadow-sm overflow-hidden",
      cardTop: null,
      photoRing: "border-2 border-slate-200",
      nameClass: "text-slate-900",
      titleClass: "text-slate-500",
      tagClass: "bg-primary/10 text-primary",
      btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    "9": {
      card: "bg-slate-800 rounded-3xl border border-slate-600 shadow-2xl overflow-hidden",
      cardTop: null,
      photoRing: "ring-4 ring-white/30 shadow-lg",
      nameClass: "text-white drop-shadow-sm",
      titleClass: "text-slate-300",
      tagClass: "bg-white/20 text-slate-200 border border-white/20",
      btnClass: "bg-white/20 hover:bg-white/30 border border-white/30 text-white font-medium",
    },
    "10": {
      card: "bg-white rounded-2xl border border-slate-100 overflow-hidden",
      cardTop: null,
      photoRing: "border-2 border-slate-200",
      nameClass: "text-slate-900 font-black tracking-tight",
      titleClass: "text-slate-500 font-medium",
      tagClass: "border border-slate-200 text-slate-500",
      btnClass: "bg-slate-900 hover:bg-slate-800 text-white",
    },
  };
  return styles[key] || styles["1"];
}

export default function About() {
  const { data: site } = useSiteContent();
  const a = site?.about;
  const heroImage = a?.heroImage ?? DEFAULT_HERO;
  const subtitle = a?.subtitle ?? "永慶不動產西屯未來店 | 五義地產 | 陳學韜";
  const storeName = a?.storeName ?? "永慶不動產 西屯未來店";
  const storeSub = a?.storeSub ?? "五義地產";
  const address = a?.address ?? "台中市西屯區西屯路二段248號";
  const phone = a?.phone ?? "陳學韜 0970-090-223";
  const lineUrl = a?.lineUrl ?? DEFAULT_LINE;
  const values = (a?.values?.length ? a.values : DEFAULT_VALUES.map((v) => ({ title: v.title, desc: v.desc }))).slice(0, 3);
  const platformIntro = a?.platformIntro ?? "本平台收錄台中市超過 400 個建案的詳細資訊，涵蓋 14 期重劃區、13 期重劃區、水湳經貿園區、機捷特區、單元 12 等熱門區域。每個建案均經過 AI 深度分析，提供五大優勢標語（地段價值、品牌建築、生活環境、生活機能、產品特色），並支援多建案橫向比較功能，幫助您快速找到理想的家園。";
  const platformDisclaimer = a?.platformDisclaimer ?? "資料來源：大橘團隊 dajuteam.com.tw。所有建案資訊僅供參考，實際以建商公告及買賣契約為準。";
  const ctaText = a?.ctaText ?? "有任何購屋問題？歡迎隨時聯絡學韜";
  const teamMembers = (a?.teamMembers ?? []).filter((m) => m.name?.trim()).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#3D3529]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="永慶不動產西屯未來店" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3D3529] via-[#3D3529]/60 to-transparent" />
        </div>
        <div className="container relative z-10 py-20 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">關於我們</h1>
          <p className="text-white/60 mt-3 text-sm max-w-lg mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Store Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground">{storeName}</h2>
                <p className="text-xs text-muted-foreground">{storeSub}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                {address}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                {phone}
              </div>
            </div>
          </div>

          {/* 團隊成員（電子名片） */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-foreground">團隊成員</h2>
              <Link href="/demo/about-team">
                <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <Palette className="w-4 h-4" /> 10 款電子名片風格 Demo
                </a>
              </Link>
            </div>
          {teamMembers.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((m, i) => {
                  const photo = (m.photos && m.photos[0]) || m.photo;
                  const licenseText = (m.licenses && m.licenses[0]?.text) || m.license;
                  const storeLinks = (m.storeLinks && m.storeLinks.length > 0) ? m.storeLinks : (m.storeUrl ? [{ name: m.storeLabel || "店鋪", url: m.storeUrl }] : []);
                  const cardStyle = getCardStyleForECard(m.eCardStyle ?? "1");
                  const isDark = (m.eCardStyle ?? "1") === "3" || (m.eCardStyle ?? "1") === "9";
                  return (
                  <div key={i} className={`${cardStyle.card} flex flex-col items-center text-center`}>
                    {cardStyle.cardTop && <div className={cardStyle.cardTop} />}
                    <div className="p-5 flex flex-col items-center flex-1 w-full">
                    {/* 電子名片照片 */}
                    {photo ? (
                      <img src={photo} alt={m.name} className={`w-24 h-24 rounded-full object-cover shrink-0 ${cardStyle.photoRing}`} />
                    ) : (
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-white/10" : "bg-primary/10"}`}>
                        <Users className={`w-10 h-10 ${isDark ? "text-amber-400" : "text-primary"}`} />
                      </div>
                    )}
                    {/* 姓名 */}
                    <h3 className={`font-semibold mt-4 text-lg ${cardStyle.nameClass}`}>{m.name}</h3>
                    {/* 職稱 */}
                    {m.title && <p className={`text-sm mt-1 ${cardStyle.titleClass}`}>{m.title}</p>}
                    {licenseText && <p className={`text-[11px] mt-0.5 ${cardStyle.titleClass} opacity-90`}>不動產經紀人 · {licenseText}</p>}
                    {/* 五大服務優勢標籤（有填才顯示） */}
                    {m.serviceAdvantages && m.serviceAdvantages.filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                        {m.serviceAdvantages.filter(Boolean).map((s, j) => (
                          <span key={j} className={`px-2 py-0.5 rounded-full text-[11px] ${cardStyle.tagClass}`}>{s}</span>
                        ))}
                      </div>
                    )}
                    {/* 電子名片（主按鈕）＋ 下方保留商舖平台選單 */}
                    <div className="mt-4 w-full space-y-2">
                      <Button asChild size="sm" className={`rounded-full gap-1.5 w-full sm:w-auto ${cardStyle.btnClass}`}>
                        <Link href={`/about/card/${i}`}>
                          <a className="inline-flex items-center gap-1.5">
                            電子名片 <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </Link>
                      </Button>
                      {(m.lineUrl || storeLinks.length > 0) && (
                        <div className="flex flex-wrap justify-center gap-2">
                          {m.lineUrl && (
                            <Button asChild size="sm" variant="outline" className={`rounded-full text-xs gap-1 font-medium ${isDark ? "border-white/40 text-white hover:bg-white/10" : "bg-[#06C755]/15 border-[#06C755] text-[#058038] hover:bg-[#06C755]/25"}`}>
                              <a href={m.lineUrl} target="_blank" rel="noopener noreferrer">Line</a>
                            </Button>
                          )}
                          {storeLinks.map((s, j) => (
                            <Button key={j} asChild size="sm" variant="outline" className={`rounded-full text-xs gap-1 font-medium ${isDark ? "border-white/40 text-white hover:bg-white/10" : "border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100"}`}>
                              <a href={s.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                                {s.name || "店鋪"}
                              </a>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
          {teamMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              尚未設定團隊成員。可至後台「團隊成員」新增，或先參考{" "}
              <Link href="/demo/about-team"><a className="text-primary hover:underline">10 款電子名片風格 Demo</a></Link>。
            </p>
          )}
          </div>

          {/* Values */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-5">我們的服務理念</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {values.map((item, i) => {
                const Icon = DEFAULT_VALUES[i]?.icon ?? Star;
                return (
                  <div key={item.title || i} className="bg-card rounded-xl border border-border p-5 text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-card-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Platform Info */}
          <div className="bg-muted/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">關於本平台</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {platformIntro}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              {platformDisclaimer}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {ctaText}
            </p>
            <Button asChild className="bg-[#06C755] hover:bg-[#05b34d] text-white gap-2 rounded-full px-8">
              <a href={lineUrl} target="_blank" rel="noopener noreferrer">
                <Phone className="w-4 h-4" />
                Line 預約諮詢
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
