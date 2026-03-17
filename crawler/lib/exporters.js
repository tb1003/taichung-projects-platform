/**
 * 萬用爬蟲 - 匯出多種格式至指定路徑
 */

import fs from 'fs'
import path from 'path'

/**
 * 確保目錄存在
 * @param {string} dir
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * 匯出為 JSON（單一陣列檔案）
 * @param {string} filePath - 完整檔案路徑
 * @param {Array<Record<string, unknown>>} items
 */
export function exportJson(filePath, items) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8')
}

/**
 * 匯出為 NDJSON（每行一筆 JSON，利於大檔串流）
 * @param {string} filePath
 * @param {Array<Record<string, unknown>>} items
 */
export function exportNdjson(filePath, items) {
  ensureDir(path.dirname(filePath))
  const lines = items.map((item) => JSON.stringify(item))
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8')
}

/**
 * 匯出為 CSV（依第一筆鍵順序，可選 BOM 以支援 Excel 中文）
 * @param {string} filePath
 * @param {Array<Record<string, unknown>>} items
 * @param {{ bom?: boolean }} options
 */
export function exportCsv(filePath, items, options = {}) {
  ensureDir(path.dirname(filePath))
  if (items.length === 0) {
    fs.writeFileSync(filePath, '', 'utf8')
    return
  }
  const headers = [...new Set(items.flatMap((item) => Object.keys(item)))]
  const escape = (v) => {
    const s = String(v == null ? '' : v)
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const rows = [headers.join(','), ...items.map((row) => headers.map((h) => escape(row[h])).join(','))]
  const bom = options.bom !== false ? '\uFEFF' : ''
  fs.writeFileSync(filePath, bom + rows.join('\n'), 'utf8')
}

/**
 * 依設定之 output 與 format 寫入檔案
 * @param {{ dir: string, filename: string, format: string }} outputConfig
 * @param {Array<Record<string, unknown>>} items
 * @returns {string} 實際寫入的檔案路徑
 */
export function exportResults(outputConfig, items) {
  const { dir, filename, format } = outputConfig
  const ext = format === 'csv' ? 'csv' : format === 'ndjson' ? 'ndjson' : 'json'
  const base = path.resolve(dir, filename)
  const filePath = base.includes('.') ? base : `${base}.${ext}`

  switch (format.toLowerCase()) {
    case 'csv':
      exportCsv(filePath, items, { bom: true })
      break
    case 'ndjson':
      exportNdjson(filePath, items)
      break
    case 'json':
    default:
      exportJson(filePath, items)
      break
  }

  return filePath
}
