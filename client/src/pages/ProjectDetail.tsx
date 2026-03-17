/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * ProjectDetail: 建案詳情頁 - 五大標語 + 完整資訊 + 電梯比/社區規模卡 + CTA
 * Phase 2: 新增電梯比評級卡、社區規模提醒卡、集團標示、標準房型
 */
import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import {
  ArrowLeft, MapPin, Building2, Layers, Users, Car, GraduationCap,
  Trees, ShoppingBag, GitCompareArrows, Check, Phone,
  Ruler, Home as HomeIcon, Calendar, Star, AlertTriangle, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { useProjectImages } from "@/hooks/useProjectImages";
import { useCompare } from "@/contexts/CompareContext";
import { useBuilder } from "@/hooks/useBuilder";
import { SLOGAN_CATEGORIES, isDataIncomplete, getDataCompleteness } from "@/lib/types";
import { toast } from "sonner";
import CommunitySizeCard from "@/components/CommunitySizeCard";
import ElevatorGradeCard from "@/components/ElevatorGradeCard";
import FloatingContactBar from "@/components/FloatingContactBar";
import { zoneNameToSlug, getStandardZoneName } from "@/hooks/useRedevelopmentZones";
import ProjectVideosCard from "@/components/ProjectVideosCard";
import type { ProjectVideo } from "@/lib/types";
import { extractYouTubeId, getYouTubeThumbUrl } from "@/lib/youtube";

const LINE_URL = "https://lin.ee/OQ9zdLK";

const sloganIcons: Record<string, typeof MapPin> = {
  地段價值: MapPin,
  品牌建築: Building2,
  生活環境: Trees,
  生活機能: ShoppingBag,
  產品特色: Star,
};

export default function ProjectDetail() {
  const [, params] = useRoute("/project/:id");
  const { getProjectById } = useProjects();
  const { addItem, removeItem, isInCompare, isMaxed } = useCompare();

  const projectId = params?.id ? parseInt(params.id) : 0;
  const project = getProjectById(projectId);
  const builder = useBuilder(project?.建設公司);
  const { images: projectImages } = useProjectImages(projectId);
  const [detailVideos, setDetailVideos] = useState<ProjectVideo[]>([]);
  const [projectAgents, setProjectAgents] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (projectId > 0) {
      fetch(`/api/public/projects/${projectId}/agents`)
        .then((res) => (res.ok ? res.json() : { agents: [] }))
        .then((data) => setProjectAgents(Array.isArray(data?.agents) ? data.agents : []))
        .catch(() => setProjectAgents([]));
    } else {
      setProjectAgents([]);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId > 0) {
      fetch(`/api/public/projects/${projectId}/videos`)
        .then((res) => (res.ok ? res.json() : { videos: [] }))
        .then((data) => setDetailVideos(Array.isArray(data?.videos) ? data.videos : []))
        .catch(() => {
          const fallback = project?.videos && Array.isArray(project.videos) ? project.videos : [];
          setDetailVideos(fallback);
        });
    } else {
      setDetailVideos([]);
    }
  }, [projectId, project?.videos]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">找不到此建案</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4 rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回建案列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const inCompare = isInCompare(project.id);
  const incomplete = isDataIncomplete(project);
  const completeness = getDataCompleteness(project);

  const handleCompare = () => {
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

  const maxFloor = project.floors?.ground?.length
    ? Math.max(...project.floors.ground)
    : 0;

  const specs = [
    { icon: Layers, label: "樓層", value: project.floors?.description || (maxFloor > 0 ? `地上${maxFloor}層` : "") },
    { icon: Users, label: "總戶數", value: project.units?.total > 0 ? `${project.units.total}戶` : "" },
    { icon: HomeIcon, label: "房型", value: project.room_types_standard?.join("、") || project.房型規劃?.join("、") || "" },
    { icon: Car, label: "車位", value: project.parking?.description || (project.parking?.total > 0 ? `${project.parking.total}個` : "") },
    { icon: Ruler, label: "基地面積", value: project.基地面積坪 > 0 ? `${project.基地面積坪}坪` : "" },
    { icon: Calendar, label: "完工日期", value: project.完工日期 || "" },
    { icon: Layers, label: "使用分區", value: project.使用分區 || "" },
    { icon: HomeIcon, label: "主要用途", value: project.主要用途 || "" },
    { icon: FileText, label: "坐落地號", value: project.坐落地號 || "" },
  ];
  const hasAnySpec = specs.some((s) => s.value);

  const hasLifeInfo = !!(project.公設配置 || project.學區 || project.交通 || project.綠地 || project.商圈);

  const hasAnySlogans = SLOGAN_CATEGORIES.some(
    (cat) => project.slogans?.[cat.key]
  );

  const hasElevatorData = project.elevator_grade && project.elevator_ratio !== null;
  const hasCommunityData = project.community_size && project.units?.total > 0;
  const firstVideoFromApi = detailVideos.find((v) => (v.visible ?? true)) ?? null;
  const firstVideo = firstVideoFromApi ?? project.videos?.find((v) => (v.visible ?? true)) ?? null;
  const firstVideoYouTubeId = firstVideo ? (firstVideo.youtubeId || extractYouTubeId(firstVideo.url)) : null;
  const firstVideoThumb = firstVideoYouTubeId ? getYouTubeThumbUrl(firstVideoYouTubeId) : null;
  /** 名稱旁縮圖優先：外觀照 → 公設照 → 影片縮圖 */
  const nameCardThumb =
    projectImages.exterior?.[0] ?? projectImages.amenity?.[0] ?? firstVideoThumb ?? null;

  return (
    <>
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">首頁</Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-foreground transition-colors">建案總覽</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.建案名稱}</span>
        </div>
      </div>

      <div className="container py-6">
        {/* Back button + Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              返回列表
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              className={`gap-1.5 rounded-full ${
                inCompare ? "bg-primary text-primary-foreground border-primary" : ""
              }`}
            >
              {inCompare ? <Check className="w-3.5 h-3.5" /> : <GitCompareArrows className="w-3.5 h-3.5" />}
              {inCompare ? "已加入比較" : "加入比較"}
            </Button>
          </div>
        </div>

        {/* Data Incomplete Warning */}
        {incomplete && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">此建案資料尚待補充</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                目前資料完整度為 <strong>{completeness}%</strong>，部分欄位尚未取得。
                如需了解更多細節，歡迎直接聯絡學韜為您查詢。
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-0 items-start">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-card-foreground">{project.建案名稱}</h1>
                      {incomplete && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          資料待補
                        </span>
                      )}
                    </div>
                    {(project.建設公司 || project.負責人) && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.建設公司}
                        {project.負責人 && (
                          <span className="text-muted-foreground"> · 負責人：{project.負責人}</span>
                        )}
                        {project.construction_group && project.建設公司 && !project.建設公司?.includes(project.construction_group) && (
                          <span className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <Building2 className="w-2.5 h-2.5" />
                            {project.construction_group}
                          </span>
                        )}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10" style={{ color: "#9a7b00" }}>
                        <MapPin className="w-3 h-3" />
                        {project.行政區}
                      </span>
                      {project.重劃區 && project.重劃區 !== "非重劃區" && (() => {
                        const stdName = getStandardZoneName(project.重劃區);
                        return stdName ? (
                          <Link
                            href={`/zone/${zoneNameToSlug(stdName)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 transition-colors"
                          >
                            {project.重劃區}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                            {project.重劃區}
                          </span>
                        );
                      })()}
                      {project.建築結構 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                          {project.建築結構}
                        </span>
                      )}
                      {project.使用分區 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                          {project.使用分區}
                        </span>
                      )}
                      {project.主要用途 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                          {project.主要用途}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {nameCardThumb && (
                  <div
                    className={`self-stretch w-28 min-w-[7rem] rounded-lg overflow-hidden bg-muted border border-border/50 ${project.建案位置 ? "row-span-2" : ""}`}
                  >
                    <img src={nameCardThumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                {project.建案位置 ? (
                  <p className="text-xs text-muted-foreground mt-4 flex items-start gap-1.5 col-start-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {project.建案位置}
                  </p>
                ) : null}
              </div>
            </div>

            {/* 建案圖片：緊接在建案名稱卡片下方 */}
            {(projectImages.exterior?.length > 0 || projectImages.amenity?.length > 0 || projectImages.layout?.length > 0) && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-6">
                <h2 className="text-lg font-bold text-card-foreground">建案圖片</h2>
                {projectImages.exterior?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">外觀</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {projectImages.exterior.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border aspect-[4/3] bg-muted">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {projectImages.amenity?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">公設</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {projectImages.amenity.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border aspect-[4/3] bg-muted">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {projectImages.layout?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">格局配置圖</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {projectImages.layout.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border border-border aspect-[4/3] bg-muted">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project Videos（由 API 取得最新列表，後台新增的影片會即時顯示） */}
            {detailVideos.length > 0 && <ProjectVideosCard videos={detailVideos} />}

            {/* 負責業務電子名片（最多 2 位） */}
            {projectAgents.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  聯絡此社區
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projectAgents.slice(0, 2).map((agent) => (
                    <div
                      key={String(agent.id)}
                      className="flex gap-3 p-4 rounded-lg border border-border bg-muted/30"
                    >
                      {(agent.photoUrl as string) && (
                        <img
                          src={agent.photoUrl as string}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border border-border"
                        />
                      )}
                      {!(agent.photoUrl as string) && (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-7 h-7 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {(agent.name as string) && <p className="font-semibold text-card-foreground">{agent.name as string}</p>}
                        {(agent.title as string) && <p className="text-xs text-muted-foreground">{agent.title as string}</p>}
                        {(agent.phone as string) && (
                          <a href={`tel:${agent.phone}`} className="text-sm text-primary hover:underline block mt-1">{agent.phone as string}</a>
                        )}
                        {(agent.lineId as string) && (
                          <a
                            href={`https://line.me/ti/p/~${(agent.lineId as string).trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-sm text-[#06C755] hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Line 聯絡
                          </a>
                        )}
                        {(agent.intro as string) && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{agent.intro as string}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Five Slogans */}
            {hasAnySlogans && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-card-foreground mb-4">五大優勢標語</h2>
                {incomplete && (
                  <p className="text-xs text-amber-600 mb-3 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    以下標語為 AI 根據有限資訊生成，僅供參考
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SLOGAN_CATEGORIES.map((cat) => {
                    const Icon = sloganIcons[cat.key] || Star;
                    const slogan = project.slogans?.[cat.key] || "";
                    if (!slogan) return null;
                    return (
                      <div
                        key={cat.key}
                        className={`flex items-start gap-3 p-3.5 rounded-xl ${cat.color} border border-transparent`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                            {cat.label}
                          </p>
                          <p className="text-sm font-medium mt-0.5 leading-relaxed">
                            {slogan}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Key Stats */}
            {hasAnySpec && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-bold text-card-foreground mb-4">建案規格</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map((stat) => (
                    <div key={stat.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                      <stat.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
                        <p className="text-sm font-semibold text-card-foreground mt-0.5">
                          {stat.value || <span className="text-muted-foreground/50 font-normal">-</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No data placeholder */}
            {!hasAnySpec && !hasLifeInfo && !hasElevatorData && !hasCommunityData && (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-foreground">此建案的詳細資料尚在整理中</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  歡迎聯絡學韜，為您查詢此建案的最新資訊
                </p>
                <Button asChild size="sm" className="mt-4 bg-[#06C755] hover:bg-[#05b34d] text-white gap-1.5 rounded-full">
                  <a href={LINE_URL} target="_blank" rel="noopener noreferrer">
                    <Phone className="w-3.5 h-3.5" />
                    Line 詢問詳情
                  </a>
                </Button>
              </div>
            )}

            {/* Life Info */}
            {hasLifeInfo && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="text-lg font-bold text-card-foreground">生活資訊</h2>

                {project.公設配置 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5 mb-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      公設配置
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.公設配置.split("、").map((item, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                          {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.學區 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5 mb-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      學區
                    </h3>
                    <p className="text-sm text-muted-foreground">{project.學區}</p>
                  </div>
                )}

                {project.交通 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      交通
                    </h3>
                    <p className="text-sm text-muted-foreground">{project.交通}</p>
                  </div>
                )}

                {project.綠地 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5 mb-2">
                      <Trees className="w-4 h-4 text-primary" />
                      鄰近綠地
                    </h3>
                    <p className="text-sm text-muted-foreground">{project.綠地}</p>
                  </div>
                )}

                {project.商圈 && (
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-1.5 mb-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      鄰近商圈
                    </h3>
                    <p className="text-sm text-muted-foreground">{project.商圈}</p>
                  </div>
                )}
              </div>
            )}

            {/* 建設公司介紹：主內容最下方 */}
            {builder && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    建設公司介紹
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3">{project?.建設公司}</p>
                </div>
                {builder.core_slogan && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-sm font-semibold text-primary mb-1">核心標語</p>
                    <p className="text-sm text-foreground leading-relaxed">{builder.core_slogan}</p>
                  </div>
                )}
                {builder.parent_group && builder.parent_group !== "【資料不足，無法確認】" && (
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-1">集團背景</p>
                    <p className="text-muted-foreground">{builder.parent_group}</p>
                  </div>
                )}
                {builder.in_depth_analysis && builder.in_depth_analysis !== "【資料不足，無法確認】" && (
                  <div className="text-sm">
                    <p className="font-semibold text-foreground mb-2">深度分析</p>
                    <p className="text-muted-foreground leading-relaxed">{builder.in_depth_analysis}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {builder.construction_partner && builder.construction_partner !== "【資料不足，無法確認】" && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">營造夥伴</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{builder.construction_partner}</p>
                    </div>
                  )}
                  {builder.after_sales_service && builder.after_sales_service !== "【資料不足，無法確認】" && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">售後服務</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{builder.after_sales_service}</p>
                    </div>
                  )}
                </div>
                {builder.classic_style && builder.classic_style !== "【資料不足，無法確認】" && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">經典風格</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{builder.classic_style}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Quick Info */}
            {(() => {
              const quickItems = [
                { label: "建設公司", value: project.建設公司 },
                { label: "負責人", value: project.負責人 || undefined },
                { label: "所屬集團", value: project.construction_group || undefined },
                { label: "建築結構", value: project.建築結構 },
                { label: "使用分區", value: project.使用分區 || undefined },
                { label: "主要用途", value: project.主要用途 || undefined },
                { label: "坐落地號", value: project.坐落地號 || undefined },
                { label: "戶梯配置", value: project.戶梯配置 },
                { label: "樓層高度", value: project.樓層高度米 > 0 ? `${project.樓層高度米}m` : "" },
                { label: "電梯比", value: project.elevator_ratio !== null ? `${project.elevator_ratio} 戶/梯` : "" },
                { label: "電梯戶數比", value: project.elevator_grade || "" },
                { label: "社區規模", value: project.community_size || "" },
              ].filter(item => item.value);
              if (quickItems.length === 0) return null;
              return (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-card-foreground mb-3">快速資訊</h3>
                  <div className="space-y-2.5">
                    {quickItems.map((item) => (
                      <div key={item.label} className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-card-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 精緻社區卡片（社區規模） */}
            {hasCommunityData && (
              <CommunitySizeCard
                communitySize={project.community_size}
                totalUnits={project.units.total}
              />
            )}

            {/* Elevator Grade Card（放在快速資訊與社區規模下方） */}
            {hasElevatorData && (
              <ElevatorGradeCard
                elevatorGrade={project.elevator_grade}
                elevatorRatio={project.elevator_ratio}
                elevatorConfig={project.戶梯配置}
              />
            )}

            {/* Data completeness indicator */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-bold text-card-foreground mb-3">資料完整度</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completeness >= 75 ? "bg-emerald-500" :
                      completeness >= 50 ? "bg-amber-500" :
                      "bg-red-400"
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${
                  completeness >= 75 ? "text-emerald-600" :
                  completeness >= 50 ? "text-amber-600" :
                  "text-red-500"
                }`}>
                  {completeness}%
                </span>
              </div>
              {completeness < 75 && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  部分資料尚在整理中，歡迎聯絡學韜查詢
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <FloatingContactBar />
    </>
  );
}
