const STATS_KEY = 'bidzz_stats'
const THEME_KEY = 'bidzz_darkTheme'
const VOLUME_KEY = 'bidzz_volumeGain'
const TIMER_KEY = 'bidzz_sleepTimer'

/* ── Stats ── */
function formatTimeSaved(seconds) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) return `${hrs}h ${mins % 60}m`
  return `${mins}m`
}

function animateValue(el, target, suffix = '') {
  const duration = 700
  const start = performance.now()
  function update(now) {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = Math.floor(eased * target) + suffix
    if (t < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

function renderStats(stats) {
  const total = stats?.totalBlocked || 0
  const today = stats?.todayBlocked || 0
  const timeSaved = total * 30
  animateValue(document.getElementById('total-blocked'), total)
  animateValue(document.getElementById('today-blocked'), today)
  animateValue(document.getElementById('time-saved'), formatTimeSaved(timeSaved))
}

/* ── Volume Boost ── */
function initVolume() {
  const slider = document.getElementById('volume-slider')
  const label = document.getElementById('volume-label')

  chrome.storage.local.get(VOLUME_KEY, (result) => {
    const val = result[VOLUME_KEY] ?? 100
    slider.value = val
    label.textContent = `${val}%`
  })

  slider.addEventListener('input', () => {
    const val = parseInt(slider.value)
    label.textContent = `${val}%`
    chrome.storage.local.set({ [VOLUME_KEY]: val })
  })
}

/* ── Sleep Timer ── */
let timerRefresh = null

function formatRemaining(ms) {
  if (ms <= 0) return 'Done'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function updateTimerUI(timer) {
  const label = document.getElementById('timer-label')
  const countdown = document.getElementById('timer-countdown')
  const btns = document.querySelectorAll('.timer-btn:not(.danger)')

  if (!timer || !timer.endTime) {
    label.textContent = 'Off'
    countdown.textContent = '—'
    countdown.classList.remove('active')
    btns.forEach(b => b.classList.remove('active'))
    if (timerRefresh) { clearInterval(timerRefresh); timerRefresh = null }
    return
  }

  const remaining = timer.endTime - Date.now()
  if (remaining <= 0) {
    label.textContent = 'Done'
    countdown.textContent = '—'
    countdown.classList.remove('active')
    btns.forEach(b => b.classList.remove('active'))
    if (timerRefresh) { clearInterval(timerRefresh); timerRefresh = null }
    return
  }

  label.textContent = `${Math.ceil(remaining / 60000)}m`
  countdown.textContent = formatRemaining(remaining)
  countdown.classList.add('active')

  if (!timerRefresh) {
    timerRefresh = setInterval(() => {
      chrome.storage.local.get(TIMER_KEY, (r) => updateTimerUI(r[TIMER_KEY]))
    }, 1000)
  }
}

function initTimer() {
  const btns = document.querySelectorAll('.timer-btn[data-minutes]')
  const cancel = document.getElementById('timer-cancel')

  chrome.storage.local.get(TIMER_KEY, (result) => {
    const timer = result[TIMER_KEY]
    updateTimerUI(timer)
    if (timer && timer.endTime) {
      btns.forEach(b => {
        const mins = parseInt(b.dataset.minutes) * 60000
        if (Math.abs((timer.endTime - Date.now()) - mins) < 5000) {
          b.classList.add('active')
        }
      })
    }
  })

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mins = parseInt(btn.dataset.minutes)
      const endTime = Date.now() + mins * 60000
      chrome.storage.local.set({ [TIMER_KEY]: { endTime } })
      btns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  cancel.addEventListener('click', () => {
    chrome.storage.local.remove(TIMER_KEY)
  })
}

/* ── Dark Theme Toggle ── */
function initThemeToggle() {
  const toggle = document.getElementById('toggle-dark')
  chrome.storage.local.get(THEME_KEY, (result) => {
    toggle.checked = !!result[THEME_KEY]
  })
  toggle.addEventListener('change', () => {
    chrome.storage.local.set({ [THEME_KEY]: toggle.checked })
  })
}

/* ── Init ── */
chrome.storage.local.get(STATS_KEY, (result) => renderStats(result[STATS_KEY]))

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STATS_KEY]) renderStats(changes[STATS_KEY].newValue)
  if (changes[TIMER_KEY]) updateTimerUI(changes[TIMER_KEY].newValue)
})

initVolume()
initTimer()
initThemeToggle()
