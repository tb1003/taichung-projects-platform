/**
 * 將 Excel 預售屋備查（b_lvr_buildcase.xls）中與我們 projects 匹配的 146 筆，
 * 補充／覆寫下列欄位：
 * - 建案位置：以「坐落街道」補充
 * - 建設公司、負責人：由「起造人」拆出
 * - units.total：由「層棟戶數」覆寫（總戶數）
 * - 使用分區、主要用途：新增
 * - 建築結構：以「主要建材」覆寫
 * - 坐落地號：以「坐落基地」覆寫
 * - 完工日期：以「第1次登記日期」轉西元覆寫
 *
 * 使用：node scripts/merge-excel-buildcase.cjs [Excel路徑]
 * 預設 Excel：/Users/tao/Downloads/download/b_lvr_buildcase.xls
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_PATH = path.join(PROJECT_ROOT, "client/src/data/projects.json");
const EXCEL_PATH = process.argv[2] || "/Users/tao/Downloads/download/b_lvr_buildcase.xls";

function normDistrict(行政區) {
  if (!行政區 || typeof 行政區 !== "string") return "";
  const m = 行政區.match(/^([^（(]+)/);
  return (m ? m[1] : 行政區).trim();
}

function parse起造人(起造人) {
  const s = String(起造人 || "").trim();
  if (!s) return { 建設公司: "", 負責人: "" };
  const match = s.match(/^(.+?)負責人[：:]\s*(.+)$/);
  if (match) {
    return { 建設公司: match[1].trim(), 負責人: match[2].trim() };
  }
  return { 建設公司: s, 負責人: "" };
}

/** 民國 YYYMMDD 轉西元 YYYY-MM */
function rocDateToIso(rocStr) {
  const s = String(rocStr || "").trim().replace(/\D/g, "");
  if (s.length < 6) return "";
  const yy = parseInt(s.slice(0, 3), 10);
  const year = 1911 + yy;
  const month = s.length >= 5 ? s.slice(3, 5) : "01";
  return `${year}-${month}`;
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error("Excel 不存在:", EXCEL_PATH);
    process.exit(1);
  }

  const wb = XLSX.readFile(EXCEL_PATH);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });
  const header = rows[0];
  const dataRows = rows.slice(2);

  const excelMap = new Map();
  dataRows.forEach((r) => {
    const 鄉鎮市區 = (r[header.indexOf("鄉鎮市區")] ?? "").toString().trim();
    const 建案名稱 = (r[header.indexOf("建案名稱")] ?? "").toString().trim();
    if (!建案名稱) return;
    const key = 鄉鎮市區 + "|" + 建案名稱;
    const rec = {};
    header.forEach((h, i) => {
      rec[h] = r[i] != null ? String(r[i]).trim() : "";
    });
    excelMap.set(key, rec);
  });

  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const projects = data.projects;
  let updated = 0;

  projects.forEach((p) => {
    const key = normDistrict(p.行政區) + "|" + (p.建案名稱 || "");
    const excel = excelMap.get(key);
    if (!excel) return;

    const 坐落街道 = excel["坐落街道"] || "";
    const 起造人 = excel["起造人"] || "";
    const 層棟戶數 = excel["層棟戶數"] || "";
    const 使用分區 = excel["使用分區"] || "";
    const 主要用途 = excel["主要用途"] || "";
    const 主要建材 = excel["主要建材"] || "";
    const 坐落基地 = excel["坐落基地"] || "";
    const 第1次登記日期 = excel["第1次登記日期"] || "";

    if (坐落街道) {
      const current = (p.建案位置 || "").trim();
      p.建案位置 = current ? current + " " + 坐落街道 : 坐落街道;
    }

    const { 建設公司: 公司, 負責人: 負責人 } = parse起造人(起造人);
    if (公司) p.建設公司 = 公司;
    if (負責人) p.負責人 = 負責人;

    const totalNum = parseInt(層棟戶數, 10);
    if (!isNaN(totalNum) && p.units && typeof p.units === "object") {
      p.units.total = totalNum;
    }

    if (使用分區) p.使用分區 = 使用分區;
    if (主要用途) p.主要用途 = 主要用途;
    if (主要建材) p.建築結構 = 主要建材;
    if (坐落基地) p.坐落地號 = 坐落基地;

    const isoDate = rocDateToIso(第1次登記日期);
    if (isoDate) p.完工日期 = isoDate;

    updated++;
  });

  data.updated = new Date().toISOString();
  data.total_projects = projects.length;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log("已更新", updated, "筆建案，已寫入", DATA_PATH);
}

main();
