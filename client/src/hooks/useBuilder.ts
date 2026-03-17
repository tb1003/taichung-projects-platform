import { useMemo } from 'react';
import buildersData from '@/data/builders.json';
import builderNameMapData from '@/data/builderNameMap.json';

interface Builder {
  builder_name: string;
  parent_group: string | null;
  core_slogan: string;
  in_depth_analysis: string;
  construction_partner: string;
  after_sales_service: string;
  classic_style: string;
}

export function useBuilder(builderName: string | undefined): Builder | null {
  return useMemo(() => {
    if (!builderName) return null;

    // 使用名稱對應表進行轉換
    const nameMap = builderNameMapData as Record<string, string>;
    const normalizedName = nameMap[builderName] || builderName;

    // 在 builders 資料中查找
    const builders = buildersData as Builder[];
    const builder = builders.find(b => b.builder_name === normalizedName);

    return builder || null;
  }, [builderName]);
}
