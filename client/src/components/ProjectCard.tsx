/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * ProjectCard: 建案卡片，含建案位置、完工狀態、一句摘要、標語(最多2則)、戶數+房型
 */
import { Link, useLocation } from "wouter";
import {
  Building2, MapPin, Users, GitCompareArrows, Check,
  AlertTriangle, ArrowUpDown,
} from "lucide-react";
import type { Project } from "@/lib/types";
import { isDataIncomplete, getElevatorGradeInfo, getCommunitySizeInfo } from "@/lib/types";
import { zoneNameToSlug, getStandardZoneName } from "@/hooks/useRedevelopmentZones";
import { useRandomSlogans } from "@/hooks/useRandomSlogans";
import { useProjectImages } from "@/hooks/useProjectImages";
import { getCategoryStyle } from "@/lib/sloganCategories";
import { extractYouTubeId, getYouTubeThumbUrl } from "@/lib/youtube";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const { addItem, removeItem, isInCompare, isMaxed } = useCompare();
  const [, navigate] = useLocation();
  const { images } = useProjectImages(project.id);
  const exteriorImage = images.exterior?.length > 0 ? images.exterior[0] : null;
  const amenityImage = images.amenity?.length > 0 ? images.amenity[0] : null;
  const firstVideo = project.videos?.find((v) => (v.visible ?? true)) ?? null;
  const firstVideoYouTubeId = firstVideo ? (firstVideo.youtubeId || extractYouTubeId(firstVideo.url)) : null;
  const videoThumb = firstVideoYouTubeId ? getYouTubeThumbUrl(firstVideoYouTubeId) : null;
  /** 名稱旁縮圖優先：外觀照 → 公設照 → 影片縮圖 */
  const mediaThumb = exteriorImage ?? amenityImage ?? videoThumb;
  const inCompare = isInCompare(project.id);
  const incomplete = isDataIncomplete(project);

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeItem(project.id);
      toast.info(`已從比較清單移除「${project.建案名稱}」`);
    } else if (isMaxed) {
      toast.warning("比較清單最多 5 個建案");
    } else {
      addItem({ id: project.id, name: project.建案名稱 });
      toast.success(`已加入比較清單「${project.建案名稱}」`);
    }
  };

  const randomSlogans = useRandomSlogans(project.id, project.slogans || {});
  const maxFloor = project.floors?.ground?.length
    ? Math.max(...project.floors.ground)
    : 0;

  const elevatorInfo = getElevatorGradeInfo(project.elevator_grade);
  const communityInfo = getCommunitySizeInfo(project.community_size);

  /** 由完工日期推導顯示用狀態（預售/成屋/興建中），無則不顯示 */
  const completionLabel = (() => {
    const d = (project.完工日期 || "").trim();
    if (!d) return null;
    if (/預售/i.test(d)) return "預售";
    if (/成屋|完工/i.test(d)) return "成屋";
    if (/興建|工程|施工/i.test(d)) return "興建中";
    return d.length > 12 ? `${d.slice(0, 12)}…` : d;
  })();

  return (
    <Link href={`/project/${project.id}`}>
      <article className="group bg-card rounded-xl border border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 overflow-hidden h-full flex flex-col">
        {/* Top color bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary/80 to-primary/30" />

        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Header：案件名稱 － 社區外觀照（有則顯示）－ 加入比較按鈕 */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-card-foreground group-hover:text-primary/90 transition-colors truncate">
                  {project.建案名稱}
                </h3>
                {incomplete && (
                  <span title="資料待補充">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {project.建設公司 || "建設公司未知"}
                {project.construction_group && !project.建設公司?.includes(project.construction_group) && (
                  <span className="text-primary/70 ml-1">
                    ({project.construction_group})
                  </span>
                )}
              </p>
            </div>
            {mediaThumb && (
              <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted border border-border/50">
                <img
                  src={mediaThumb}
                  alt={
                    exteriorImage === mediaThumb
                      ? `${project.建案名稱} 社區外觀`
                      : amenityImage === mediaThumb
                        ? `${project.建案名稱} 公設`
                        : `${project.建案名稱} 影片縮圖`
                  }
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className={`shrink-0 rounded-full h-8 w-8 p-0 ${
                inCompare
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  : "hover:border-primary/50"
              }`}
              onClick={handleCompare}
              title={inCompare ? "移除比較" : "加入比較"}
            >
              {inCompare ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <GitCompareArrows className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>

          {/* Location tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10" style={{ color: "#9a7b00" }}>
              <MapPin className="w-3 h-3" />
              {project.行政區}
            </span>
            {project.重劃區 && project.重劃區 !== "非重劃區" && (() => {
              const stdName = getStandardZoneName(project.重劃區);
              return stdName ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/zone/${zoneNameToSlug(stdName)}`);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors cursor-pointer"
                >
                  {project.重劃區}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                  {project.重劃區}
                </span>
              );
            })()}
          </div>

          {/* 建案位置（一行，有資料才顯示） */}
          {project.建案位置?.trim() && (
            <p className="text-xs text-muted-foreground truncate" title={project.建案位置}>
              {project.建案位置}
            </p>
          )}

          {/* 完工年月／狀態（預售/成屋/興建中或日期，有資料才顯示） */}
          {completionLabel && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
              <span className="text-slate-500">完工年月</span>
              <span>{completionLabel}</span>
            </span>
          )}

          {/* 社區房型 */}
          {project.room_types_standard && project.room_types_standard.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">社區房型</span>
              {project.room_types_standard.map((rt) => (
                <span
                  key={rt}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
                >
                  {rt}
                </span>
              ))}
            </div>
          )}

          {/* 標語最多 2 則 */}
          {randomSlogans.length > 0 && (
            <div className="flex flex-col gap-1">
              {randomSlogans.slice(0, 2).map((item, idx) => {
                const style = getCategoryStyle(item.category);
                const Icon = style.icon;
                return (
                  <div
                    key={idx}
                    className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border leading-relaxed line-clamp-1 flex items-center gap-1.5 ${style.bgColor} ${style.textColor} ${style.borderColor}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 一句摘要（統計列上方 1～2 行，有資料才顯示；SEO/AEO 友善） */}
          {project.description_500?.trim() && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description_500}
            </p>
          )}

          {/* Stats row：戶數 + 房型（樓層改於詳情頁呈現） */}
          <div className="mt-auto pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-center">
            <div className="flex flex-col items-center gap-0.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {project.units?.total > 0 ? `${project.units.total}戶` : "-"}
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                {project.房型規劃?.length > 0
                  ? project.房型規劃.slice(0, 2).join("·")
                  : "-"}
              </span>
            </div>
          </div>

          {/* Elevator & Community badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {elevatorInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${elevatorInfo.bgColor}`}
                title={`電梯戶數比: ${project.elevator_ratio}戶/梯`}
              >
                <ArrowUpDown className="w-2.5 h-2.5" />
                {elevatorInfo.label}
                {project.elevator_ratio !== null && (
                  <span className="opacity-70">
                    {project.elevator_ratio}
                  </span>
                )}
              </span>
            )}
            {communityInfo && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${communityInfo.bgColor}`}
                title={`社區規模: ${communityInfo.range}`}
              >
                {communityInfo.size}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
