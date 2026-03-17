import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 將全形字元轉為半形，與既有建案格式一致（數字、英文、標點、空白） */
export function toHalfWidth(str: string): string {
  return String(str).normalize("NFKC");
}

/** 遞迴將物件中所有字串欄位轉為半形（不改變數字、陣列結構等） */
export function stringsToHalfWidth(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return toHalfWidth(obj);
  if (Array.isArray(obj)) return obj.map(stringsToHalfWidth);
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = stringsToHalfWidth(v);
    return out;
  }
  return obj;
}

/** 國字／大寫國字數字 → 阿拉伯數字（用於搜尋正規化） */
const ZH_NUM_MAP: [RegExp, string][] = [
  [/零|〇/g, "0"],
  [/一|壹/g, "1"],
  [/二|貳|贰/g, "2"],
  [/三|叁/g, "3"],
  [/四|肆/g, "4"],
  [/五|伍/g, "5"],
  [/六|陸/g, "6"],
  [/七|柒/g, "7"],
  [/八|捌/g, "8"],
  [/九|玖/g, "9"],
];

/** 搜尋時同音／易混淆字對齊：新=薪、建=健（建案搜尋用） */
const SEARCH_ALIAS_MAP: [string, string][] = [
  ["新", "薪"],
  ["建", "健"],
];

/**
 * 搜尋用正規化：不分全形/半形、英文大小寫、國字與阿拉伯數字（一=壹=１=1）；
 * 並將 新→薪、建→健，使「勇健新傳」可搜到「勇建薪傳」。
 */
export function normalizeForSearch(str: string): string {
  if (typeof str !== "string") return "";
  let s = str.normalize("NFKC").toLowerCase();
  for (const [re, digit] of ZH_NUM_MAP) s = s.replace(re, digit);
  for (const [from, to] of SEARCH_ALIAS_MAP) s = s.replace(new RegExp(from, "g"), to);
  return s;
}
