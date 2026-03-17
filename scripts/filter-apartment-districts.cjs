#!/usr/bin/env node
/**
 * 篩選公寓大廈報備資料：只保留指定行政區
 * - 原台中市 8 區：中區、東區、西區、南區、北區、西屯區、南屯區、北屯區
 * - 外加 9 區：大里區、太平區、潭子區、大雅區、烏日區、龍井區、沙鹿區、梧棲區、清水區
 */

const fs = require('fs');
const path = require('path');

const ALLOWED_DISTRICTS = new Set([
  // 原台中市 8 區
  '中區', '東區', '西區', '南區', '北區', '西屯區', '南屯區', '北屯區',
  // 外加 9 區
  '大里區', '太平區', '潭子區', '大雅區', '烏日區', '龍井區', '沙鹿區', '梧棲區', '清水區',
]);

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && (c === ',' || c === '\n' || c === '\r')) {
      row.push(cell.trim());
      if (c === '\n' || c === '\r') {
        if (row.length) rows.push(row);
        row = [];
        if (c === '\r' && text[i + 1] === '\n') i++;
      }
      cell = '';
      continue;
    }
    cell += c;
  }
  if (cell.trim() !== '' || row.length > 0) row.push(cell.trim());
  if (row.length) rows.push(row);
  return rows;
}

function escapeCSV(cell) {
  if (/[",\n\r]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
  return cell;
}

function toCSV(rows) {
  return rows.map(row => row.map(escapeCSV).join(',')).join('\n');
}

const buildDir = path.join(__dirname, '..', 'build');
const inputPath = path.join(buildDir, '臺中市公寓大廈報備資料1141231csv.csv');
const outputPath = path.join(buildDir, '臺中市公寓大廈報備資料1141231_精選行政區.csv');

const text = fs.readFileSync(inputPath, 'utf8');
const rows = parseCSV(text);
const header = rows[0];
const districtIdx = header.indexOf('行政區');
if (districtIdx === -1) {
  console.error('找不到欄位：行政區');
  process.exit(1);
}

const filtered = [header, ...rows.slice(1).filter(row => ALLOWED_DISTRICTS.has((row[districtIdx] || '').trim()))];
fs.writeFileSync(outputPath, toCSV(filtered), 'utf8');

console.log('篩選行政區：', [...ALLOWED_DISTRICTS].sort().join('、'));
console.log('原始筆數：', rows.length - 1);
console.log('篩選後筆數：', filtered.length - 1);
console.log('輸出：', outputPath);
