/**
 * 萬用爬蟲 - 核心爬取邏輯
 * 依設定擷取 URL、解析 HTML、套用 include/exclude 篩選
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { shouldKeep } from './filters.js'

const defaultOptions = {
  maxPages: 100,
  delayMs: 1000,
  timeoutMs: 15000,
  maxConcurrent: 2,
  retries: 3,
  userAgent: 'UniversalCrawler/1.0',
}

/**
 * 延遲指定毫秒
 * @param {number} ms
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 取得 HTML 字串（含重試）
 * @param {string} url
 * @param {{ timeoutMs: number, retries: number, userAgent: string }} options
 * @returns {Promise<string>}
 */
async function fetchHtml(url, options) {
  const { timeoutMs, retries, userAgent } = options
  let lastError
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await axios.get(url, {
        timeout: timeoutMs,
        responseType: 'text',
        headers: { 'User-Agent': userAgent },
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
      })
      return res.data
    } catch (err) {
      lastError = err
      if (i < retries) await delay(1000 * (i + 1))
    }
  }
  throw lastError
}

/**
 * 將相對 URL 轉為絕對 URL
 * @param {string} baseUrl - 當前頁面 URL
 * @param {string} href
 * @returns {string}
 */
function resolveUrl(baseUrl, href) {
  if (!href || href.startsWith('#')) return ''
  try {
    return new URL(href, baseUrl).href
  } catch {
    return ''
  }
}

/**
 * 從單一頁面擷取欄位（依 selectors.fields）
 * @param {cheerio.CheerioAPI} $
 * @param {Record<string, string>} fieldSelectors - 欄位名 -> CSS 選擇器
 * @param {cheerio.Element} [scope] - 限定在該節點內擷取
 * @returns {Record<string, string>}
 */
function extractFields($, fieldSelectors, scope) {
  const root = scope ? $(scope) : $('body').length ? $('body') : $.root()
  const out = {}
  for (const [name, selector] of Object.entries(fieldSelectors || {})) {
    const el = root.find(selector).first()
    out[name] = el.length ? (el.attr('content') ?? el.text().trim()) : ''
  }
  return out
}

/**
 * 從列表頁擷取連結（依 selectors.listLink）
 * @param {cheerio.CheerioAPI} $
 * @param {string} listLinkSelector
 * @param {string} baseUrl
 * @returns {string[]}
 */
function extractListLinks($, listLinkSelector, baseUrl) {
  if (!listLinkSelector) return []
  const links = []
  $(listLinkSelector).each((_, el) => {
    const href = $(el).attr('href')
    const absolute = resolveUrl(baseUrl, href || '')
    if (absolute && !links.includes(absolute)) links.push(absolute)
  })
  return links
}

/**
 * 執行爬取
 * @param {object} config - 完整設定（entryUrls, include, exclude, output, options, selectors）
 * @param {{ onProgress?: (stats: { fetched: number, kept: number, queued: number }) => void }} hooks
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function runCrawler(config, hooks = {}) {
  const opts = { ...defaultOptions, ...(config.options || {}) }
  const selectors = config.selectors || {}
  const fieldSelectors = selectors.fields || {}
  const listLinkSelector = selectors.listLink || 'a[href]'

  const results = []
  const seen = new Set()
  let queue = [...(config.entryUrls || [])]
  let fetchedCount = 0

  const report = () => {
    if (hooks.onProgress) {
      hooks.onProgress({ fetched: fetchedCount, kept: results.length, queued: queue.length })
    }
  }

  while (queue.length > 0 && fetchedCount < opts.maxPages) {
    const url = queue.shift()
    if (seen.has(url)) continue
    seen.add(url)
    fetchedCount += 1

    await delay(opts.delayMs)

    let html
    try {
      html = await fetchHtml(url, opts)
    } catch (err) {
      console.warn(`[Crawler] 取得失敗: ${url}`, err.message)
      report()
      continue
    }

    const $ = cheerio.load(html)

    // 列表連結：加入佇列（尚未造訪且未超過上限）
    const listLinks = extractListLinks($, listLinkSelector, url)
    for (const link of listLinks) {
      if (!seen.has(link) && queue.length + fetchedCount < opts.maxPages) {
        queue.push(link)
      }
    }

    // 本頁擷取欄位（可當作列表項或詳情頁）
    const item = {
      url,
      ...extractFields($, fieldSelectors),
    }

    // 數值欄位可自動轉數字（方便 min/max 篩選）
    for (const [k, v] of Object.entries(item)) {
      if (typeof v === 'string' && /^\d+(\.\d+)?$/.test(v.trim())) {
        item[k] = v.includes('.') ? parseFloat(v) : parseInt(v, 10)
      }
    }

    if (shouldKeep(url, item, config)) {
      results.push(item)
    }

    report()
  }

  return results
}
