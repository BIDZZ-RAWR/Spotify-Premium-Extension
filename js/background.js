const STORAGE_KEY = 'bidzz_stats'
const RULE_IDS = [1, 2, 3]

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getDefaultStats() {
  return {
    totalBlocked: 0,
    todayBlocked: 0,
    lastUpdated: null,
    installedAt: Date.now(),
    dailyLog: {}
  }
}

async function syncStats() {
  try {
    const matched = await chrome.declarativeNetRequest.getMatchedRules()
    const now = Date.now()
    const today = getToday()

    const result = await chrome.storage.local.get(STORAGE_KEY)
    let stats = result[STORAGE_KEY] || getDefaultStats()

    const blockedCount = matched
      .filter(r => RULE_IDS.includes(r.ruleId))
      .reduce((sum, r) => sum + (r.amount || 1), 0)

    const prevCount = stats.lastUpdated ? (stats._lastBlockedCount || 0) : 0
    const newBlocks = Math.max(0, blockedCount - prevCount)

    if (newBlocks > 0) {
      stats.totalBlocked += newBlocks
      stats.todayBlocked += newBlocks
      if (!stats.dailyLog) stats.dailyLog = {}
      stats.dailyLog[today] = (stats.dailyLog[today] || 0) + newBlocks
    }

    stats._lastBlockedCount = blockedCount
    stats.lastUpdated = now
    if (!stats.installedAt) stats.installedAt = now

    const lastLogDate = Object.keys(stats.dailyLog || {}).sort().pop()
    if (lastLogDate && lastLogDate !== today) {
      stats.todayBlocked = 0
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: stats })
  } catch (e) {
    console.warn('[Bidzz] Stats sync error:', e)
  }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ bidzz_welcomeShown: false })
  }
  syncStats()
})

setInterval(syncStats, 30000)
