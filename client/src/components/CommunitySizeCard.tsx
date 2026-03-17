/**
 * CommunitySizeCard: 社區規模提醒卡
 * 顯示社區規模評級、優缺點分析
 */
import { ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { getCommunitySizeInfo } from "@/lib/types";

interface Props {
  communitySize: string | null | undefined;
  totalUnits: number;
}

export default function CommunitySizeCard({ communitySize, totalUnits }: Props) {
  const info = getCommunitySizeInfo(communitySize);
  if (!info || totalUnits <= 0) return null;

  return (
    <div className={`rounded-xl border p-5 ${info.bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{info.icon}</span>
        <div>
          <h3 className={`text-sm font-bold ${info.color}`}>
            {info.size}
          </h3>
          <p className="text-[11px] text-muted-foreground">
            {totalUnits}戶 · {info.range}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Pros */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <ThumbsUp className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-semibold text-emerald-700">優點</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.pros.map((pro) => (
              <span
                key={pro}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100/80 text-emerald-700"
              >
                {pro}
              </span>
            ))}
          </div>
        </div>

        {/* Cons */}
        <div>
          <div className="flex items-center gap-1 mb-1.5">
            <ThumbsDown className="w-3 h-3 text-orange-600" />
            <span className="text-[10px] font-semibold text-orange-700">需留意</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {info.cons.map((con) => (
              <span
                key={con}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100/80 text-orange-700"
              >
                {con}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-current/10">
        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          社區規模評級僅供參考，實際管理品質取決於管委會運作與住戶素質。
        </p>
      </div>
    </div>
  );
}
