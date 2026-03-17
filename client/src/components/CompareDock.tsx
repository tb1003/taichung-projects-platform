/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * CompareDock: 固定在螢幕底部的比較欄，顯示已選建案
 */
import { useLocation } from "wouter";
import { X, GitCompareArrows, ArrowRight } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function CompareDock() {
  const { items, removeItem, clearAll } = useCompare();
  const [location, setLocation] = useLocation();

  // Hide dock on compare page itself
  if (items.length === 0 || location === "/compare") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-primary shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        <div className="container py-3 flex items-center gap-3">
          {/* Icon */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <GitCompareArrows className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              比較清單
            </span>
          </div>

          {/* Items */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto">
            {items.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium shrink-0"
                style={{ color: "#9a7b00" }}
              >
                {item.name}
                <button
                  onClick={() => removeItem(item.id)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {items.length < 5 && (
              <span className="text-xs text-muted-foreground shrink-0">
                還可加入 {5 - items.length} 個
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              清除
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.scrollTo(0, 0);
                setLocation("/compare");
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-full px-4"
            >
              開始比較
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
