/**
 * 將 20 筆十二期建案（Gemini 編輯）檢核後併入 projects.json
 * 檢核：必要欄位、型別；id 改為 452-471；補上 videos
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, "../client/src/data/projects.json");
const NEW_PROJECTS_JSON = process.argv[2] || path.join(__dirname, "twelve-projects-input.json");

const rawInput = fs.readFileSync(NEW_PROJECTS_JSON, "utf-8");
let newProjects;
try {
  newProjects = JSON.parse(rawInput);
} catch (e) {
  console.error("輸入 JSON 解析失敗:", e.message);
  process.exit(1);
}

if (!Array.isArray(newProjects) || newProjects.length < 1) {
  console.error("輸入應為建案陣列，實際:", newProjects?.length);
  process.exit(1);
}

const required = [
  "建案名稱", "建設公司", "行政區", "重劃區", "建案位置", "坐落地號",
  "基地面積坪", "建築結構", "floors", "units", "戶梯配置", "房型規劃", "parking",
  "完工日期", "公設配置", "交通", "學區", "商圈", "綠地", "連結", "備註",
  "tags", "slogans", "description_500", "construction_group", "room_types_standard",
  "elevator_ratio", "elevator_grade", "community_size"
];

for (let i = 0; i < newProjects.length; i++) {
  const p = newProjects[i];
  for (const key of required) {
    if (p[key] === undefined && key !== "樓層高度米") {
      if (key === "floors" || key === "units" || key === "parking") {
        if (typeof p[key] !== "object") {
          console.error(`第 ${i + 1} 筆「${p.建案名稱}」缺少或型別錯誤: ${key}`);
          process.exit(1);
        }
      } else if (key === "slogans" && typeof p[key] !== "object") {
        console.error(`第 ${i + 1} 筆「${p.建案名稱}」slogans 應為物件`);
        process.exit(1);
      } else if (key !== "description_500" && key !== "備註" && (p[key] === undefined || p[key] === null)) {
        // 允許部分欄位為 null/空
      }
    }
  }
  if (!p.floors?.ground || !Array.isArray(p.floors.ground)) {
    console.error(`第 ${i + 1} 筆「${p.建案名稱}」floors.ground 應為陣列`);
    process.exit(1);
  }
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
const maxId = data.projects.reduce((m, p) => Math.max(m, p.id || 0), 0);
const startId = maxId + 1;

const merged = newProjects.map((p, idx) => {
  const id = startId + idx;
  const out = { ...p, id };
  if (!out.videos) out.videos = [];
  return out;
});

data.projects.push(...merged);
data.total_projects = data.projects.length;
data.updated = new Date().toISOString();

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
console.log(`已併入 ${merged.length} 筆建案，id ${startId}～${startId + merged.length - 1}。總建案數: ${data.total_projects}`);
console.log("建案名稱:", merged.map((p) => p.建案名稱).join("、"));
