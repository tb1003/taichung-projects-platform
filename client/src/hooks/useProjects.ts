import { useState, useMemo, useCallback } from "react";
import type { Project, ProjectsData } from "@/lib/types";
import { normalizeForSearch } from "@/lib/utils";
import rawData from "@/data/projects.json";
import buildersData from "@/data/builders.json";

const data = rawData as ProjectsData;

export interface Filters {
  search: string;
  district: string;
  zone: string;
  /** 可以是建設公司名稱，也可以是集團名稱 */
  builder: string;
  /** 多選房型，逗號分隔 */
  roomTypes: string[];
  elevatorGrade: string;
  communitySize: string;
}

const defaultFilters: Filters = {
  search: "",
  district: "",
  zone: "",
  builder: "",
  roomTypes: [],
  elevatorGrade: "",
  communitySize: "",
};

export function useProjects() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<string>("name");

  const allProjects = useMemo(() => data.projects, []);

  /** 依集團名稱取得旗下建設公司列表（搜尋「大城」時同時出現大城建設、大映建設等） */
  const builderNamesByParentGroup = useMemo(() => {
    const list = buildersData as { builder_name: string; parent_group: string | null }[];
    const map = new Map<string, string[]>();
    list.forEach((b) => {
      const g = b.parent_group;
      if (g && g !== "【資料不足，無法確認】") {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(b.builder_name);
      }
    });
    return map;
  }, []);

  const districts = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.行政區).filter(Boolean));
    return Array.from(set).sort();
  }, [allProjects]);

  const zones = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.重劃區).filter(Boolean));
    return Array.from(set).sort();
  }, [allProjects]);

  /** 建設公司列表（去重） */
  const builders = useMemo(() => {
    const set = new Set(allProjects.map((p) => p.建設公司).filter(Boolean));
    return Array.from(set).sort();
  }, [allProjects]);

  /** 建設集團列表（去重，排除 null） */
  const constructionGroups = useMemo(() => {
    const set = new Set(
      allProjects
        .map((p) => p.construction_group)
        .filter((g): g is string => !!g)
    );
    return Array.from(set).sort();
  }, [allProjects]);

  /** 合併的建設公司/集團選項列表 */
  const builderOptions = useMemo(() => {
    const groupOptions = constructionGroups.map((g) => ({
      value: `group:${g}`,
      label: `${g}（集團）`,
      isGroup: true,
    }));
    const companyOptions = builders.map((b) => ({
      value: `company:${b}`,
      label: b,
      isGroup: false,
    }));
    return [...groupOptions, ...companyOptions];
  }, [constructionGroups, builders]);

  /** 可用的標準房型 */
  const availableRoomTypes = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      p.room_types_standard?.forEach((rt) => set.add(rt));
    });
    // Sort: 1房, 1+1房, 2房, 2+1房, 3房, 3+1房, 4房, then others
    const order = ["1房", "1+1房", "2房", "2+1房", "3房", "3+1房", "4房"];
    const sorted = Array.from(set).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b, "zh-TW");
    });
    return sorted;
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    let result = allProjects;

    // 搜尋：不分全形/半形、英文大小寫、國字與阿拉伯數字；支援建案名稱、建設公司、建案位置、tags、集團；搜尋「大城」時含同集團建案
    if (filters.search) {
      const q = normalizeForSearch(filters.search);
      const 大城營建機構Builders = builderNamesByParentGroup.get("大城營建機構") || [];
      result = result.filter(
        (p) =>
          normalizeForSearch(p.建案名稱 || "").includes(q) ||
          normalizeForSearch(p.建設公司 || "").includes(q) ||
          normalizeForSearch(p.建案位置 || "").includes(q) ||
          (p.construction_group && normalizeForSearch(p.construction_group).includes(q)) ||
          (p.tags && p.tags.some((t) => normalizeForSearch(t).includes(q))) ||
          (normalizeForSearch("大城") === q && 大城營建機構Builders.includes(p.建設公司 || ""))
      );
    }

    if (filters.district) {
      result = result.filter((p) => p.行政區 === filters.district);
    }

    if (filters.zone) {
      result = result.filter((p) => p.重劃區 === filters.zone);
    }

    // 建設公司/集團篩選：雙層邏輯
    if (filters.builder) {
      if (filters.builder.startsWith("group:")) {
        const groupName = filters.builder.slice(6);
        result = result.filter((p) => p.construction_group === groupName);
      } else if (filters.builder.startsWith("company:")) {
        const companyName = filters.builder.slice(8);
        result = result.filter((p) => p.建設公司 === companyName);
      }
    }

    // 房型多選：建案需包含所有選中的房型
    if (filters.roomTypes.length > 0) {
      result = result.filter((p) =>
        filters.roomTypes.every((rt) =>
          p.room_types_standard?.includes(rt)
        )
      );
    }

    // 電梯比評級篩選
    if (filters.elevatorGrade) {
      result = result.filter((p) => p.elevator_grade === filters.elevatorGrade);
    }

    // 社區規模篩選
    if (filters.communitySize) {
      result = result.filter((p) => p.community_size === filters.communitySize);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result = [...result].sort((a, b) =>
          a.建案名稱.localeCompare(b.建案名稱, "zh-TW")
        );
        break;
      case "units-desc":
        result = [...result].sort(
          (a, b) => (b.units?.total || 0) - (a.units?.total || 0)
        );
        break;
      case "units-asc":
        result = [...result].sort(
          (a, b) => (a.units?.total || 0) - (b.units?.total || 0)
        );
        break;
      case "district":
        result = [...result].sort((a, b) =>
          a.行政區.localeCompare(b.行政區, "zh-TW")
        );
        break;
      case "elevator-asc":
        result = [...result].sort(
          (a, b) => (a.elevator_ratio || 999) - (b.elevator_ratio || 999)
        );
        break;
      case "elevator-desc":
        result = [...result].sort(
          (a, b) => (b.elevator_ratio || 0) - (a.elevator_ratio || 0)
        );
        break;
      default:
        break;
    }

    return result;
  }, [allProjects, filters, sortBy, builderNamesByParentGroup]);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string | string[]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleRoomType = useCallback((roomType: string) => {
    setFilters((prev) => {
      const current = prev.roomTypes;
      const next = current.includes(roomType)
        ? current.filter((rt) => rt !== roomType)
        : [...current, roomType];
      return { ...prev, roomTypes: next };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const getProjectById = useCallback(
    (id: number): Project | undefined => {
      return allProjects.find((p) => p.id === id);
    },
    [allProjects]
  );

  const hasActiveFilters = !!(
    filters.search ||
    filters.district ||
    filters.zone ||
    filters.builder ||
    filters.roomTypes.length > 0 ||
    filters.elevatorGrade ||
    filters.communitySize
  );

  return {
    allProjects,
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
    builders,
    builderOptions,
    constructionGroups,
    availableRoomTypes,
    getProjectById,
    meta: {
      source: data.source,
      updated: data.updated,
      totalProjects: data.total_projects,
    },
    owner: data.owner,
  };
}
