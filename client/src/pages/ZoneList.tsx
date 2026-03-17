/**
 * ZoneList.tsx — 重劃區介紹列表頁
 * 路由：/zones
 * 設計：與整體平台一致，暖陽台中風格
 */

import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { MapPin, Building2, ChevronRight, Search, LayoutGrid } from 'lucide-react';
import { useRedevelopmentZones, zoneNameToSlug, useProjectsByZone } from '@/hooks/useRedevelopmentZones';
import zonesData from '@/data/zones.json';

// 開發類型對應顏色
const devTypeStyle: Record<string, { badge: string; card: string; dot: string }> = {
  '公辦': {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    card: 'hover:border-emerald-300 hover:bg-emerald-50/30',
    dot: 'bg-emerald-500',
  },
  '自辦': {
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    card: 'hover:border-blue-300 hover:bg-blue-50/30',
    dot: 'bg-blue-500',
  },
  '區段徵收': {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    card: 'hover:border-amber-300 hover:bg-amber-50/30',
    dot: 'bg-amber-500',
  },
  '民間俗稱特區': {
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    card: 'hover:border-purple-300 hover:bg-purple-50/30',
    dot: 'bg-purple-500',
  },
};

function getDevTypeStyle(devType: string) {
  return devTypeStyle[devType] ?? {
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    card: 'hover:border-gray-300 hover:bg-gray-50/30',
    dot: 'bg-gray-400',
  };
}

// 取得所有重劃區的建案數（批次計算）
function useAllZoneProjectCounts() {
  const zones = useRedevelopmentZones();
  // 讀取建案資料
  const projectsData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require('@/data/projects.json');
    return (data.projects ?? []) as Array<{ 重劃區?: string }>;
  }, []);

  return useMemo(() => {
    const counts: Record<string, number> = {};
    for (const zone of zones) {
      counts[zone.zone_name] = 0;
    }
    for (const p of projectsData) {
      const rawZone = p['重劃區'] ?? '';
      // 直接匹配
      if (counts[rawZone] !== undefined) {
        counts[rawZone]++;
      }
    }
    return counts;
  }, [zones, projectsData]);
}

// 開發類型分組順序
const DEV_TYPE_ORDER = ['公辦', '自辦', '區段徵收', '民間俗稱特區'];

export default function ZoneList() {
  const zones = useRedevelopmentZones();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string>('全部');

  // 依開發類型分組
  const grouped = useMemo(() => {
    const map: Record<string, typeof zones> = {};
    for (const z of zones) {
      if (!map[z.development_type]) map[z.development_type] = [];
      map[z.development_type].push(z);
    }
    return map;
  }, [zones]);

  // 所有開發類型
  const devTypes = useMemo(() => {
    const types = DEV_TYPE_ORDER.filter((t) => grouped[t]);
    const rest = Object.keys(grouped).filter((t) => !DEV_TYPE_ORDER.includes(t));
    return ['全部', ...types, ...rest];
  }, [grouped]);

  // 篩選後的重劃區
  const filtered = useMemo(() => {
    return zones.filter((z) => {
      const matchType = activeType === '全部' || z.development_type === activeType;
      const matchSearch =
        !search ||
        z.zone_name.includes(search) ||
        z.core_features.includes(search) ||
        z.development_type.includes(search);
      return matchType && matchSearch;
    });
  }, [zones, search, activeType]);

  // 依開發類型分組（篩選後）
  const filteredGrouped = useMemo(() => {
    const map: Record<string, typeof zones> = {};
    for (const z of filtered) {
      if (!map[z.development_type]) map[z.development_type] = [];
      map[z.development_type].push(z);
    }
    return map;
  }, [filtered]);

  const groupOrder = DEV_TYPE_ORDER.filter((t) => filteredGrouped[t]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="container py-10">
          <div className="flex items-center gap-3 mb-3">
            <LayoutGrid className="w-6 h-6 text-amber-400" />
            <span className="text-sm text-slate-400">台中重劃區全覽</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">重劃區介紹</h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl">
            台中市 {zones.length} 個主要重劃區深度解析，涵蓋公辦、自辦、區段徵收等類型，
            幫助您找到最適合的置產地段。
          </p>

          {/* 搜尋 */}
          <div className="mt-6 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋重劃區名稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 類型篩選 Tab */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {devTypes.map((type) => {
              const count = type === '全部' ? zones.length : (grouped[type]?.length ?? 0);
              const style = type === '全部' ? null : getDevTypeStyle(type);
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeType === type
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type}
                  <span className={`ml-1.5 text-xs ${activeType === type ? 'text-amber-100' : 'text-gray-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 主體內容 */}
      <div className="container py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>找不到符合條件的重劃區</p>
          </div>
        ) : activeType === '全部' ? (
          // 全部模式：依類型分組顯示
          <div className="space-y-10">
            {groupOrder.map((devType) => {
              const typeZones = filteredGrouped[devType] ?? [];
              const style = getDevTypeStyle(devType);
              return (
                <section key={devType}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                    <h2 className="text-lg font-bold text-gray-800">{devType}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>
                      {typeZones.length} 個
                    </span>
                  </div>
                  <ZoneCardGrid zones={typeZones} />
                </section>
              );
            })}
          </div>
        ) : (
          // 單一類型模式
          <ZoneCardGrid zones={filtered} />
        )}
      </div>
    </div>
  );
}

// 重劃區卡片網格
function ZoneCardGrid({ zones }: { zones: ReturnType<typeof useRedevelopmentZones> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {zones.map((zone) => {
        const style = getDevTypeStyle(zone.development_type);
        // 擷取核心特色第一行（標語）
        const lines = zone.core_features.split('\n').filter(Boolean);
        const slogan = lines[0] ?? '';
        const desc = lines.slice(1).join(' ').slice(0, 60);

        return (
          <Link
            key={zone.zone_name}
            href={`/zone/${zoneNameToSlug(zone.zone_name)}`}
            className={`block bg-white rounded-xl border border-gray-200 p-5 transition-all group shadow-sm ${style.card}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${style.badge}`}
              >
                {zone.development_type}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors mt-0.5" />
            </div>

            <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-amber-800 transition-colors leading-snug">
              {zone.zone_name}
            </h3>

            {slogan && (
              <p className="text-xs text-amber-700 font-medium mb-2">{slogan}</p>
            )}

            {desc && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{desc}…</p>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-400">
              <Building2 className="w-3 h-3" />
              <span>查看詳情</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
