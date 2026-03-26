/**
 * Design: 暖陽台中
 * LineFloatingButton: 右下角浮動的 Line 聯絡按鈕
 */
import { MessageCircle } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";

const LINE_URL = "https://line.me/R/ti/p/@368bruzx";

export default function LineFloatingButton() {
  const { items } = useCompare();
  // If compare dock is visible, move up
  const bottomOffset = items.length > 0 ? "bottom-20" : "bottom-6";

  return (
    <a
      href={LINE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-5 ${bottomOffset} z-50 transition-all duration-300 group`}
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-[#06C755] shadow-lg shadow-[#06C755]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span className="absolute -top-8 right-0 bg-foreground text-background text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Line 聯絡學韜
        </span>
      </div>
    </a>
  );
}
