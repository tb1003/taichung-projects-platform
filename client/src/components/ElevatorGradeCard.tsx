/**
 * ElevatorGradeCard: 電梯比評級卡
 * 顯示電梯比數值、評級、視覺化指示
 */
import { ArrowUpDown, Info } from "lucide-react";
import { getElevatorGradeInfo, ELEVATOR_GRADES } from "@/lib/types";

interface Props {
  elevatorGrade: string | null | undefined;
  elevatorRatio: number | null | undefined;
  elevatorConfig: string;
}

export default function ElevatorGradeCard({
  elevatorGrade,
  elevatorRatio,
  elevatorConfig,
}: Props) {
  const info = getElevatorGradeInfo(elevatorGrade);
  if (!info || elevatorRatio === null || elevatorRatio === undefined) return null;

  // Calculate position on the scale (0-100)
  // Scale: 1 (best) to 10 (worst)
  const position = Math.min(Math.max(((elevatorRatio - 1) / 9) * 100, 0), 100);

  return (
    <div className={`rounded-xl border p-5 ${info.bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className={`w-4 h-4 ${info.color}`} />
          <div>
            <h3 className={`text-sm font-bold ${info.color}`}>
              電梯戶數比：{info.label}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {elevatorConfig}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${info.color}`}>
            {elevatorRatio}
          </p>
          <p className="text-[10px] text-muted-foreground">戶/梯</p>
        </div>
      </div>

      {/* Visual scale */}
      <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-red-200 overflow-visible mb-3">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 shadow-sm"
          style={{
            left: `${position}%`,
            borderColor: info.color.includes("emerald")
              ? "#059669"
              : info.color.includes("sky")
              ? "#0284c7"
              : info.color.includes("amber")
              ? "#d97706"
              : info.color.includes("orange")
              ? "#ea580c"
              : "#dc2626",
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[9px] text-muted-foreground mb-3">
        <span>優 (≤2)</span>
        <span>佳 (2-3)</span>
        <span>可 (3-5)</span>
        <span>普通 (5-7)</span>
        <span>差 (≥7)</span>
      </div>

      <div className="pt-2 border-t border-current/10">
        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          電梯比 = 每層戶數 / 電梯數。數字越小代表等候時間越短、居住品質越好。
        </p>
      </div>
    </div>
  );
}
