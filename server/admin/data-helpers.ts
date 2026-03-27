/**
 * 後台用：讀寫 client/src/data/*.json
 * 依模組路徑解析專案根目錄，不依賴 process.cwd()。
 * Railway：若掛載 /data volume，會自動 seed 預設 JSON（僅首次）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DEFAULT_DATA_DIR = path.join(PROJECT_ROOT, "client", "src", "data");

function resolveDataDir(): string {
  const envDir = String(process.env.DATA_DIR || "").trim();
  if (envDir) return envDir;
  // 若有掛載 Volume（Railway 建議 mount /data），則優先使用
  if (fs.existsSync("/data")) return "/data";
  return DEFAULT_DATA_DIR;
}

function ensureDir(dir: string): void {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore (will fail later on read/write with clearer error)
  }
}

function dataPath(filename: string, dir?: string): string {
  return path.join(dir || resolveDataDir(), filename);
}

/** 第一次使用 Volume 時，把 repo 內預設資料 seed 到 Volume（只在檔案不存在時才複製） */
function seedIfMissing(filename: string): void {
  const dir = resolveDataDir();
  if (dir === DEFAULT_DATA_DIR) return;

  ensureDir(dir);
  const target = dataPath(filename, dir);
  if (fs.existsSync(target)) return;

  const seed = dataPath(filename, DEFAULT_DATA_DIR);
  if (!fs.existsSync(seed)) return;

  try {
    fs.copyFileSync(seed, target);
  } catch {
    // ignore
  }
}

function readJson<T>(filename: string): T {
  seedIfMissing(filename);
  const primaryPath = dataPath(filename);
  try {
    const raw = fs.readFileSync(primaryPath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    // Railway 上若 /data 尚未可用（或建立失敗），回退讀取專案內建資料，避免整頁報錯。
    if (err?.code !== "ENOENT") throw e;

    const fallbackPath = dataPath(filename, DEFAULT_DATA_DIR);
    const raw = fs.readFileSync(fallbackPath, "utf-8");
    const parsed = JSON.parse(raw) as T;

    // best effort: 再嘗試把 fallback 同步回目標資料夾，供後續寫入使用
    try {
      const dir = resolveDataDir();
      ensureDir(dir);
      const target = dataPath(filename, dir);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(fallbackPath, target);
      }
    } catch {
      // ignore fallback sync errors
    }
    return parsed;
  }
}

function writeJson(filename: string, data: unknown): void {
  const dir = resolveDataDir();
  ensureDir(dir);
  const fullPath = dataPath(filename, dir);
  try {
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    throw new Error(`寫入 ${filename} 失敗: ${err?.message ?? e} (路徑: ${fullPath})`);
  }
}

function exists(filename: string): boolean {
  seedIfMissing(filename);
  return fs.existsSync(dataPath(filename));
}

// ---------- projects ----------
export interface ProjectsData {
  source: string;
  updated: string;
  updatedBy?: string;
  owner: Record<string, string>;
  total_projects: number;
  projects: unknown[];
}

export function readProjects(): ProjectsData {
  return readJson<ProjectsData>("projects.json");
}

export function writeProjects(data: ProjectsData, modifiedBy?: string): void {
  data.updated = new Date().toISOString();
  if (modifiedBy !== undefined) data.updatedBy = modifiedBy;
  data.total_projects = data.projects.length;
  writeJson("projects.json", data);
}

// ---------- zones ----------
export interface ZoneItem {
  zone_name: string;
  development_type: string;
  core_features: string;
  in_depth_analysis: string;
  key_facilities: string;
}

export function readZones(): ZoneItem[] {
  return readJson<ZoneItem[]>("zones.json");
}

export function writeZones(zones: ZoneItem[]): void {
  writeJson("zones.json", zones);
}

export interface DataMeta {
  lastModifiedAt: string;
  lastModifiedBy: string;
}

// ---------- builders ----------
export interface BuilderItem {
  builder_name: string;
  /** 選填：建設公司 Logo 圖片網址，有則在列表/表單名稱旁顯示 */
  logo_url?: string | null;
  parent_group: string | null;
  core_slogan: string;
  in_depth_analysis: string;
  construction_partner: string;
  after_sales_service: string;
  classic_style: string;
}

export function readBuilders(): BuilderItem[] {
  return readJson<BuilderItem[]>("builders.json");
}

export function writeBuilders(builders: BuilderItem[]): void {
  writeJson("builders.json", builders);
}

// ---------- zone_name_map ----------
export function readZoneNameMap(): Record<string, string> {
  return readJson<Record<string, string>>("zone_name_map.json");
}

export function writeZoneNameMap(map: Record<string, string>): void {
  writeJson("zone_name_map.json", map);
}

// ---------- builderNameMap ----------
export function readBuilderNameMap(): Record<string, string> {
  return readJson<Record<string, string>>("builderNameMap.json");
}

export function writeBuilderNameMap(map: Record<string, string>): void {
  writeJson("builderNameMap.json", map);
}

// ---------- site-content（頁首／頁尾／關於我們／首頁）----------
export interface SiteContent {
  _meta?: DataMeta;
  navbar: {
    brandName: string;
    brandSub: string;
    lineUrl: string;
  };
  footer: {
    brandName: string;
    brandSub: string;
    description: string;
    phone: string;
    address: string;
    lineUrl: string;
    disclaimer: string;
    copyright: string;
    /** 不動產經紀人資訊（顯示於頁尾，字體不突出） */
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
    /** 團隊成員（電子名片），可連結 591／其他銷售平台 */
    teamMembers: {
      name: string;
      title?: string;
      license?: string;
      photo?: string;
      lineUrl?: string;
      storeUrl?: string;
      storeLabel?: string;
      order: number;
    }[];
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

const DEFAULT_SITE_CONTENT: SiteContent = {
  navbar: {
    brandName: "永慶不動產",
    brandSub: "西屯未來店 | 陳學韜",
    lineUrl: "https://lin.ee/OQ9zdLK",
  },
  footer: {
    brandName: "永慶不動產 西屯未來店",
    brandSub: "五義地產",
    description: "台中建案導覽與比較平台，為您精心整理台中市各區建案資訊，提供專業的購屋諮詢服務。",
    phone: "陳學韜 0970-090-223",
    address: "台中市西屯區西屯路二段248號",
    lineUrl: "https://lin.ee/OQ9zdLK",
    disclaimer: "免責聲明：本網站所有建案資訊僅供參考，實際以建商公告及買賣契約為準。本站不保證資訊之正確性與即時性，購屋前請務必實地查訪並諮詢專業人士。",
    copyright: "永慶不動產西屯未來店 陳學韜",
    brokerInfo: "不動產經紀人：馮乾志 103中市經字第1304號",
  },
  about: {
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/hero-opening_c6e5cdbc.jpeg",
    subtitle: "永慶不動產西屯未來店 | 五義地產 | 陳學韜",
    storeName: "永慶不動產 西屯未來店",
    storeSub: "五義地產",
    address: "台中市西屯區西屯路二段248號",
    phone: "陳學韜 0970-090-223",
    lineUrl: "https://lin.ee/OQ9zdLK",
    values: [
      { title: "專業分析", desc: "深度了解每個建案的優勢與特色，提供客觀的市場分析與建議。" },
      { title: "以客為尊", desc: "傾聽您的需求，量身推薦最適合的建案，陪伴您完成人生重要決定。" },
      { title: "在地深耕", desc: "熟悉台中各區域發展脈動，掌握最新建案資訊與市場趨勢。" },
    ],
    platformIntro: "本平台收錄台中市超過 400 個建案的詳細資訊，涵蓋 14 期重劃區、13 期重劃區、水湳經貿園區、機捷特區、單元 12 等熱門區域。每個建案均經過 AI 深度分析，提供五大優勢標語（地段價值、品牌建築、生活環境、生活機能、產品特色），並支援多建案橫向比較功能，幫助您快速找到理想的家園。",
    platformDisclaimer: "資料來源：大橘團隊 dajuteam.com.tw。所有建案資訊僅供參考，實際以建商公告及買賣契約為準。",
    ctaText: "有任何購屋問題？歡迎隨時聯絡學韜",
    teamMembers: [],
  },
  home: {
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/hero-opening_c6e5cdbc.jpeg",
    skylineImage: "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-skyline-SPdyK3fVWft4YezC6KsyLN.webp",
    consultationImage: "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/real-estate-consultation-7cGkbCY8HTENe5HpHUNiYg.webp",
    communityImage: "https://d2xsxph8kpxj0f.cloudfront.net/110775349/PbEBxmnwNLJoTarF4KRCn2/taichung-park-community-EGrfCxm52KjhU3K2vsb5kz.webp",
    lineUrl: "https://lin.ee/OQ9zdLK",
    heroBadge: "永慶不動產 西屯未來店",
    heroTitle: "台中建案",
    heroHighlight: "導覽與比較",
    heroSuffix: "平台",
    heroDesc: "精心整理台中市 {{count}} 個建案，涵蓋 14 期、水湳、機捷等熱門重劃區。一站式瀏覽、比較，找到您的理想家園。",
    aboutSectionBadge: "關於我們",
    aboutSectionTitle: "您的台中購屋好夥伴",
    aboutSectionDesc: "陳學韜，永慶不動產西屯未來店的專業經紀人。深耕台中房地產市場，熟悉各重劃區的發展脈動與建案特色。無論您是首購族、換屋族還是投資客，我都能為您提供最專業、最貼心的購屋建議。",
    ctaTitle: "找到您的理想家園",
    ctaDesc: "瀏覽 {{count}} 個台中建案，使用比較功能找出最適合您的選擇",
    featuredProjectNames: ["勤美之森", "寶輝花園紀", "惠宇大聚", "國泰聚", "雙橡園S1", "總太織築"],
  },
};

export function readSiteContent(): SiteContent {
  if (!exists("site-content.json")) {
    return DEFAULT_SITE_CONTENT;
  }
  try {
    const raw = readJson<Partial<SiteContent>>("site-content.json");
    return {
      _meta: raw._meta,
      navbar: { ...DEFAULT_SITE_CONTENT.navbar, ...raw.navbar },
      footer: { ...DEFAULT_SITE_CONTENT.footer, ...raw.footer },
      about: {
        ...DEFAULT_SITE_CONTENT.about,
        ...raw.about,
        teamMembers: Array.isArray((raw.about as any)?.teamMembers) ? (raw.about as any).teamMembers : DEFAULT_SITE_CONTENT.about.teamMembers,
      },
      home: { ...DEFAULT_SITE_CONTENT.home, ...raw.home },
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function writeSiteContent(data: SiteContent): void {
  writeJson("site-content.json", data);
}

// ---------- market-news（市場動態／房市快訊）----------
export interface MarketNewsArticle {
  id: string;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  summary: string;
  image?: string | null;
  body: string;
}

export interface MarketNewsData {
  source: string;
  updated: string;
  updatedBy?: string;
  articles: MarketNewsArticle[];
}

export function readMarketNews(): MarketNewsData {
  return readJson<MarketNewsData>("market-news.json");
}

export function writeMarketNews(data: MarketNewsData, modifiedBy?: string): void {
  data.updated = new Date().toISOString();
  if (modifiedBy !== undefined) data.updatedBy = modifiedBy;
  writeJson("market-news.json", data);
}

// ---------- 五義地產筆記（房產工具中間區塊，圖左文右詳情）----------
export interface KungfuItem {
  id: string;
  title: string;
  slug: string;
  imageUrls: string[];
  pdfUrls?: string[];
  youtubeUrl?: string;
  body: string;
  order: number;
}

export interface KungfuData {
  items: KungfuItem[];
  _meta?: DataMeta;
}

function defaultKungfuData(): KungfuData {
  return { items: [] };
}

export function readKungfu(): KungfuData {
  try {
    if (!exists("kungfu.json")) return defaultKungfuData();
    const raw = readJson<Partial<KungfuData>>("kungfu.json");
    const items = Array.isArray(raw.items) ? raw.items : [];
    return {
      items: items.filter((x): x is KungfuItem => x != null && typeof x.id === "string" && typeof x.title === "string" && typeof x.slug === "string"),
      _meta: raw._meta,
    };
  } catch {
    return defaultKungfuData();
  }
}

export function writeKungfu(data: KungfuData): void {
  writeJson("kungfu.json", data);
}

// ---------- 房產工具區塊（買賣前先搞懂／查行情與區域／查證與進階工具，可後台管理）----------
export interface ToolItem {
  id: string;
  label: string;
  order: number;
  href?: string;
  external?: boolean;
  body?: string;
  imageUrls?: string[];
  youtubeUrl?: string;
}

export interface ToolBlock {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: ToolItem[];
}

export interface ToolBlocksData {
  blocks: ToolBlock[];
  _meta?: DataMeta;
}

function defaultToolBlocksData(): ToolBlocksData {
  return {
    blocks: [
      {
        id: "buy-sell",
        title: "買賣前先搞懂",
        description: "賣屋流程、出售土地流程、貸款評估全流程，一層一層思考",
        order: 0,
        items: [
          { id: "bs1", label: "賣屋流程", order: 0, href: "/demo/selling-process", external: false },
          { id: "bs2", label: "出售土地流程", order: 1, href: "/demo/land-selling-process", external: false },
          { id: "bs3", label: "貸款評估全流程", order: 2, href: "/demo/loan-process", external: false },
        ],
      },
      {
        id: "market-area",
        title: "查行情與區域",
        description: "實價、學區、重劃區、生活資訊",
        order: 1,
        items: [
          { id: "ma1", label: "內政部實價登錄查詢", order: 0, href: "https://lvr.land.moi.gov.tw/", external: true },
          { id: "ma2", label: "台中市政府教育局學區查詢", order: 1, href: "https://www.tc.edu.tw/mobile/", external: true },
          { id: "ma3", label: "台中重劃區地圖與細部計畫", order: 2, href: "https://urban.taichung.gov.tw/", external: true },
          { id: "ma4", label: "台中公辦重劃區介紹", order: 3, href: "https://www.ud.taichung.gov.tw/", external: true },
          { id: "ma5", label: "台中自辦重劃區介紹", order: 4, href: "https://www.ud.taichung.gov.tw/", external: true },
          { id: "ma6", label: "Google 地球", order: 5, href: "https://earth.google.com/web/", external: true },
          { id: "ma7", label: "台中垃圾清運即時查詢", order: 6, href: "https://campaign.epb.taichung.gov.tw/garbage/", external: true },
        ],
      },
      {
        id: "verify-advanced",
        title: "查證與進階工具",
        description: "稅費試算、圖資、建照、地質",
        order: 2,
        items: [
          { id: "va1", label: "土地增值稅試算", order: 0, href: "https://www.etax.nat.gov.tw/etwmain/etw158w/51", external: true },
          { id: "va2", label: "前次移轉現值查詢", order: 1, href: "https://www.etax.nat.gov.tw/etwmain/online-service/tax-pre-calculation/house-land-transfer-tax", external: true },
          { id: "va3", label: "158 空間資訊網（土地使用分區、地號）", order: 2, href: "https://lohas.taichung.gov.tw/lohas/", external: true },
          { id: "va4", label: "建築物地籍套繪查詢（建蔽、總樓高）", order: 3, href: "https://mcgbm.taichung.gov.tw/", external: true },
          { id: "va5", label: "國土規劃地理資訊圖台", order: 4, href: "https://maps.nlsc.gov.tw/", external: true },
          { id: "va6", label: "審議圖（新大樓平面、外觀）", order: 5, href: "https://mcgbm.taichung.gov.tw/", external: true },
          { id: "va7", label: "建築執照存根查詢", order: 6, href: "https://mcgbm.taichung.gov.tw/", external: true },
          { id: "va8", label: "內政部戶政司（門牌、鄰里）", order: 7, href: "https://www.ris.gov.tw/app/portal/3053", external: true },
          { id: "va9", label: "土壤液化潛勢查詢", order: 8, href: "https://www.liquid.net.tw/cgs/public/", external: true },
          { id: "va10", label: "中央地質調查所斷層查詢", order: 9, href: "https://faultgis.gsmma.gov.tw/gis/", external: true },
          { id: "va11", label: "國土測繪圖資服務雲", order: 10, href: "https://maps.nlsc.gov.tw/", external: true },
        ],
      },
    ],
  };
}

export function readToolBlocks(): ToolBlocksData {
  try {
    if (!exists("tool-blocks.json")) return defaultToolBlocksData();
    const raw = readJson<Partial<ToolBlocksData>>("tool-blocks.json");
    const blocks = Array.isArray(raw.blocks) ? raw.blocks : defaultToolBlocksData().blocks;
    const normalized = blocks
      .filter((b) => b != null && typeof (b as ToolBlock).id === "string" && typeof (b as ToolBlock).title === "string")
      .map((b) => {
        const block = b as ToolBlock;
        const items = Array.isArray(block.items)
          ? block.items
            .filter((x) => x != null && typeof (x as ToolItem).id === "string" && typeof (x as ToolItem).label === "string")
            .map((x) => {
              const it = x as ToolItem;
              return {
                id: it.id,
                label: String(it.label),
                order: typeof it.order === "number" ? it.order : 0,
                href: typeof it.href === "string" ? it.href : undefined,
                external: !!it.external,
                body: typeof it.body === "string" ? it.body : undefined,
                imageUrls: Array.isArray(it.imageUrls) ? it.imageUrls.filter((u): u is string => typeof u === "string") : undefined,
                youtubeUrl: typeof it.youtubeUrl === "string" ? it.youtubeUrl.trim() || undefined : undefined,
              } as ToolItem;
            })
            .sort((a, b) => a.order - b.order)
          : [];
        return { id: block.id, title: block.title, description: block.description, order: block.order ?? 0, items };
      })
      .sort((a, b) => a.order - b.order);
    return { blocks: normalized, _meta: raw._meta };
  } catch {
    return defaultToolBlocksData();
  }
}

export function writeToolBlocks(data: ToolBlocksData, modifiedBy?: string): void {
  const now = new Date().toISOString();
  data._meta = data._meta || { lastModifiedAt: now, lastModifiedBy: modifiedBy ?? "unknown" };
  data._meta.lastModifiedAt = now;
  if (modifiedBy !== undefined) data._meta.lastModifiedBy = modifiedBy;
  writeJson("tool-blocks.json", data);
}
