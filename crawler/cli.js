#!/usr/bin/env node
/**
 * 萬用爬蟲 CLI
 * 使用方式：
 *   pnpm crawler
 *   pnpm crawler --config crawler/my-config.json
 *   node crawler/cli.js --config ./crawler/config.json --out-dir ./output --format csv
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { runCrawler } from './lib/crawler.js'
import { exportResults } from './lib/exporters.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { configPath: null, outDir: null, format: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      out.configPath = args[++i]
    } else if (args[i] === '--out-dir' && args[i + 1]) {
      out.outDir = args[++i]
    } else if (args[i] === '--format' && args[i + 1]) {
      out.format = args[++i]
    }
  }
  return out
}

function loadConfig(configPath) {
  const p = path.resolve(configPath || path.join(__dirname, 'config.json'))
  if (!fs.existsSync(p)) {
    console.error('找不到設定檔:', p)
    console.error('請複製 config.example.json 為 config.json 並填寫 entryUrls、selectors 等。')
    process.exit(1)
  }
  const raw = fs.readFileSync(p, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('設定檔 JSON 解析失敗:', e.message)
    process.exit(1)
  }
}

async function main() {
  const { configPath, outDir, format } = parseArgs()
  const config = loadConfig(configPath)

  if (outDir) config.output = config.output || {}
  if (outDir) config.output.dir = path.resolve(outDir)
  if (format) {
    config.output = config.output || {}
    config.output.format = format
  }

  if (!config.entryUrls || config.entryUrls.length === 0) {
    console.error('請在設定檔中設定 entryUrls（至少一個起始網址）。')
    process.exit(1)
  }

  console.log('開始爬取，起始 URL 數量:', config.entryUrls.length)
  console.log('篩選：include', config.include ? '已設定' : '無', '| exclude', config.exclude ? '已設定' : '無')
  console.log('輸出格式:', (config.output && config.output.format) || 'json')

  const results = await runCrawler(config, {
    onProgress(stats) {
      process.stdout.write(`\r已擷取: ${stats.fetched} | 符合條件: ${stats.kept} | 佇列: ${stats.queued}   `)
    },
  })

  console.log('\n爬取完成，共', results.length, '筆符合條件。')

  const output = config.output || { dir: './crawler-output', filename: 'crawl-result', format: 'json' }
  const savedPath = exportResults(output, results)
  console.log('已儲存至:', savedPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
