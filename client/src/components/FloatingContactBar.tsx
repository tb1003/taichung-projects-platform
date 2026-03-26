/**
 * FloatingContactBar - 浮動聯絡符號欄
 * 設計: 暖陽台中 - 簡潔乾淨的右下角浮動符號欄
 * 參考: 大橘團隊設計風格 - 垂直堆疊圓形符號
 */
import { MessageCircle, Phone, ArrowUp } from "lucide-react";
import { useState } from "react";

const LINE_URL = "https://line.me/R/ti/p/@368bruzx";
const PHONE_NUMBER = "0970090223";

export default function FloatingContactBar() {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const contacts = [
    {
      id: "line",
      icon: MessageCircle,
      label: "Line 預約看屋",
      color: "bg-[#06C755] hover:bg-[#05b34d]",
      action: () => window.open(LINE_URL, "_blank"),
    },
    {
      id: "phone",
      icon: Phone,
      label: "撥打電話",
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => window.location.href = `tel:${PHONE_NUMBER}`,
    },
    {
      id: "top",
      icon: ArrowUp,
      label: "回到頂部",
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {contacts.map((contact) => {
        const Icon = contact.icon;
        return (
          <div key={contact.id} className="relative group">
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {contact.label}
            </div>

            {/* Icon Button */}
            <button
              onClick={contact.action}
              className={`w-12 h-12 rounded-full ${contact.color} text-white flex items-center justify-center shadow-lg transition-all duration-200 flex-shrink-0`}
              aria-label={contact.label}
            >
              <Icon className="w-6 h-6" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
