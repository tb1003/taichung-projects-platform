/**
 * 前台用：從 GET /api/public/site-content 讀取網站內容（頁首／頁尾／關於我們／首頁）
 * 失敗或無資料時回傳 null，由各元件自行 fallback 預設值
 */
import { useEffect, useState } from "react";

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
    brokerInfo?: string;
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
    teamMembers?: {
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

export function useSiteContent(): { data: SiteContent | null; loading: boolean } {
  const [data, setData] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/site-content")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch failed"))))
      .then((json) => setData(json as SiteContent))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
