/**
 * 面積換算：平方公尺（㎡）→ 坪
 * 規則：平方公尺 * 0.3025，取小數點後兩位
 */

const M2_TO_PING = 0.3025;

/**
 * 平方公尺轉坪（* 0.3025，小數點後兩位）
 * @param {number|string} m2 - 平方公尺數值或含單位的字串（如 "3415.5㎡"）
 * @returns {number} 坪數，小數點後兩位
 */
function m2ToPing(m2) {
  const num = typeof m2 === "number" ? m2 : parseM2(m2);
  if (num === null || Number.isNaN(num)) return 0;
  return Math.round(num * M2_TO_PING * 100) / 100;
}

/**
 * 從開放資料欄位解析平方公尺數值（支援 "3415.5㎡"、"0㎡" 等格式）
 * @param {string} value
 * @returns {number|null}
 */
function parseM2(value) {
  if (value == null || value === "") return null;
  const s = String(value).replace(/㎡|m²|平方公尺/gi, "").trim();
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}

module.exports = { M2_TO_PING, m2ToPing, parseM2 };
