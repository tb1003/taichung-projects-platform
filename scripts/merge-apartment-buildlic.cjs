#!/usr/bin/env node
/**
 * 合併「公寓大廈報備資料」與「建管開放資料 buildlic」，
 * 以使照序號對應，產出完整欄位之新資料集（CSV + JSON）。
 *
 * 報備欄位：社區名稱（原公寓大廈名稱）、戶數（以報備為準）、行政區
 * buildlic 欄位：基地面積坪、建築物高度、法定空地面積坪、主要建材（構造別）、
 *   地上層數、地下層數、戶數、起照人、設計人、監造人、承造人、停車空間、
 *   完工日（竣工日期）、土地使用分區、樓層高度（樓層概要合併）、中繼水箱樓層（含中繼機房）、水箱樓層（獨立欄位，標示樓層）
 *
 * 輸出之 build/公寓大廈報備與使照合併資料.csv、.json 供建案比對使用（見 compare-apartment-with-projects.cjs）。
 *
 * 使用：
 *   node scripts/merge-apartment-buildlic.cjs
 *   node scripts/merge-apartment-buildlic.cjs --apartment build/精選.csv --buildlic docs/opendata/buildlic.jsonl --out build/合併結果.csv
 */

const fs = require("fs");
const path = require("path");
const { m2ToPing, parseM2 } = require("./lib/area.cjs");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_APARTMENT = path.join(PROJECT_ROOT, "build", "臺中市公寓大廈報備資料1141231_精選行政區.csv");
const DEFAULT_BUILDLIC = path.join(PROJECT_ROOT, "docs", "opendata", "buildlic.jsonl");
const DEFAULT_OUT_CSV = path.join(PROJECT_ROOT, "build", "公寓大廈報備與使照合併資料.csv");
const DEFAULT_OUT_JSON = path.join(PROJECT_ROOT, "build", "公寓大廈報備與使照合併資料.json");

// ---------- 使照序號正規化 ----------

/** 從 buildlic 核發執照字號取出「民國年3碼+序號5碼」作為 key，例如 08100736 */
function buildlicPermitKey(核發執照字號) {
  if (!核發執照字號 || typeof 核發執照字號 !== "string") return null;
  const s = 核發執照字號.trim();
  // (41)府都建使字第00062號、081中工建使字第00736號、110中都使字第01672號
  const m = s.match(/\(?(\d{2,3})\)?[^字第]*字第(\d{4,5})/);
  if (!m) return null;
  const year = m[1].padStart(3, "0").slice(-3);
  const seq = m[2].padStart(5, "0").slice(-5);
  return year + seq;
}

/** 從報備的使照序號欄位解析出所有 key（一個社區可能對多張使照） */
function apartmentPermitKeys(使照序號) {
  if (!使照序號 || typeof 使照序號 !== "string") return [];
  const s = 使照序號.replace(/\s+/g, " ").trim();
  const keys = [];
  // 單筆 081-00619
  const single = s.match(/^\d{2,3}-\d{4,5}$/);
  if (single) {
    const [y, seq] = s.split("-");
    keys.push(y.padStart(3, "0").slice(-3) + seq.padStart(5, "0").slice(-5));
    return keys;
  }
  // 多筆 105-01444 105-01445 或 110-02049,110-02050 或 100-02185~02186
  const parts = s.split(/[\s,，、]+/);
  for (const p of parts) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    const range = trimmed.match(/^(\d{2,3})-(\d{4,5})~(\d{4,5})$/); // 100-02185~02186
    if (range) {
      const [, y, start, end] = range;
      const y3 = y.padStart(3, "0").slice(-3);
      const s1 = parseInt(start, 10);
      const s2 = parseInt(end, 10);
      for (let i = s1; i <= s2; i++) keys.push(y3 + i.toString().padStart(5, "0"));
      continue;
    }
    const one = trimmed.match(/^(\d{2,3})-(\d{4,5})$/);
    if (one) {
      keys.push(one[1].padStart(3, "0").slice(-3) + one[2].padStart(5, "0").slice(-5));
    }
  }
  return [...new Set(keys)];
}

// ---------- 樓層概要 → 樓層高度（同高合併、標記水箱/中繼水箱） ----------

/** 從樓層別字串解析排序用數字：地下003層=-3, 地上001層=1, 突出物001層=100 */
function floorSortValue(樓層別) {
  if (!樓層別) return 0;
  const 地下 = 樓層別.match(/地下(\d+)層/);
  if (地下) return -parseInt(地下[1], 10);
  const 地上 = 樓層別.match(/地上(\d+)層/);
  if (地上) return parseInt(地上[1], 10);
  const 夾層 = 樓層別.match(/夾層(\d+)層/);
  if (夾層) return 50 + parseInt(夾層[1], 10);
  const 突出 = 樓層別.match(/突出物(\d+)層/);
  if (突出) return 100 + parseInt(突出[1], 10);
  if (/騎樓/.test(樓層別)) return 0.5;
  return 0;
}

/** 樓層別轉成顯示名稱：地上001層→1樓，地下002層→地下2層 */
function floorLabel(樓層別) {
  if (!樓層別) return "";
  const 地下 = 樓層別.match(/地下(\d+)層/);
  if (地下) return `地下${parseInt(地下[1], 10)}層`;
  const 地上 = 樓層別.match(/地上(\d+)層/);
  if (地上) return `${parseInt(地上[1], 10)}樓`;
  const 夾層 = 樓層別.match(/夾層(\d+)層/);
  if (夾層) return `夾層${parseInt(夾層[1], 10)}`;
  const 突出 = 樓層別.match(/突出物(\d+)層/);
  if (突出) return `突出物${parseInt(突出[1], 10)}層`;
  return 樓層別;
}

/** 樓層高度字串正規化：3.3ｍ → 3.3米 */
function normalizeHeight(h) {
  if (!h) return "";
  return String(h).replace(/ｍ|m|公尺/g, "米").trim();
}

/**
 * 依 docs/opendata/buildlic.csv 樓層用途實際用語，判斷該層是否為「中繼水箱／中繼機房」等中繼設備
 * （消防中繼機房、中繼水箱、中繼機房、中繼機械室、中繼泵浦等均比照標示，消費者關切噪音對房價影響）
 */
const 中繼設備用途正則 = /中繼(水箱|機房|機械室|設備機房|泵浦|自來水箱|水箱機房|水箱室|消防機房|消防室|加壓消防|水箱機械室)|消防中繼(機房|機械室|水箱|連結泵浦室|泵浦室|水箱室)/;

function format樓層高度與水箱(樓層概要) {
  const empty = { 樓層高度: "", 中繼水箱樓層: "", 水箱樓層: "" };
  if (!Array.isArray(樓層概要) || 樓層概要.length === 0) return empty;

  const list = 樓層概要
    .map((item) => ({
      sort: floorSortValue(item.樓層別),
      label: floorLabel(item.樓層別),
      高度: normalizeHeight(item.樓層高度 || ""),
      用途: (item.樓層用途 || "").toString(),
    }))
    .filter((x) => x.高度 !== "")
    .sort((a, b) => a.sort - b.sort);

  if (list.length === 0) return empty;

  function toRange(nums) {
    const u = [...new Set(nums)].sort((a, b) => a - b);
    if (u.length === 0) return "";
    if (u.length === 1) return String(u[0]);
    const segs = [];
    let start = u[0], end = u[0];
    for (let i = 1; i <= u.length; i++) {
      if (i < u.length && u[i] === end + 1) end = u[i];
      else {
        segs.push(start === end ? `${start}` : `${start}-${end}`);
        if (i < u.length) start = end = u[i];
      }
    }
    return segs.join("、");
  }

  // 依高度分組；同高度可能為地上層(正)、地下層(負)或夾層等，分開合併
  const byHeight = new Map(); // height -> { 地上: number[], 地下: number[], 其他: string[], 有中繼 }
  for (const x of list) {
    const key = x.高度;
    if (!byHeight.has(key)) byHeight.set(key, { 地上: [], 地下: [], 其他: [], 有中繼: false });
    const g = byHeight.get(key);
    if (x.sort >= 1 && x.sort <= 99) g.地上.push(x.sort);
    else if (x.sort <= -1 && x.sort >= -99) g.地下.push(-x.sort);
    else g.其他.push(x.label);
    if (中繼設備用途正則.test(x.用途)) g.有中繼 = true;
  }

  const 中繼水箱樓層List = [];
  const 水箱樓層List = [];

  const parts = [];
  for (const [height, g] of byHeight.entries()) {
    const segs = [];
    const 地下r = toRange(g.地下);
    if (地下r) segs.push(String(地下r).split("、").map((n) => `地下${n}層`).join("、"));
    const 地上r = toRange(g.地上);
    if (地上r) segs.push(String(地上r).split("、").map((n) => `${n}樓`).join("、"));
    if (g.其他.length) segs.push(...g.其他);
    const range = segs.join("，") || "其他";
    // 樓層高度不再含（中繼水箱）/（水箱）後綴
    parts.push(`${range} ${height}`);
    // 中繼水箱、水箱獨立出來並標示樓層（使用與樓層高度相同的樓層區間描述）
    if (g.有中繼 && range) 中繼水箱樓層List.push(range);
    if (g.有水箱 && !g.有中繼 && range) 水箱樓層List.push(range);
  }

  return {
    樓層高度: parts.join("；"),
    中繼水箱樓層: 中繼水箱樓層List.join("；"),
    水箱樓層: 水箱樓層List.join("；"),
  };
}

// ---------- 竣工日期 → 完工日 ----------

function format完工日(竣工日期) {
  if (!竣工日期 || typeof 竣工日期 !== "string") return "";
  const s = 竣工日期.trim();
  const m = s.match(/(\d{2,3})年(\d{1,2})月(\d{1,2})?/);
  if (!m) return s;
  const y = 1911 + parseInt(m[1], 10);
  const mon = m[2].padStart(2, "0");
  const day = (m[3] || "01").padStart(2, "0");
  return `${y}-${mon}-${day}`;
}

// ---------- 建管一筆轉成合併表單一筆欄位 ----------

function buildlicToRow(rec, 報備戶數) {
  const 戶數 = 報備戶數 != null && 報備戶數 !== "" ? String(報備戶數).replace(/\D/g, "") || rec.戶數 : (rec.戶數 || "").toString().replace(/\D/g, "") || "";
  return {
    基地面積坪: m2ToPing(parseM2(rec.基地面積)),
    建築物高度: (rec.建築物高度 || "").toString().replace(/ｍ/g, "米").trim(),
    法定空地面積坪: m2ToPing(parseM2(rec.法定空地面積)),
    主要建材: (rec.構造別 || "").toString().trim(),
    地上層數: (rec.地上層數 || "").toString().trim(),
    地下層數: (rec.地下層數 || "").toString().trim(),
    戶數,
    起照人: (rec.起造人代表人 || "").toString().trim(),
    設計人: (rec.設計人 || "").toString().trim(),
    監造人: (rec.監造人 || "").toString().trim(),
    承造人: (rec.承造人 || "").toString().trim(),
    停車空間: (rec.停車空間 || "").toString().trim(),
    完工日: format完工日(rec.竣工日期),
    土地使用分區: (rec.土地使用分區 || "").toString().trim(),
    ...format樓層高度與水箱(rec.樓層概要),
  };
}

// ---------- CSV 解析／輸出 ----------

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && (c === "," || c === "\n" || c === "\r")) {
      row.push(cell.trim());
      if (c === "\n" || c === "\r") {
        if (row.length) rows.push(row);
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      }
      cell = "";
      continue;
    }
    cell += c;
  }
  if (cell.trim() !== "" || row.length > 0) row.push(cell.trim());
  if (row.length) rows.push(row);
  return rows;
}

function escapeCSV(cell) {
  const s = cell == null ? "" : String(cell);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// ---------- main ----------

function parseArgs(argv) {
  const out = {
    apartmentPath: DEFAULT_APARTMENT,
    buildlicPath: DEFAULT_BUILDLIC,
    outCsv: DEFAULT_OUT_CSV,
    outJson: DEFAULT_OUT_JSON,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if ((a === "--apartment" || a === "-a") && next) {
      out.apartmentPath = path.isAbsolute(next) ? next : path.join(PROJECT_ROOT, next);
      i++;
    } else if ((a === "--buildlic" || a === "-b") && next) {
      out.buildlicPath = path.isAbsolute(next) ? next : path.join(PROJECT_ROOT, next);
      i++;
    } else if ((a === "--out" || a === "-o") && next) {
      out.outCsv = path.isAbsolute(next) ? next : path.join(PROJECT_ROOT, next);
      out.outJson = out.outCsv.replace(/\.csv$/i, ".json");
      i++;
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);

  if (!fs.existsSync(args.apartmentPath)) {
    console.error("公寓大廈報備 CSV 不存在:", args.apartmentPath);
    console.error("請先執行: node scripts/filter-apartment-districts.cjs");
    process.exit(1);
  }
  if (!fs.existsSync(args.buildlicPath)) {
    console.error("buildlic 不存在:", args.buildlicPath);
    process.exit(1);
  }

  const apartmentText = fs.readFileSync(args.apartmentPath, "utf8");
  const apartmentRows = parseCSV(apartmentText);
  const aptHeader = apartmentRows[0];
  const 使照序號Idx = aptHeader.indexOf("使照序號");
  const 公寓大廈名稱Idx = aptHeader.indexOf("公寓大廈名稱");
  const 戶數Idx = aptHeader.indexOf("戶數");
  const 行政區Idx = aptHeader.indexOf("行政區");
  if ([使照序號Idx, 公寓大廈名稱Idx, 戶數Idx, 行政區Idx].some((i) => i === -1)) {
    console.error("報備 CSV 缺少欄位：使照序號、公寓大廈名稱、戶數、行政區");
    process.exit(1);
  }

  const buildlicLines = fs.readFileSync(args.buildlicPath, "utf8").trim().split("\n").filter(Boolean);
  const buildlicList = buildlicLines
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    })
    .filter((r) => r && r.執照類別 === "使用執照");

  const buildlicByKey = new Map();
  for (const rec of buildlicList) {
    const key = buildlicPermitKey(rec.核發執照字號);
    if (key && !buildlicByKey.has(key)) buildlicByKey.set(key, rec);
  }

  const outputHeader = [
    "社區名稱",
    "戶數",
    "行政區",
    "基地面積坪",
    "建築物高度",
    "法定空地面積坪",
    "主要建材",
    "地上層數",
    "地下層數",
    "起照人",
    "設計人",
    "監造人",
    "承造人",
    "停車空間",
    "完工日",
    "土地使用分區",
    "樓層高度",
    "中繼水箱樓層",
    "水箱樓層",
  ];

  const resultRows = [];
  const resultJson = [];
  let matched = 0;
  let noMatch = 0;

  for (let r = 1; r < apartmentRows.length; r++) {
    const row = apartmentRows[r];
    const 使照序號 = row[使照序號Idx] || "";
    const 社區名稱 = (row[公寓大廈名稱Idx] || "").trim();
    const 戶數 = (row[戶數Idx] || "").trim();
    const 行政區 = (row[行政區Idx] || "").trim();

    const keys = apartmentPermitKeys(使照序號);
    if (keys.length === 0) {
      noMatch++;
      resultRows.push([
        社區名稱,
        戶數,
        行政區,
        "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      ]);
      resultJson.push({
        社區名稱,
        戶數,
        行政區,
        基地面積坪: null,
        建築物高度: "",
        法定空地面積坪: null,
        主要建材: "",
        地上層數: "",
        地下層數: "",
        起照人: "",
        設計人: "",
        監造人: "",
        承造人: "",
        停車空間: "",
        完工日: "",
        土地使用分區: "",
        樓層高度: "",
        中繼水箱樓層: "",
        水箱樓層: "",
      });
      continue;
    }

    const firstRec = keys.map((k) => buildlicByKey.get(k)).find(Boolean);
    if (!firstRec) {
      noMatch++;
      resultRows.push([
        社區名稱,
        戶數,
        行政區,
        "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      ]);
      resultJson.push({
        社區名稱,
        戶數,
        行政區,
        基地面積坪: null,
        建築物高度: "",
        法定空地面積坪: null,
        主要建材: "",
        地上層數: "",
        地下層數: "",
        起照人: "",
        設計人: "",
        監造人: "",
        承造人: "",
        停車空間: "",
        完工日: "",
        土地使用分區: "",
        樓層高度: "",
        中繼水箱樓層: "",
        水箱樓層: "",
      });
      continue;
    }

    matched++;
    const bl = buildlicToRow(firstRec, 戶數);
    resultRows.push([
      社區名稱,
      bl.戶數 !== "" ? bl.戶數 : 戶數,
      行政區,
      bl.基地面積坪 > 0 ? bl.基地面積坪 : "",
      bl.建築物高度,
      bl.法定空地面積坪 > 0 ? bl.法定空地面積坪 : "",
      bl.主要建材,
      bl.地上層數,
      bl.地下層數,
      bl.起照人,
      bl.設計人,
      bl.監造人,
      bl.承造人,
      bl.停車空間,
      bl.完工日,
      bl.土地使用分區,
      bl.樓層高度,
      bl.中繼水箱樓層 || "",
      bl.水箱樓層 || "",
    ]);
    resultJson.push({
      社區名稱,
      戶數: bl.戶數 !== "" ? bl.戶數 : 戶數,
      行政區,
      基地面積坪: bl.基地面積坪 > 0 ? bl.基地面積坪 : null,
      建築物高度: bl.建築物高度,
      法定空地面積坪: bl.法定空地面積坪 > 0 ? bl.法定空地面積坪 : null,
      主要建材: bl.主要建材,
      地上層數: bl.地上層數,
      地下層數: bl.地下層數,
      起照人: bl.起照人,
      設計人: bl.設計人,
      監造人: bl.監造人,
      承造人: bl.承造人,
      停車空間: bl.停車空間,
      完工日: bl.完工日,
      土地使用分區: bl.土地使用分區,
      樓層高度: bl.樓層高度,
      中繼水箱樓層: bl.中繼水箱樓層 || "",
      水箱樓層: bl.水箱樓層 || "",
    });
  }

  const csvContent = [outputHeader, ...resultRows.map((row) => row.map(escapeCSV).join(","))].join("\n");
  fs.writeFileSync(args.outCsv, csvContent, "utf8");

  fs.writeFileSync(
    args.outJson,
    JSON.stringify({ 說明: "公寓大廈報備與使照合併資料", 筆數: resultJson.length, 資料: resultJson }, null, 2),
    "utf8"
  );

  console.log("合併完成。");
  console.log("報備筆數:", apartmentRows.length - 1);
  console.log("buildlic 使用執照筆數:", buildlicList.length);
  console.log("對到使照的報備筆數:", matched);
  console.log("未對到使照的報備筆數:", noMatch);
  console.log("輸出 CSV:", args.outCsv);
  console.log("輸出 JSON:", args.outJson);
}

main();
