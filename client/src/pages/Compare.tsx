/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * Compare: 建案比較頁 - 橫向對比表，含五大標語、硬指標、電梯比、社區規模
 * Phase 2: 新增電梯比評級、社區規模、建設集團比較欄位
 */
import { Link } from "wouter";
import {
  ArrowLeft, X, Search, Building2, MapPin, Layers, Users, Car,
  GraduationCap, Trees, Star, ShoppingBag, Ruler, Calendar, Phone,
  AlertTriangle, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { useProjects } from "@/hooks/useProjects";
import {
  SLOGAN_CATEGORIES, isDataIncomplete, getDataCompleteness,
  getElevatorGradeInfo, getCommunitySizeInfo,
} from "@/lib/types";
import type { Project } from "@/lib/types";

const LINE_URL = "https://lin.ee/OQ9zdLK";

function CompareRow({
  label,
  icon: Icon,
  values,
  highlight = false,
}: {
  label: string;
  icon?: typeof MapPin;
  values: (string | React.ReactNode)[];
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-primary/5" : ""}>
      <td className="sticky left-0 bg-card z-10 px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap border-r border-border">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </span>
      </td>
      {values.map((val, i) => (
        <td key={i} className="px-4 py-3 text-sm text-card-foreground min-w-[200px]">
          {val || <span className="text-muted-foreground/50">-</span>}
        </td>
      ))}
    </tr>
  );
}

function SloganRow({
  category,
  projects,
}: {
  category: (typeof SLOGAN_CATEGORIES)[number];
  projects: Project[];
}) {
  return (
    <tr className="bg-primary/5">
      <td className="sticky left-0 bg-card z-10 px-4 py-3 border-r border-border">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${category.color}`}>
          {category.label}
        </span>
      </td>
      {projects.map((p) => (
        <td key={p.id} className="px-4 py-3 min-w-[200px]">
          <p className="text-sm font-medium text-card-foreground leading-relaxed">
            {p.slogans?.[category.key] || <span className="text-muted-foreground/50">-</span>}
          </p>
        </td>
      ))}
    </tr>
  );
}

function ElevatorBadge({ project }: { project: Project }) {
  const info = getElevatorGradeInfo(project.elevator_grade);
  if (!info) return <span className="text-muted-foreground/50">-</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${info.bgColor}`}>
      {info.label}
      {project.elevator_ratio !== null && (
        <span className="opacity-70 text-[10px]">({project.elevator_ratio})</span>
      )}
    </span>
  );
}

function CommunitySizeBadge({ project }: { project: Project }) {
  const info = getCommunitySizeInfo(project.community_size);
  if (!info) return <span className="text-muted-foreground/50">-</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${info.bgColor}`}>
      {info.icon} {info.size}
    </span>
  );
}

export default function Compare() {
  const { items, removeItem, clearAll } = useCompare();
  const { getProjectById } = useProjects();

  const projects = items
    .map((item) => getProjectById(item.id))
    .filter((p): p is Project => !!p);

  if (projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold text-foreground">比較清單是空的</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            請先到建案總覽頁面，點擊建案卡片上的比較按鈕，
            將感興趣的建案加入比較清單（最多 5 個）。
          </p>
          <Link href="/projects">
            <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full px-6">
              <Search className="w-4 h-4" />
              瀏覽建案
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasIncompleteProjects = projects.some(isDataIncomplete);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground -ml-2">
                    <ArrowLeft className="w-4 h-4" />
                    返回
                  </Button>
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-foreground">建案比較</h1>
              <p className="text-sm text-muted-foreground mt-1">
                正在比較 <strong style={{ color: "#9a7b00" }}>{projects.length}</strong> 個建案
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                清除全部
              </Button>
              <Button asChild size="sm" className="bg-[#06C755] hover:bg-[#05b34d] text-white gap-1.5 rounded-full">
                <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                  <Phone className="w-3.5 h-3.5" />
                  詢問學韜
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Incomplete data warning */}
      {hasIncompleteProjects && (
        <div className="container pt-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              部分建案的資料尚待補充（標示 <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold text-[10px]"><AlertTriangle className="w-2.5 h-2.5" />資料待補</span>），
              比較結果中顯示「-」的欄位表示該資料尚未取得，並非代表該建案不具備此項目。
            </p>
          </div>
        </div>
      )}

      {/* Compare Table */}
      <div className="container py-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="sticky left-0 bg-card z-10 px-4 py-4 text-left text-xs font-semibold text-muted-foreground border-r border-border min-w-[120px]">
                    比較項目
                  </th>
                  {projects.map((p) => {
                    const incomplete = isDataIncomplete(p);
                    const completeness = getDataCompleteness(p);
                    return (
                      <th key={p.id} className="px-4 py-4 text-left min-w-[200px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/project/${p.id}`}>
                              <span className="text-sm font-bold text-card-foreground hover:text-primary transition-colors">
                                {p.建案名稱}
                              </span>
                            </Link>
                            {incomplete && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-700 align-middle">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                資料待補
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(p.id)}
                            className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.建設公司 || "建設公司未知"}
                          {p.construction_group && !p.建設公司?.includes(p.construction_group) && (
                            <span className="text-primary/70 ml-1">({p.construction_group})</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                completeness >= 75 ? "bg-emerald-500" :
                                completeness >= 50 ? "bg-amber-500" :
                                "bg-red-400"
                              }`}
                              style={{ width: `${completeness}%` }}
                            />
                          </div>
                          <span className={`text-[9px] font-bold ${
                            completeness >= 75 ? "text-emerald-600" :
                            completeness >= 50 ? "text-amber-600" :
                            "text-red-500"
                          }`}>
                            {completeness}%
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Section: 五大標語 */}
                <tr>
                  <td
                    colSpan={projects.length + 1}
                    className="px-4 py-2.5 bg-muted/50 text-xs font-bold text-foreground tracking-wider"
                  >
                    五大優勢標語
                  </td>
                </tr>
                {SLOGAN_CATEGORIES.map((cat) => (
                  <SloganRow key={cat.key} category={cat} projects={projects} />
                ))}

                {/* Section: 基本資訊 */}
                <tr>
                  <td
                    colSpan={projects.length + 1}
                    className="px-4 py-2.5 bg-muted/50 text-xs font-bold text-foreground tracking-wider"
                  >
                    基本資訊
                  </td>
                </tr>
                <CompareRow
                  label="行政區"
                  icon={MapPin}
                  values={projects.map((p) => p.行政區)}
                />
                <CompareRow
                  label="重劃區"
                  icon={MapPin}
                  values={projects.map((p) => p.重劃區)}
                />
                <CompareRow
                  label="建設集團"
                  icon={Building2}
                  values={projects.map((p) => p.construction_group || "-")}
                  highlight
                />
                <CompareRow
                  label="建築結構"
                  icon={Building2}
                  values={projects.map((p) => p.建築結構 || "-")}
                />
                <CompareRow
                  label="使用分區"
                  icon={MapPin}
                  values={projects.map((p) => p.使用分區 || "-")}
                />
                <CompareRow
                  label="主要用途"
                  icon={Building2}
                  values={projects.map((p) => p.主要用途 || "-")}
                />
                <CompareRow
                  label="負責人"
                  icon={Users}
                  values={projects.map((p) => p.負責人 || "-")}
                />
                <CompareRow
                  label="樓層"
                  icon={Layers}
                  values={projects.map((p) => p.floors?.description || "-")}
                />
                <CompareRow
                  label="基地面積"
                  icon={Ruler}
                  values={projects.map((p) => p.基地面積坪 > 0 ? `${p.基地面積坪}坪` : "-")}
                />
                <CompareRow
                  label="坐落地號"
                  icon={MapPin}
                  values={projects.map((p) => p.坐落地號 || "-")}
                />

                {/* Section: 社區規模 & 電梯比 */}
                <tr>
                  <td
                    colSpan={projects.length + 1}
                    className="px-4 py-2.5 bg-muted/50 text-xs font-bold text-foreground tracking-wider"
                  >
                    社區規模與電梯比
                  </td>
                </tr>
                <CompareRow
                  label="總戶數"
                  icon={Users}
                  values={projects.map((p) => p.units?.total > 0 ? `${p.units.total}戶` : "-")}
                  highlight
                />
                <CompareRow
                  label="社區規模"
                  icon={Users}
                  values={projects.map((p) => <CommunitySizeBadge project={p} />)}
                  highlight
                />
                <CompareRow
                  label="戶梯配置"
                  icon={Users}
                  values={projects.map((p) => p.戶梯配置 || "-")}
                />
                <CompareRow
                  label="電梯戶數比"
                  icon={ArrowUpDown}
                  values={projects.map((p) => <ElevatorBadge project={p} />)}
                  highlight
                />
                <CompareRow
                  label="房型規劃"
                  values={projects.map((p) => p.room_types_standard?.join("、") || p.房型規劃?.join("、") || "-")}
                />
                <CompareRow
                  label="車位"
                  icon={Car}
                  values={projects.map((p) => p.parking?.description || "-")}
                />
                <CompareRow
                  label="完工日期"
                  icon={Calendar}
                  values={projects.map((p) => p.完工日期 || "-")}
                />

                {/* Section: 生活機能 */}
                <tr>
                  <td
                    colSpan={projects.length + 1}
                    className="px-4 py-2.5 bg-muted/50 text-xs font-bold text-foreground tracking-wider"
                  >
                    生活機能
                  </td>
                </tr>
                <CompareRow
                  label="學區"
                  icon={GraduationCap}
                  values={projects.map((p) => p.學區 || "-")}
                  highlight
                />
                <CompareRow
                  label="公設配置"
                  icon={Building2}
                  values={projects.map((p) => p.公設配置 || "-")}
                />
                <CompareRow
                  label="交通"
                  icon={MapPin}
                  values={projects.map((p) => p.交通 || "-")}
                />
                <CompareRow
                  label="綠地"
                  icon={Trees}
                  values={projects.map((p) => p.綠地 || "-")}
                />
                <CompareRow
                  label="商圈"
                  icon={ShoppingBag}
                  values={projects.map((p) => p.商圈 || "-")}
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            對以上建案有興趣？聯絡學韜為您安排專業諮詢
          </p>
          <Button asChild className="mt-3 bg-[#06C755] hover:bg-[#05b34d] text-white gap-2 rounded-full px-8">
            <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
              <Phone className="w-4 h-4" />
              Line 預約看屋
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
