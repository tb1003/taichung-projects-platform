/**
 * Design: 暖陽台中 - 在地溫暖品牌風格
 * Projects: 建案總覽列表頁，含進階篩選（6 條件）與排序功能
 * Phase 2: 新增建設集團搜尋、房型多選、電梯比評級、社區規模篩選
 */
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import {
  Search, SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp,
  Building2, Layers, Users, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "@/components/ProjectCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ELEVATOR_GRADES,
  COMMUNITY_SIZE_INFO,
} from "@/lib/types";
import { zoneNameToSlug, getStandardZoneName } from "@/hooks/useRedevelopmentZones";

export default function Projects() {
  const [location] = useLocation();
  const {
    filteredProjects,
    filters,
    updateFilter,
    toggleRoomType,
    resetFilters,
    hasActiveFilters,
    sortBy,
    setSortBy,
    districts,
    zones,
    builderOptions,
    availableRoomTypes,
  } = useProjects();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search");
    const zone = params.get("zone");
    const district = params.get("district");
    if (search) updateFilter("search", search);
    if (zone) updateFilter("zone", zone);
    if (district) updateFilter("district", district);
  }, []);

  // Auto-expand advanced filters if any advanced filter is active
  useEffect(() => {
    if (
      filters.builder ||
      filters.roomTypes.length > 0 ||
      filters.elevatorGrade ||
      filters.communitySize
    ) {
      setShowAdvanced(true);
    }
  }, []);

  const activeFilterCount = [
    filters.search,
    filters.district,
    filters.zone,
    filters.builder,
    filters.roomTypes.length > 0 ? "yes" : "",
    filters.elevatorGrade,
    filters.communitySize,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6">
          <h1 className="text-2xl font-bold text-foreground">建案總覽</h1>
          <p className="text-sm text-muted-foreground mt-1">
            共{" "}
            <strong className="font-semibold" style={{ color: "#9a7b00" }}>
              {filteredProjects.length}
            </strong>{" "}
            個建案
            {hasActiveFilters && ` (已篩選，${activeFilterCount} 個條件)`}
          </p>
        </div>
      </div>

      <div className="container py-6">
        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">篩選條件</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                清除篩選
              </Button>
            )}
          </div>

          {/* Row 1: Basic filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜尋建案、建設公司、集團..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter("search", "")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* District */}
            <Select
              value={filters.district || "all"}
              onValueChange={(v) => updateFilter("district", v === "all" ? "" : v)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="行政區" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部行政區</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Zone */}
            <div className="flex gap-1.5">
              <Select
                value={filters.zone || "all"}
                onValueChange={(v) => updateFilter("zone", v === "all" ? "" : v)}
              >
                <SelectTrigger className="rounded-lg flex-1">
                  <SelectValue placeholder="重劃區" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部重劃區</SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.zone && (() => {
                const stdName = getStandardZoneName(filters.zone);
                return stdName ? (
                  <Link
                    href={`/zone/${zoneNameToSlug(stdName)}`}
                    title={`查看 ${stdName} 詳情`}
                    className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                  </Link>
                ) : null;
              })()}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">依名稱排序</SelectItem>
                <SelectItem value="units-desc">戶數多→少</SelectItem>
                <SelectItem value="units-asc">戶數少→多</SelectItem>
                <SelectItem value="district">依行政區</SelectItem>
                <SelectItem value="elevator-asc">電梯戶數比 優→差</SelectItem>
                <SelectItem value="elevator-desc">電梯戶數比 差→優</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toggle advanced */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showAdvanced ? "收起進階篩選" : "展開進階篩選"}
            {!showAdvanced &&
              (filters.builder || filters.roomTypes.length > 0 || filters.elevatorGrade || filters.communitySize) && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {[filters.builder, filters.roomTypes.length > 0 ? "y" : "", filters.elevatorGrade, filters.communitySize].filter(Boolean).length}
                </span>
              )}
          </button>

          {/* Row 2: Advanced filters */}
          {showAdvanced && (
            <div className="mt-3 pt-3 border-t border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Builder / Group */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    建設公司 / 集團
                  </label>
                  <Select
                    value={filters.builder || "all"}
                    onValueChange={(v) =>
                      updateFilter("builder", v === "all" ? "" : v)
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="全部建設公司" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="all">全部建設公司</SelectItem>
                      {/* Groups first */}
                      <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        建設集團
                      </div>
                      {builderOptions
                        .filter((o) => o.isGroup)
                        .map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-t border-border mt-1 pt-1.5">
                        個別建設公司
                      </div>
                      {builderOptions
                        .filter((o) => !o.isGroup)
                        .map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Elevator Grade */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />
                    電梯戶數比
                  </label>
                  <Select
                    value={filters.elevatorGrade || "all"}
                    onValueChange={(v) =>
                      updateFilter("elevatorGrade", v === "all" ? "" : v)
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="全部評級" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部評級</SelectItem>
                      {ELEVATOR_GRADES.map((g) => (
                        <SelectItem key={g.grade} value={g.grade}>
                          <span className="flex items-center gap-2">
                            <span className={`font-semibold ${g.color}`}>
                              {g.label}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {g.range}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Community Size */}
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    社區規模
                  </label>
                  <Select
                    value={filters.communitySize || "all"}
                    onValueChange={(v) =>
                      updateFilter("communitySize", v === "all" ? "" : v)
                    }
                  >
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="全部規模" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部規模</SelectItem>
                      {COMMUNITY_SIZE_INFO.map((s) => (
                        <SelectItem key={s.size} value={s.size}>
                          <span className="flex items-center gap-2">
                            <span className={`font-semibold ${s.color}`}>
                              {s.size}
                            </span>
                            <span className="text-muted-foreground text-[10px]">
                              {s.range}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Room type multi-select chips */}
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  房型篩選
                  {filters.roomTypes.length > 0 && (
                    <span className="text-[10px] text-primary font-semibold">
                      （已選 {filters.roomTypes.length} 個）
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRoomTypes.map((rt) => {
                    const isActive = filters.roomTypes.includes(rt);
                    return (
                      <button
                        key={rt}
                        onClick={() => toggleRoomType(rt)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {rt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">
              找不到符合條件的建案
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              請嘗試調整篩選條件或搜尋其他關鍵字
            </p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="mt-4 rounded-full"
            >
              清除所有篩選
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
