/**
 * 關於我們 － 團隊介紹／電子名片 Demo 共用 mock 資料
 * 與後台團隊成員欄位對應；呈現時「有填寫才顯示」。
 */
export interface DemoListing {
  id: string;
  title: string;
  price: string;
  priceUnit?: string;
  specs: string;
  image: string;
  tag?: string;
  tagColor?: string;
}

export interface DemoAgentCard {
  name: string;
  title?: string;
  storeName?: string;
  storeSub?: string;
  /** 單一主照（舊）或首張 */
  photo?: string;
  /** 多張輪播（最多 5） */
  photos?: string[];
  phone?: string;
  lineId?: string;
  lineUrl?: string;
  email?: string;
  /** 自我介紹（250 字內，支援 HTML/MD） */
  intro?: string;
  /** 為什麼找我（可與 intro 共用或分開） */
  whyMe?: string;
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
  /** 五大服務優勢（最多 5 個，每個不超過 15 字） */
  serviceAdvantages?: string[];
  /** 專長標籤 */
  tags?: string[];
  /** 執照（多筆，可含證照圖） */
  licenses?: { text: string; imageUrl?: string }[];
  license?: string;
  /** 店鋪／平台（自訂名稱+連結） */
  storeLinks?: { name: string; url: string }[];
  /** 精選好案 */
  featuredListings?: DemoListing[];
  /** 社群連結 */
  social?: { name: string; url: string; icon: string }[];
  /** 電子名片樣式 1–10 */
  eCardStyle?: string;
}

/** 完整範例資料（所有欄位有值，demo 呈現時仍依「有填才顯示」邏輯） */
export const DEMO_AGENT: DemoAgentCard = {
  name: "陳冠軍",
  title: "資深店長",
  storeName: "五義不動產",
  storeSub: "西屯未來店",
  photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  photos: [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  ],
  phone: "0900123456",
  lineId: "@champion_home",
  lineUrl: "https://line.me/tw/",
  email: "champion.chen@example.com",
  intro: "買房賣房不靠運氣，靠的是精準數據！為您尋找最合適的家，成交才是我們友誼的開始。",
  whyMe: "買房賣房不靠運氣，靠的是精準數據！\n「為您尋找最合適的家，成交才是我們友誼的開始！」",
  motto: "專業、誠信、以客為尊",
  ytChannelUrl: "https://www.youtube.com/@example",
  transactionHistory: "累積成交逾 200 件，涵蓋首購、換屋、置產。",
  awards: "永慶不動產西屯未來店年度業績前三名、五義地產服務品質獎",
  education: {
    elementary: "台中市西屯國小",
    juniorHigh: "台中市立西苑高中國中部",
    highSchool: "台中市立西苑高中",
    university: "逢甲大學",
    department: "土地管理學系",
    graduateSchool: "逢甲大學土地管理研究所",
  },
  workExperience: [
    { company: "永慶不動產", title: "店長", period: "2020-至今", desc: "西屯未來店" },
    { company: "五義地產", title: "業務", period: "2018-2020", desc: "房仲業務" },
  ],
  other: "擅長首購與換屋規劃，可提供稅務試算與合約說明。",
  serviceAdvantages: ["地段分析", "品牌建商", "生活機能", "產品比較", "專任委託"],
  interests: "閱讀、登山、品茶",
  religion: "佛教",
  travelNotes: "日本、東南亞多次自助，喜歡有溫度的老建築與市集。",
  tags: ["專任委託顧問", "西屯學區達人", "稅務精準試算"],
  licenses: [
    { text: "103中市經字第1304號", imageUrl: undefined },
  ],
  license: "103中市經字第1304號",
  storeLinks: [
    { name: "591 店鋪", url: "https://sale.591.com.tw/home/house/list?agentid=123" },
    { name: "5168 房訊", url: "https://www.5168.com.tw/" },
    { name: "好房網", url: "https://news.housefun.com.tw/" },
  ],
  featuredListings: [
    {
      id: "1",
      title: "水湳經貿園區｜首排指標雙車位豪墅",
      price: "3,280",
      priceUnit: "萬",
      specs: "4房2廳3衛 | 75坪",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&q=80",
      tag: "獨家專任",
      tagColor: "bg-red-500",
    },
    {
      id: "2",
      title: "七期核心｜高樓層無敵夜景景觀戶",
      price: "2,650",
      priceUnit: "萬",
      specs: "3房2廳2衛 | 52坪",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&q=80",
      tag: "降價急售",
      tagColor: "bg-blue-500",
    },
  ],
  social: [
    { name: "Facebook", url: "#", icon: "facebook" },
    { name: "Instagram", url: "#", icon: "instagram" },
    { name: "YouTube", url: "#", icon: "youtube" },
  ],
  eCardStyle: "1",
};

/** 有填才顯示：取第一張大頭照 */
export function getDemoPhoto(a: DemoAgentCard): string | undefined {
  return (a.photos && a.photos[0]) || a.photo;
}

/** 有填才顯示：自介／為什麼找我 文字 */
export function getDemoIntro(a: DemoAgentCard): string {
  return (a.intro || a.whyMe || "").trim();
}

export function buildVCardData(agent: DemoAgentCard): string {
  const firstChar = (agent.name || "").slice(0, 1);
  const restName = (agent.name || "").slice(1) || "";
  const company = [agent.storeName, agent.storeSub].filter(Boolean).join(" ");
  return `BEGIN:VCARD
VERSION:3.0
N:${firstChar};${restName};;;
FN:${agent.name}
ORG:${company}
TITLE:${agent.title || ""}
TEL;TYPE=CELL:${agent.phone || ""}
EMAIL;TYPE=WORK:${agent.email || ""}
END:VCARD`;
}
