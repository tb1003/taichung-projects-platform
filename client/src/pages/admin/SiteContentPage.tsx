/**
 * 網站設定：頁首／頁尾／關於我們／首頁 內容編輯，儲存至 /api/admin/site-content
 */
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { apiGet, apiPut } from "./api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SiteContent {
  navbar: { brandName: string; brandSub: string; lineUrl: string };
  footer: {
    brandName: string;
    brandSub: string;
    description: string;
    phone: string;
    address: string;
    lineUrl: string;
    disclaimer: string;
    copyright: string;
    brokerInfo: string;
  };
  about: {
    heroImage: string;
    subtitle: string;
    storeName: string;
    storeSub: string;
    address: string;
    phone: string;
    lineUrl: string;
    values: { title: string; desc: string }[];
    platformIntro: string;
    platformDisclaimer: string;
    ctaText: string;
    teamMembers: TeamMemberInAbout[];
  };
  home: {
    heroImage: string;
    skylineImage: string;
    consultationImage: string;
    communityImage: string;
    lineUrl: string;
    heroBadge: string;
    heroTitle: string;
    heroHighlight: string;
    heroSuffix: string;
    heroDesc: string;
    aboutSectionTitle: string;
    aboutSectionDesc: string;
    aboutSectionBadge: string;
    ctaTitle: string;
    ctaDesc: string;
    featuredProjectNames: string[];
  };
}

/** 團隊成員（電子名片）完整欄位，支援舊欄位相容 */
export interface TeamMemberInAbout {
  name: string;
  title?: string;
  order: number;
  /** 舊：單一執照文字 → 新：多筆執照，每筆可含證照圖片 */
  license?: string;
  licenses?: { text: string; imageUrl?: string }[];
  /** 舊：單一大頭照 URL → 新：多張圖片 URL（最多 5 張輪播） */
  photo?: string;
  photos?: string[];
  lineUrl?: string;
  /** 舊：單一店鋪 → 新：多平台，每筆自訂名稱+連結 */
  storeUrl?: string;
  storeLabel?: string;
  storeLinks?: { name: string; url: string }[];
  /** 自我介紹（250 字內，支援 HTML/MD） */
  intro?: string;
  /** 聯絡電話 */
  phone?: string;
  /** 座右銘 */
  motto?: string;
  /** YT 頻道連結 */
  ytChannelUrl?: string;
  /** 歷史成交紀錄 */
  transactionHistory?: string;
  /** 得獎紀錄 */
  awards?: string;
  /** 學歷 */
  education?: { elementary?: string; juniorHigh?: string; highSchool?: string; university?: string; department?: string; graduateSchool?: string };
  /** 工作經歷（可多筆） */
  workExperience?: { company?: string; title?: string; period?: string; desc?: string }[];
  /** 興趣與休閒 */
  interests?: string;
  /** 宗教 */
  religion?: string;
  /** 旅遊心得 */
  travelNotes?: string;
  /** 其他（自由發揮） */
  other?: string;
  /** 五大服務優勢（最多 5 個標籤，每個不超過 15 字） */
  serviceAdvantages?: string[];
  /** 電子名片樣式（1–10 對應 demo 風格） */
  eCardStyle?: string;
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="resize-y" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export default function SiteContentPage() {
  const [data, setData] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const aboutSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<SiteContent>("/api/admin/site-content")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#about" || !data) return;
    const t = setTimeout(() => aboutSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    return () => clearTimeout(t);
  }, [data]);

  const update = <K extends keyof SiteContent>(section: K, updates: Partial<SiteContent[K]>) => {
    if (!data) return;
    setData({ ...data, [section]: { ...data[section], ...updates } });
  };

  const updateAboutValue = (index: number, field: "title" | "desc", value: string) => {
    if (!data) return;
    const values = [...data.about.values];
    if (!values[index]) values[index] = { title: "", desc: "" };
    values[index] = { ...values[index], [field]: value };
    update("about", { values });
  };

  const save = () => {
    if (!data) return;
    setError("");
    setMessage("");
    setSaving(true);
    apiPut("/api/admin/site-content", data)
      .then(() => setMessage("已儲存"))
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  };

  if (loading) return <div className="text-slate-600">載入中…</div>;
  if (error && !data) return <div className="text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">網站設定</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? "儲存中…" : "儲存全部"}
        </Button>
      </div>
      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Accordion type="multiple" defaultValue={["navbar", "footer", "about", "home"]} className="space-y-2">
        {/* 頁首 */}
        <AccordionItem value="navbar" className="border rounded-lg px-4 bg-white">
          <AccordionTrigger>頁首 (Navbar)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="品牌名稱" value={data.navbar.brandName} onChange={(v) => update("navbar", { brandName: v })} />
            <Field label="副標" value={data.navbar.brandSub} onChange={(v) => update("navbar", { brandSub: v })} />
            <Field label="LINE 連結" value={data.navbar.lineUrl} onChange={(v) => update("navbar", { lineUrl: v })} />
          </AccordionContent>
        </AccordionItem>

        {/* 頁尾 */}
        <AccordionItem value="footer" className="border rounded-lg px-4 bg-white">
          <AccordionTrigger>頁尾 (Footer)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="品牌名稱" value={data.footer.brandName} onChange={(v) => update("footer", { brandName: v })} />
            <Field label="副標" value={data.footer.brandSub} onChange={(v) => update("footer", { brandSub: v })} />
            <Field label="簡介" value={data.footer.description} onChange={(v) => update("footer", { description: v })} multiline />
            <Field label="電話" value={data.footer.phone} onChange={(v) => update("footer", { phone: v })} />
            <Field label="地址" value={data.footer.address} onChange={(v) => update("footer", { address: v })} />
            <Field label="LINE 連結" value={data.footer.lineUrl} onChange={(v) => update("footer", { lineUrl: v })} />
            <Field label="免責聲明" value={data.footer.disclaimer} onChange={(v) => update("footer", { disclaimer: v })} multiline />
            <Field label="版權" value={data.footer.copyright} onChange={(v) => update("footer", { copyright: v })} />
            <Field label="經紀人資訊（頁尾小字）" value={data.footer.brokerInfo ?? ""} onChange={(v) => update("footer", { brokerInfo: v })} />
          </AccordionContent>
        </AccordionItem>

        {/* 關於我們 */}
        <AccordionItem value="about" id="about" ref={aboutSectionRef} className="border rounded-lg px-4 bg-white">
          <AccordionTrigger>關於我們 (About)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="主圖 URL" value={data.about.heroImage} onChange={(v) => update("about", { heroImage: v })} />
            <Field label="副標" value={data.about.subtitle} onChange={(v) => update("about", { subtitle: v })} />
            <Field label="店名" value={data.about.storeName} onChange={(v) => update("about", { storeName: v })} />
            <Field label="店副標" value={data.about.storeSub} onChange={(v) => update("about", { storeSub: v })} />
            <Field label="地址" value={data.about.address} onChange={(v) => update("about", { address: v })} />
            <Field label="電話" value={data.about.phone} onChange={(v) => update("about", { phone: v })} />
            <Field label="LINE 連結" value={data.about.lineUrl} onChange={(v) => update("about", { lineUrl: v })} />
            <div className="space-y-2">
              <Label>三大理念（標題／描述）</Label>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="標題"
                    value={data.about.values[i]?.title ?? ""}
                    onChange={(e) => updateAboutValue(i, "title", e.target.value)}
                  />
                  <Input
                    placeholder="描述"
                    value={data.about.values[i]?.desc ?? ""}
                    onChange={(e) => updateAboutValue(i, "desc", e.target.value)}
                  />
                </div>
              ))}
            </div>
            <Field label="平台簡介" value={data.about.platformIntro} onChange={(v) => update("about", { platformIntro: v })} multiline />
            <Field label="平台免責" value={data.about.platformDisclaimer} onChange={(v) => update("about", { platformDisclaimer: v })} multiline />
            <Field label="CTA 文案" value={data.about.ctaText} onChange={(v) => update("about", { ctaText: v })} />
            <div className="pt-2 border-t">
              <Label>團隊成員（電子名片）</Label>
              <p className="text-sm text-slate-500 mt-1 mb-2">
                請至「團隊成員」頁面新增／編輯成員（支援多筆執照與證照圖、大頭照輪播、多平台店鋪、自我介紹、學歷等）。
              </p>
              <Link href="/admin/team-members">
                <a className="text-sm font-medium text-primary hover:underline">前往團隊成員頁面 →</a>
              </Link>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 首頁 */}
        <AccordionItem value="home" className="border rounded-lg px-4 bg-white">
          <AccordionTrigger>首頁 (Home)</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <Field label="Hero 主圖" value={data.home.heroImage} onChange={(v) => update("home", { heroImage: v })} />
            <Field label="天際線圖" value={data.home.skylineImage} onChange={(v) => update("home", { skylineImage: v })} />
            <Field label="諮詢圖" value={data.home.consultationImage} onChange={(v) => update("home", { consultationImage: v })} />
            <Field label="社區圖" value={data.home.communityImage} onChange={(v) => update("home", { communityImage: v })} />
            <Field label="LINE 連結" value={data.home.lineUrl} onChange={(v) => update("home", { lineUrl: v })} />
            <Field label="Hero 徽章" value={data.home.heroBadge} onChange={(v) => update("home", { heroBadge: v })} />
            <Field label="Hero 標題前" value={data.home.heroTitle} onChange={(v) => update("home", { heroTitle: v })} />
            <Field label="Hero 標題強調" value={data.home.heroHighlight} onChange={(v) => update("home", { heroHighlight: v })} />
            <Field label="Hero 標題後" value={data.home.heroSuffix} onChange={(v) => update("home", { heroSuffix: v })} />
            <Field label="Hero 描述（可用 {{count}}）" value={data.home.heroDesc} onChange={(v) => update("home", { heroDesc: v })} multiline />
            <Field label="關於區塊徽章" value={data.home.aboutSectionBadge} onChange={(v) => update("home", { aboutSectionBadge: v })} />
            <Field label="關於區塊標題" value={data.home.aboutSectionTitle} onChange={(v) => update("home", { aboutSectionTitle: v })} />
            <Field label="關於區塊描述" value={data.home.aboutSectionDesc} onChange={(v) => update("home", { aboutSectionDesc: v })} multiline />
            <Field label="CTA 標題" value={data.home.ctaTitle} onChange={(v) => update("home", { ctaTitle: v })} />
            <Field label="CTA 描述（可用 {{count}}）" value={data.home.ctaDesc} onChange={(v) => update("home", { ctaDesc: v })} multiline />
            <div className="space-y-1">
              <Label>精選建案名稱（每行一個）</Label>
              <Textarea
                value={data.home.featuredProjectNames.join("\n")}
                onChange={(e) => update("home", { featuredProjectNames: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                rows={4}
                placeholder="勤美之森&#10;寶輝花園紀"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
