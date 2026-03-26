export interface ProjectUnits {
  total: number;
  residential: number;
  commercial: number;
  others: number;
  description: string;
}

export interface ProjectParking {
  total: number;
  planar: number;
  mechanical: number;
  description: string;
}

export interface ProjectFloors {
  ground: number[];
  basement: number;
  description: string;
}

export interface ProjectSlogans {
  地段價值: string;
  品牌建築: string;
  生活環境: string;
  生活機能: string;
  產品特色: string;
}

export type VideoPlatform = "youtube";

export interface ProjectVideo {
  /** 影片資料的穩定識別（後台刪除/排序用） */
  id: string;
  platform: VideoPlatform;
  /** 建議提供：避免解析 url 失敗 */
  youtubeId?: string;
  /** 可選：原始連結（fallback 開新視窗、或解析 youtubeId） */
  url?: string;
  /** 顯示名稱（卡片/清單） */
  title: string;
  /** 選填：補充說明 */
  desc?: string;
  /** 選填：暫時隱藏但保留資料 */
  visible?: boolean;
  /** 選填：排序值（若未使用可忽略，以陣列順序為準） */
  order?: number;
}

export interface OwnerInfo {
  name: string;
  phone: string;
  company: string;
  brand: string;
  address: string;
  line_url: string;
}

export interface Project {
  id: number;
  /** 是否顯示在前台（預設 true；舊資料未填視為 true） */
  isPublished?: boolean;
  /** 是否已刪除（回收桶）。已刪除的建案前台不顯示，後台可在回收桶還原/永久刪除。 */
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  建案名稱: string;
  建設公司: string;
  行政區: string;
  重劃區: string;
  建案位置: string;
  坐落地號: string;
  基地面積坪: number;
  建築結構: string;
  floors: ProjectFloors;
  樓層高度米: number;
  units: ProjectUnits;
  戶梯配置: string;
  房型規劃: string[];
  parking: ProjectParking;
  完工日期: string;
  公設配置: string;
  交通: string;
  學區: string;
  商圈: string;
  綠地: string;
  連結: string;
  備註: string;
  tags: string[];
  slogans: ProjectSlogans;
  description_500: string;
  /** 建案影片（例如 YouTube） */
  videos?: ProjectVideo[];
  // Phase 2 新增欄位
  construction_group: string | null;
  room_types_standard: string[];
  elevator_ratio: number | null;
  elevator_grade: string | null;
  community_size: string | null;
  /** 使用分區（來自預售屋備查等） */
  使用分區?: string;
  /** 主要用途（來自預售屋備查等） */
  主要用途?: string;
  /** 負責人（由起造人拆出） */
  負責人?: string;
}

export interface ProjectsData {
  source: string;
  updated: string;
  owner: OwnerInfo;
  total_projects: number;
  projects: Project[];
}

export const SLOGAN_CATEGORIES = [
  { key: "地段價值" as const, label: "地段價值", icon: "MapPin", color: "bg-amber-100 text-amber-800" },
  { key: "品牌建築" as const, label: "品牌建築", icon: "Building2", color: "bg-sky-100 text-sky-800" },
  { key: "生活環境" as const, label: "生活環境", icon: "Trees", color: "bg-emerald-100 text-emerald-800" },
  { key: "生活機能" as const, label: "生活機能", icon: "ShoppingBag", color: "bg-violet-100 text-violet-800" },
  { key: "產品特色" as const, label: "產品特色", icon: "Star", color: "bg-rose-100 text-rose-800" },
] as const;

export const DISTRICTS = [
  "北屯區", "西屯區", "南屯區", "南區", "北區", "西區",
  "烏日區", "潭子區", "太平區", "龍井區", "大里區", "東區", "中區"
] as const;

/** 判斷建案資料是否嚴重缺失 (>=8個核心欄位為空) */
export function isDataIncomplete(p: Project): boolean {
  let missing = 0;
  if (!p.建設公司) missing++;
  if (!p.建築結構) missing++;
  if (!p.floors?.description && (!p.floors?.ground || p.floors.ground.length === 0)) missing++;
  if (!p.units?.total || p.units.total === 0) missing++;
  if (!p.戶梯配置) missing++;
  if (!p.房型規劃 || p.房型規劃.length === 0) missing++;
  if (!p.parking?.total || p.parking.total === 0) missing++;
  if (!p.公設配置) missing++;
  if (!p.學區) missing++;
  if (!p.交通) missing++;
  if (!p.綠地) missing++;
  if (!p.商圈) missing++;
  return missing >= 8;
}

/** 計算資料完整度百分比 */
export function getDataCompleteness(p: Project): number {
  const fields = [
    !!p.建設公司,
    !!p.建築結構,
    !!(p.floors?.description || (p.floors?.ground && p.floors.ground.length > 0)),
    !!(p.units?.total && p.units.total > 0),
    !!p.戶梯配置,
    !!(p.房型規劃 && p.房型規劃.length > 0),
    !!(p.parking?.total && p.parking.total > 0),
    !!p.公設配置,
    !!p.學區,
    !!p.交通,
    !!p.綠地,
    !!p.商圈,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export const ZONES = [
  "14期重劃區", "13期重劃區", "12期重劃區", "水湳經貿園區",
  "7期重劃區", "5期重劃區", "4期重劃區", "機捷特區",
  "單元12", "單元2", "單元1", "烏日高鐵特區", "嶺東特區",
  "熱門商辦", "非重劃區"
] as const;

// ============================================================
// 電梯比評級
// ============================================================
export type ElevatorGrade = "優" | "佳" | "可" | "普通" | "請提早出門";

export const ELEVATOR_GRADES: { grade: ElevatorGrade; label: string; range: string; color: string; bgColor: string }[] = [
  { grade: "優", label: "優", range: "≤2戶/梯", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-200" },
  { grade: "佳", label: "佳", range: "2-3戶/梯", color: "text-sky-700", bgColor: "bg-sky-50 border-sky-200" },
  { grade: "可", label: "可", range: "3-5戶/梯", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-200" },
  { grade: "普通", label: "普通", range: "5-7戶/梯", color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200" },
  { grade: "請提早出門", label: "請提早出門", range: "≥7戶/梯", color: "text-red-700", bgColor: "bg-red-50 border-red-200" },
];

export function getElevatorGradeInfo(grade: string | null | undefined) {
  return ELEVATOR_GRADES.find((g) => g.grade === grade) || null;
}

// ============================================================
// 社區規模評級
// ============================================================
export type CommunitySize = "小而美" | "精緻社區" | "黃金比例" | "大型社區" | "超大型社區";

export interface CommunitySizeInfo {
  size: CommunitySize;
  range: string;
  pros: string[];
  cons: string[];
  color: string;
  bgColor: string;
  icon: string;
}

export const COMMUNITY_SIZE_INFO: CommunitySizeInfo[] = [
  {
    size: "小而美",
    range: "1-50戶",
    pros: ["鄰居關係緊密", "管委會決策效率高", "公設單純不浪費"],
    cons: ["管理費分攤較高", "公設種類較少", "管理人力有限"],
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: "🏡",
  },
  {
    size: "精緻社區",
    range: "51-100戶",
    pros: ["社區管理品質佳", "公設配置適中", "鄰居互動適度"],
    cons: ["管理費中等偏高", "部分公設使用率可能偏低"],
    color: "text-sky-700",
    bgColor: "bg-sky-50 border-sky-200",
    icon: "🏢",
  },
  {
    size: "黃金比例",
    range: "101-200戶",
    pros: ["管理費合理分攤", "公設種類豐富", "社區活動多元", "管理品質穩定"],
    cons: ["鄰居較不易全部認識", "管委會運作需更多協調"],
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: "🏛️",
  },
  {
    size: "大型社區",
    range: "201-400戶",
    pros: ["管理費分攤低", "公設豪華多元", "社區商業機能佳"],
    cons: ["電梯等候時間較長", "停車場動線較複雜", "鄰居關係較疏遠", "管委會運作複雜"],
    color: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-200",
    icon: "🏙️",
  },
  {
    size: "超大型社區",
    range: "400戶以上",
    pros: ["管理費最低", "公設最豐富", "社區自成生活圈"],
    cons: ["尖峰時段電梯擁擠", "社區管理挑戰大", "停車場進出耗時", "鄰居關係最疏遠"],
    color: "text-rose-700",
    bgColor: "bg-rose-50 border-rose-200",
    icon: "🌆",
  },
];

export function getCommunitySizeInfo(size: string | null | undefined): CommunitySizeInfo | null {
  return COMMUNITY_SIZE_INFO.find((s) => s.size === size) || null;
}

// ============================================================
// 建設集團
// ============================================================
export const CONSTRUCTION_GROUPS = [
  "寶佳機構", "惠宇機構", "富宇營建機構", "豐邑機構", "大毅集團",
  "興富發集團", "總太集團", "精銳建設", "大城建設", "龍寶建設",
  "陸府建設", "國泰建設", "達麗建設", "遠雄集團", "坤悅開發",
  "鑫建築", "順天建設", "登陽集團", "鉅虹建設", "國聚建設",
  "麗寶集團", "泉宇建設", "泰鉅建設"
] as const;

// ============================================================
// 標準房型
// ============================================================
export const STANDARD_ROOM_TYPES = [
  "1房", "1+1房", "2房", "2+1房", "3房", "3+1房", "4房",
  "別墅", "辦公室", "開放格局"
] as const;
