/**
 * 萬用爬蟲 - 篩選邏輯
 * 處理「要的條件」(include) 與「不要的條件」(exclude)
 */

/**
 * 檢查 URL 是否符合任一 include 的 urlPatterns，若未設定則視為通過
 * @param {string} url
 * @param {string[]} [urlPatterns]
 * @returns {boolean}
 */
export function urlMatchesInclude(url, urlPatterns) {
  if (!urlPatterns || urlPatterns.length === 0) return true
  return urlPatterns.some((pattern) => {
    try {
      const regex = typeof pattern === 'string' && pattern.startsWith('/') && pattern.endsWith('/')
        ? new RegExp(pattern.slice(1, -1))
        : new RegExp(pattern)
      return regex.test(url)
    } catch {
      return url.includes(String(pattern))
    }
  })
}

/**
 * 檢查 URL 是否命中任一 exclude 的 urlPatterns
 * @param {string} url
 * @param {string[]} [urlPatterns]
 * @returns {boolean}
 */
export function urlMatchesExclude(url, urlPatterns) {
  if (!urlPatterns || urlPatterns.length === 0) return false
  return urlPatterns.some((pattern) => {
    try {
      const regex = typeof pattern === 'string' && pattern.startsWith('/') && pattern.endsWith('/')
        ? new RegExp(pattern.slice(1, -1))
        : new RegExp(pattern)
      return regex.test(url)
    } catch {
      return url.includes(String(pattern))
    }
  })
}

/**
 * 單一 contentRule 檢查
 * @param {Record<string, unknown>} item - 擷取出的資料物件
 * @param {Record<string, unknown>} rule - 規則 { field, match?, type?, min?, max? }
 * @returns {boolean}
 */
function contentRulePass(item, rule) {
  const field = rule.field
  const value = item[field]
  if (value === undefined || value === null) return false

  if (rule.match != null) {
    const str = String(value)
    const match = String(rule.match)
    switch (rule.type) {
      case 'includes':
      case 'includesText':
        return str.includes(match)
      case 'startsWith':
        return str.startsWith(match)
      case 'endsWith':
        return str.endsWith(match)
      case 'equals':
        return str === match
      case 'regex':
        try {
          return new RegExp(match).test(str)
        } catch {
          return false
        }
      default:
        return str.includes(match)
    }
  }

  if (rule.min != null || rule.max != null) {
    const num = Number(value)
    if (Number.isNaN(num)) return false
    if (rule.min != null && num < Number(rule.min)) return false
    if (rule.max != null && num > Number(rule.max)) return false
    return true
  }

  return true
}

/**
 * 項目是否通過所有 include 的 contentRules（未設定則通過）
 * @param {Record<string, unknown>} item
 * @param {Array<Record<string, unknown>>} [contentRules]
 * @returns {boolean}
 */
export function contentMatchesInclude(item, contentRules) {
  if (!contentRules || contentRules.length === 0) return true
  return contentRules.every((rule) => contentRulePass(item, rule))
}

/**
 * 項目是否命中任一 exclude 的 contentRules
 * @param {Record<string, unknown>} item
 * @param {Array<Record<string, unknown>>} [contentRules]
 * @returns {boolean}
 */
export function contentMatchesExclude(item, contentRules) {
  if (!contentRules || contentRules.length === 0) return false
  return contentRules.some((rule) => contentRulePass(item, rule))
}

/**
 * 綜合判斷：URL 與內容皆通過 include、且未命中 exclude
 * @param {string} url
 * @param {Record<string, unknown>} item
 * @param {{ include?: { urlPatterns?: string[], contentRules?: any[] }, exclude?: { urlPatterns?: string[], contentRules?: any[] } }} config
 * @returns {boolean}
 */
export function shouldKeep(url, item, config) {
  const inc = config.include || {}
  const exc = config.exclude || {}

  if (!urlMatchesInclude(url, inc.urlPatterns)) return false
  if (urlMatchesExclude(url, exc.urlPatterns)) return false
  if (!contentMatchesInclude(item, inc.contentRules)) return false
  if (contentMatchesExclude(item, exc.contentRules)) return false

  return true
}
