/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * Footer: 底部資訊區，含聯絡方式與免責聲明（內容可由後台網站設定）
 */
import { MapPin, Phone, ExternalLink } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Footer() {
  const { data: site } = useSiteContent();
  const f = site?.footer;
  const brandName = f?.brandName ?? "永慶不動產 西屯未來店";
  const brandSub = f?.brandSub ?? "五義地產";
  const description = f?.description ?? "台中建案導覽與比較平台，為您精心整理台中市各區建案資訊，提供專業的購屋諮詢服務。";
  const phone = f?.phone ?? "陳學韜 0970-090-223";
  const address = f?.address ?? "台中市西屯區西屯路二段248號";
  const lineUrl = f?.lineUrl ?? "https://lin.ee/OQ9zdLK";
  const disclaimer = f?.disclaimer ?? "免責聲明：本網站所有建案資訊僅供參考，實際以建商公告及買賣契約為準。本站不保證資訊之正確性與即時性，購屋前請務必實地查訪並諮詢專業人士。";
  const copyright = f?.copyright ?? "永慶不動產西屯未來店 陳學韜";
  const brokerInfo = (f?.brokerInfo ?? "不動產經紀人：馮乾志 103中市經字第1304號").trim();

  return (
    <footer className="bg-[#3D3529] text-white/80 mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm" style={{ fontFamily: "DM Sans" }}>YC</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{brandName}</p>
                <p className="text-xs text-white/50">{brandSub}</p>
              </div>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mt-3">
              {description}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">聯絡資訊</h4>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-[#06C755] hover:text-[#05b34d] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                Line 線上諮詢
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">快速連結</h4>
            <div className="flex flex-col gap-2">
              <a href="/projects" className="text-xs hover:text-primary transition-colors">建案總覽</a>
              <a href="/compare" className="text-xs hover:text-primary transition-colors">建案比較</a>
              <a href="/about" className="text-xs hover:text-primary transition-colors">關於我們</a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-[10px] text-white/30 leading-relaxed">
            {disclaimer}
          </p>
          <p className="text-[10px] text-white/30 mt-2">
            © {new Date().getFullYear()} {copyright}. All rights reserved.
          </p>
          <p className="text-[11px] text-white/40 mt-1.5">
            {brokerInfo}
          </p>
        </div>
      </div>
    </footer>
  );
}
