import { useMemo } from 'react';
import zonesData from '@/data/zones.json';
import zoneNameMapData from '@/data/zone_name_map.json';
import projectsData from '@/data/projects.json';

export interface RedevelopmentZone {
  zone_name: string;
  development_type: string;
  core_features: string;
  in_depth_analysis: string;
  key_facilities: string;
}

// 建案 JSON 中的重劃區名稱 -> zones.json 中的標準名稱
const zoneNameMap: Record<string, string> = zoneNameMapData as Record<string, string>;

// 反向對應：zones.json 標準名稱 -> 建案 JSON 中可能的名稱（陣列）
function buildReverseMap(): Record<string, string[]> {
  const reverse: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(zoneNameMap)) {
    if (!reverse[val]) reverse[val] = [];
    reverse[val].push(key);
  }
  return reverse;
}

// 將 zone_name 轉換為 URL-safe slug（用於路由）
export function zoneNameToSlug(name: string): string {
  return encodeURIComponent(name);
}

export function slugToZoneName(slug: string): string {
  return decodeURIComponent(slug);
}

// 取得所有重劃區資料
export function useRedevelopmentZones() {
  const zones = useMemo(() => zonesData as RedevelopmentZone[], []);
  return zones;
}

// 取得單一重劃區資料
export function useZoneByName(zoneName: string) {
  const zones = useMemo(() => zonesData as RedevelopmentZone[], []);
  return useMemo(
    () => zones.find((z) => z.zone_name === zoneName) ?? null,
    [zones, zoneName]
  );
}

// 取得特定重劃區的相關建案
export function useProjectsByZone(zoneName: string) {
  const reverseMap = useMemo(() => buildReverseMap(), []);

  return useMemo(() => {
    // 找出該 zone 對應的建案 JSON 名稱（可能多個）
    const projectZoneNames = reverseMap[zoneName] ?? [];
    // 如果 zone_name 本身就直接出現在建案中，也要包含
    const allMatchNames = new Set([zoneName, ...projectZoneNames]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = ((projectsData as any).projects ?? []) as any[];
    return projects.filter((p) => {
      const pZone: string = p['\u91cd\u5283\u5340'] ?? p.replot_zone ?? '';
      return allMatchNames.has(pZone);
    });
  }, [reverseMap, zoneName]);
}

// 取得建案 JSON 中的重劃區名稱對應到 zones.json 的標準名稱
export function getStandardZoneName(rawZoneName: string): string | null {
  if (!rawZoneName) return null;
  // 直接匹配
  const direct = (zonesData as RedevelopmentZone[]).find(
    (z) => z.zone_name === rawZoneName
  );
  if (direct) return direct.zone_name;
  // 透過對應表
  return zoneNameMap[rawZoneName] ?? null;
}
