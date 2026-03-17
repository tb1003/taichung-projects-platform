/**
 * ZoneDetail.tsx — 重劃區詳情頁面
 * 設計風格：與整體平台一致，使用 Tailwind + shadcn/ui
 * 路由：/zone/:zoneName（zoneName 為 encodeURIComponent 後的重劃區名稱）
 */

import { useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useRandomSlogans } from '@/hooks/useRandomSlogans';
import { getCategoryStyle } from '@/lib/sloganCategories';
import { ArrowLeft, MapPin, Building2, Landmark, ChevronRight, Info, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  slugToZoneName,
  useZoneByName,
  useProjectsByZone,
  zoneNameToSlug,
} from '@/hooks/useRedevelopmentZones';
import zonesData from '@/data/zones.json';

// 開發類型對應的顏色
const devTypeColor: Record<string, string> = {
  '區段徵收': 'bg-blue-100 text-blue-800 border-blue-200',
  '市地重劃': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  '都市更新': 'bg-purple-100 text-purple-800 border-purple-200',
  '民間俗稱特區': 'bg-amber-100 text-amber-800 border-amber-200',
  '科技園區': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  '特定區計畫': 'bg-rose-100 text-rose-800 border-rose-200',
};

function getDevTypeColor(devType: string): string {
  return devTypeColor[devType] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

// 解析 key_facilities 文字為分類列表
function parseFacilities(text: string): { category: string; items: string[] }[] {
  if (!text) return [];
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line) => {
    const colonIdx = line.indexOf('：');
    if (colonIdx === -1) return { category: '', items: [line] };
    const category = line.slice(0, colonIdx);
    const items = line
      .slice(colonIdx + 1)
      .split(/[、,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return { category, items };
  });
}

// 設施類別對應圖示
const facilityIcons: Record<string, string> = {
  交通: '🚇',
  賣場: '🛒',
  商圈: '🏬',
  綠地: '🌳',
  公園: '🌳',
  文教: '🎓',
  '文教/休閒': '🎓',
  學校: '🎓',
  醫療: '🏥',
  產業: '🏭',
  機能: '🏙️',
  景觀: '🏞️',
  休閒: '⛳',
  購物: '🛍️',
  餐飲: '🍽️',
  金融: '🏦',
  政府: '🏛️',
};

function getFacilityIcon(category: string): string {
  return facilityIcons[category] ?? '📍';
}

// 電梯評級顏色
const elevatorGradeColor: Record<string, string> = {
  優: 'bg-emerald-100 text-emerald-800',
  佳: 'bg-blue-100 text-blue-800',
  可: 'bg-yellow-100 text-yellow-800',
  普通: 'bg-orange-100 text-orange-800',
  差: 'bg-red-100 text-red-800',
};

// 社區規模顏色
const communitySizeColor: Record<string, string> = {
  小而美: 'bg-pink-100 text-pink-800',
  精緻: 'bg-purple-100 text-purple-800',
  黃金比例: 'bg-amber-100 text-amber-800',
  大型: 'bg-blue-100 text-blue-800',
  超大型: 'bg-indigo-100 text-indigo-800',
};

export default function ZoneDetail() {
  const params = useParams<{ zoneName: string }>();
  const zoneName = slugToZoneName(params.zoneName ?? '');
  const zone = useZoneByName(zoneName);
  const relatedProjects = useProjectsByZone(zoneName);

  // 其他重劃區（同類型）
  const sameTypeZones = useMemo(() => {
    if (!zone) return [];
    return (zonesData as typeof zone[]).filter(
      (z) => z.development_type === zone.development_type && z.zone_name !== zone.zone_name
    );
  }, [zone]);

  if (!zone) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">找不到此重劃區</h1>
        <p className="text-gray-500 mb-6">「{zoneName}」的資料尚未建立或名稱有誤。</p>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回建案列表
          </Button>
        </Link>
      </div>
    );
  }

  const facilities = parseFacilities(zone.key_facilities);
  const devTypeColorClass = getDevTypeColor(zone.development_type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁首 Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="container py-8">
          {/* 麵包屑 */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">首頁</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/projects" className="hover:text-white transition-colors">建案列表</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">重劃區詳情</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full border ${devTypeColorClass}`}
                >
                  {zone.development_type}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{zone.zone_name}</h1>
              {/* 核心特色（去掉標題行，直接顯示內容） */}
              <div className="text-slate-300 leading-relaxed max-w-2xl whitespace-pre-line text-sm md:text-base">
                {zone.core_features}
              </div>
            </div>

            {/* 統計數字 */}
            <div className="flex gap-4 md:flex-col md:items-end">
              <button
                onClick={() => {
                  const el = document.getElementById('zone-projects-list');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="bg-white/10 backdrop-blur rounded-xl px-5 py-4 text-center hover:bg-white/20 transition-colors cursor-pointer group"
              >
                <div className="text-3xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">{relatedProjects.length}</div>
                <div className="text-xs text-slate-300 mt-1">相關建案</div>
                <div className="text-[10px] text-slate-400 mt-0.5 group-hover:text-slate-300">點擊查看 ↓</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主體內容 */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 深度分析 */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                  深度分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {zone.in_depth_analysis}
                </p>
              </CardContent>
            </Card>

            {/* 關鍵設施 */}
            {facilities.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Landmark className="w-5 h-5 text-emerald-600" />
                    關鍵設施與生活機能
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {facilities.map((fac, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getFacilityIcon(fac.category)}</span>
                          <span className="font-medium text-gray-800 text-sm">{fac.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {fac.items.map((item, i) => (
                            <span
                              key={i}
                              className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 相關建案列表 */}
            <Card id="zone-projects-list" className="shadow-sm scroll-mt-20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  本區建案
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    ({relatedProjects.length} 個)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relatedProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">目前無相關建案資料</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedProjects.map((project: any) => {
                      const allSlogans = project.slogans ? (Object.values(project.slogans).filter((s: any) => typeof s === 'string' && s.trim()) as string[]) : [];
                      const randomSlogans = useRandomSlogans(project.id, allSlogans);
                      return (
                        <Link
                          key={project.id}
                          href={`/project/${project.id}`}
                          className="flex flex-col gap-2 p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900 group-hover:text-amber-800 text-sm truncate">
                                  {project['建案名稱']}
                                </span>
                                {project.construction_group && (
                                  <span className="text-xs text-gray-400 flex-shrink-0">
                                    {project.construction_group}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-gray-500">
                                  {project['行政區']}
                                </span>
                                {project['建設公司'] && (
                                  <span className="text-xs text-gray-400">
                                    · {project['建設公司']}
                                  </span>
                                )}
                                {project['總戶數'] && (
                                  <span className="text-xs text-gray-400">
                                    · {project['總戶數']}戶
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                              {project.elevator_grade && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    elevatorGradeColor[project.elevator_grade] ?? 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  梯{project.elevator_grade}
                                </span>
                              )}
                              {project.community_size && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    communitySizeColor[project.community_size] ?? 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {project.community_size}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 transition-colors" />
                            </div>
                          </div>
                          {randomSlogans.length > 0 && (
                            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                              {randomSlogans.map((item, idx) => {
                                const style = getCategoryStyle(item.category);
                                const Icon = style.icon;
                                return (
                                  <div
                                    key={idx}
                                    className={`text-xs font-medium px-2 py-1 rounded border leading-relaxed line-clamp-1 flex items-center gap-1.5 ${style.bgColor} ${style.textColor} ${style.borderColor}`}
                                  >
                                    <Icon className="w-3 h-3 shrink-0" />
                                    <span>{item.text}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右側側邊欄 */}
          <div className="space-y-5">
            {/* 基本資訊卡 */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-600" />
                  重劃區資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">開發類型</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${devTypeColorClass}`}
                  >
                    {zone.development_type}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">相關建案數</span>
                  <span className="font-semibold text-amber-700">{relatedProjects.length} 個</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">設施類別數</span>
                  <span className="font-semibold text-gray-700">{facilities.length} 類</span>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card className="shadow-sm">
              <CardContent className="pt-5 space-y-2">
                <Link href={`/projects?zone=${encodeURIComponent(zoneName)}`}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" size="sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    篩選本區所有建案
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline" className="w-full" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回建案列表
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 同類型其他重劃區 */}
            {sameTypeZones.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    同為「{zone.development_type}」的其他重劃區
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {sameTypeZones.slice(0, 6).map((z) => (
                    <Link
                      key={z.zone_name}
                      href={`/zone/${zoneNameToSlug(z.zone_name)}`}
                      className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 transition-colors group text-sm"
                    >
                      <span className="text-gray-700 group-hover:text-amber-700 transition-colors">
                        {z.zone_name}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-amber-600" />
                    </Link>
                  ))}
                  {sameTypeZones.length > 6 && (
                    <p className="text-xs text-gray-400 text-center pt-1">
                      還有 {sameTypeZones.length - 6} 個同類型重劃區
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
