;(() => {
  const THEME_KEY = 'bidzz_theme'
  const THEMES_URL = chrome.runtime.getURL('themes.css')
  const VOLUME_URL = chrome.runtime.getURL('js/volume-boost.js')
  const VOLUME_KEY = 'bidzz_volumeGain'
  const VOLUME_WARN_KEY = 'bidzz_volumeWarned'
  const TIMER_KEY = 'bidzz_sleepTimer'
  const STATS_KEY = 'bidzz_stats'
  const THEME_COLLAPSE_KEY = 'bidzz_themeCollapsed'

  const THEMES = [
    { id: 'dark', label: 'Dark', base: '#07070a', accent: '#1DB954' },
    { id: 'light', label: 'Light', base: '#f5f0eb', accent: '#1DB954' },
    { id: 'midnight', label: 'Mid', base: '#000814', accent: '#3a86ff' },
    { id: 'coffee', label: 'Coff', base: '#1a1410', accent: '#d4a373' },
    { id: 'lavender', label: 'Lave', base: '#12101e', accent: '#a78bfa' },
    { id: 'synthwave', label: 'Synt', base: '#0a0020', accent: '#ff00ff' },
    { id: 'feminine-light', label: 'Femi', base: '#ffdae8', accent: '#ff1b71', group: 'feminine', sub: 'light' },
    { id: 'feminine-dark', label: 'Femi', base: '#1e121e', accent: '#bc0047', group: 'feminine', sub: 'dark' },
  ]

  function injectThemesCss() {
    if (document.getElementById('bidzz-themes-css')) return
    const link = document.createElement('link')
    link.id = 'bidzz-themes-css'
    link.rel = 'stylesheet'
    link.href = THEMES_URL
    document.head.appendChild(link)
  }

  function applyTheme(themeId) {
    const html = document.documentElement
    html.className = html.className
      .split(/\s+/)
      .filter(c => !c.startsWith('bidzz-theme-'))
      .join(' ')
    if (themeId) {
      html.classList.add(`bidzz-theme-${themeId}`)
    }
  }

  function injectVolumeBoost(gain) {
    if (document.getElementById('bidzz-volume-script')) return
    const script = document.createElement('script')
    script.id = 'bidzz-volume-script'
    script.src = VOLUME_URL
    document.documentElement.appendChild(script)
    script.onload = () => {
      window.postMessage({ type: 'BIDZZ_VOLUME', value: gain }, '*')
    }
  }

  function syncVolume(gain) {
    if (gain > 1.0) showVolumeWarning()
    window.postMessage({ type: 'BIDZZ_VOLUME', value: gain }, '*')
  }

  function showTimerNotification() {
    const el = document.createElement('div')
    el.id = 'bidzz-timer-notif'
    el.textContent = '⏱️ Sleep timer ended — music paused'
    Object.assign(el.style, {
      position: 'fixed', bottom: '90px', right: '24px', zIndex: '2147483647',
      background: '#1e1e2a', color: '#f0ece4', padding: '12px 20px',
      borderRadius: '10px', fontSize: '13px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)', opacity: '0',
      transition: 'opacity 0.3s ease', pointerEvents: 'none',
      border: '1px solid rgba(255,255,255,0.06)'
    })
    document.body.appendChild(el)
    requestAnimationFrame(() => { el.style.opacity = '1' })
    setTimeout(() => {
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 300)
    }, 4000)
  }

  function pausePlayback() {
    const btn = document.querySelector('button[data-testid="control-button-playpause"]')
    if (btn && btn.getAttribute('aria-label')?.includes('Pause')) btn.click()
  }

  let timerInterval = null

  function startTimerPolling() {
    if (timerInterval) return
    timerInterval = setInterval(() => {
      chrome.storage.local.get(TIMER_KEY, (result) => {
        const timer = result[TIMER_KEY]
        if (!timer || !timer.endTime) return
        if (Date.now() >= timer.endTime) {
          pausePlayback()
          showTimerNotification()
          chrome.storage.local.remove(TIMER_KEY)
          clearInterval(timerInterval)
          timerInterval = null
        }
      })
    }, 1000)
  }

  function stopTimerPolling() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  }

  /* ── Volume Warning ── */
  function showVolumeWarning() {
    try {
      if (!document.body || document.getElementById('bidzz-vol-warn')) return
      chrome.storage.local.get(VOLUME_WARN_KEY, (result) => {
        if (result[VOLUME_WARN_KEY]) return
        const overlay = document.createElement('div')
        overlay.id = 'bidzz-vol-warn'
        Object.assign(overlay.style, {
          position: 'fixed', inset: '0', zIndex: '2147483647',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)', opacity: '0',
          transition: 'opacity 0.3s ease'
        })

        const box = document.createElement('div')
        Object.assign(box.style, {
          background: '#1e1e2a', borderRadius: '16px', padding: '32px 28px 24px',
          maxWidth: '320px', width: '90%', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          transform: 'scale(0.9)', transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        })
        box.innerHTML = `
          <div style="font-size:32px;margin-bottom:12px">\u26a0\ufe0f</div>
          <div style="font-size:15px;font-weight:700;color:#f0ece4;margin-bottom:8px">Volume Booster</div>
          <div style="font-size:13px;line-height:1.6;color:rgba(240,236,228,0.6);margin-bottom:20px">
            Web Audio API-based.<br/>Mungkin tidak berfungsi di semua perangkat atau browser.
          </div>
          <button id="bidzz-vol-warn-btn" style="
            padding:10px 32px;border:none;border-radius:40px;
            background:#1DB954;color:#fff;font-size:14px;font-weight:600;
            cursor:pointer;font-family:inherit;
            transition:transform 0.2s,box-shadow 0.2s;
            box-shadow:0 4px 14px rgba(29,185,84,0.3)"
          >Got It</button>
        `
        overlay.appendChild(box)
        if (!document.body) return
        document.body.appendChild(overlay)

        requestAnimationFrame(() => {
          overlay.style.opacity = '1'
          box.style.transform = 'scale(1)'
        })

        document.getElementById('bidzz-vol-warn-btn').addEventListener('click', () => {
          chrome.storage.local.set({ [VOLUME_WARN_KEY]: true })
          overlay.style.opacity = '0'
          box.style.transform = 'scale(0.9)'
          setTimeout(() => overlay.remove(), 300)
        })
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            chrome.storage.local.set({ [VOLUME_WARN_KEY]: true })
            overlay.style.opacity = '0'
            box.style.transform = 'scale(0.9)'
            setTimeout(() => overlay.remove(), 300)
          }
        })
      })
    } catch (e) {
      console.warn('[Bidzz] Volume warning error:', e)
    }
  }

  /* ── Floating Button + Panel ── */
  let panelOpen = false

  function formatTimeSaved(seconds) {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) return `${hrs}h ${mins % 60}m`
    return `${mins}m`
  }

  function formatRemaining(ms) {
    if (ms <= 0) return 'Done'
    const totalSec = Math.floor(ms / 1000)
    const m = Math.floor(totalSec / 60)
    const s = totalSec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function renderPanelStats(stats) {
    const total = stats?.totalBlocked || 0
    const today = stats?.todayBlocked || 0
    const el1 = document.getElementById('bidzz-panel-total')
    const el2 = document.getElementById('bidzz-panel-today')
    const el3 = document.getElementById('bidzz-panel-saved')
    if (el1) el1.textContent = total
    if (el2) el2.textContent = today
    if (el3) el3.textContent = formatTimeSaved(total * 30)
  }

  function updatePanelTimer() {
    chrome.storage.local.get(TIMER_KEY, (result) => {
      const timer = result[TIMER_KEY]
      const label = document.getElementById('bidzz-panel-timer-label')
      const countdown = document.getElementById('bidzz-panel-countdown')
      const btns = document.querySelectorAll('.bidzz-timer-btn:not(.bidzz-danger)')
      if (!label || !countdown) return
      if (!timer || !timer.endTime) {
        label.textContent = 'Off'
        countdown.textContent = '—'
        countdown.classList.remove('active')
        btns.forEach(b => b.classList.remove('active'))
        return
      }
      const remaining = timer.endTime - Date.now()
      if (remaining <= 0) {
        label.textContent = 'Done'; countdown.textContent = '—'
        countdown.classList.remove('active')
        btns.forEach(b => b.classList.remove('active'))
        return
      }
      label.textContent = `${Math.ceil(remaining / 60000)}m`
      countdown.textContent = formatRemaining(remaining)
      countdown.classList.add('active')
    })
  }

  function buildPanel() {
    if (document.getElementById('bidzz-panel')) return

    const fab = document.createElement('button')
    fab.id = 'bidzz-fab'
    fab.setAttribute('aria-label', 'Toggle Bidzz menu')
    fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#fff"/>
        <path d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12S30.627 12 24 12zm5.52 17.892a.748.748 0 01-1.032.252c-2.832-1.728-6.396-2.124-10.596-1.164a.75.75 0 01-.336-1.464c4.536-1.056 8.424-.588 11.568 1.344.36.216.468.672.252 1.032zm1.476-3.384a.936.936 0 01-1.284.312c-3.24-1.992-8.184-2.568-12.024-1.404a.936.936 0 01-1.152-.648.936.936 0 01.648-1.152c4.344-1.32 9.768-.672 13.5 1.608.456.264.576.828.312 1.284zm.132-3.516c-3.888-2.304-10.296-2.52-14.004-1.392a1.124 1.124 0 01-1.404-.72 1.124 1.124 0 01.72-1.404c4.248-1.296 11.292-1.044 15.708 1.572.504.3.672.948.372 1.452a1.05 1.05 0 01-1.392.492z" fill="#1DB954"/>
      </svg>
    `

    const panel = document.createElement('div')
    panel.id = 'bidzz-panel'

    let themeCardsHtml = ''
    const row1 = THEMES.slice(0, 4)
    const row2 = THEMES.slice(4)

    const makeCard = (t, isWide) => {
      const isFem = t.group === 'feminine'
      if (isFem) {
        return `
          <div class="bidzz-theme-card wide" data-group="feminine">
            <div class="bidzz-theme-preview" style="background:linear-gradient(135deg,#ffdae8 50%,#1e121e 50%)"></div>
            <span class="bidzz-theme-name">Feminine</span>
            <div class="bidzz-fem-row">
              <button class="bidzz-fem-btn" data-sub="light">L</button>
              <button class="bidzz-fem-btn" data-sub="dark">D</button>
            </div>
          </div>`
      }
      return `
        <div class="bidzz-theme-card" data-theme="${t.id}">
          <div class="bidzz-theme-preview" style="background:${t.base}"></div>
          <span class="bidzz-theme-name">${t.label}</span>
          <span class="bidzz-theme-dot" style="background:${t.accent}"></span>
        </div>`
    }

    themeCardsHtml = row1.map(t => makeCard(t)).join('')
    themeCardsHtml += row2.slice(0, 2).map(t => makeCard(t)).join('')
    themeCardsHtml += makeCard(THEMES[6], true)

    panel.innerHTML = `
      <div class="bidzz-panel-header">
        <span class="bidzz-panel-title">Bidzz</span>
        <button class="bidzz-panel-close" id="bidzz-panel-close">✕</button>
      </div>
      <div class="bidzz-panel-body">
        <div class="bidzz-row">
          <div class="bidzz-stat">
            <span class="bidzz-stat-value" id="bidzz-panel-total">0</span>
            <span class="bidzz-stat-label">Blocked</span>
          </div>
          <div class="bidzz-stat">
            <span class="bidzz-stat-value" id="bidzz-panel-today">0</span>
            <span class="bidzz-stat-label">Today</span>
          </div>
          <div class="bidzz-stat">
            <span class="bidzz-stat-value" id="bidzz-panel-saved">0m</span>
            <span class="bidzz-stat-label">Saved</span>
          </div>
        </div>

        <div class="bidzz-section"><span>Audio</span></div>

        <div class="bidzz-group">
          <div class="bidzz-label">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Volume Boost</span>
            <span class="bidzz-value" id="bidzz-panel-vol-label">100%</span>
          </div>
          <input type="range" class="bidzz-slider" id="bidzz-panel-slider" min="100" max="200" value="100" />
          <div class="bidzz-ticks"><span>1×</span><span>1.5×</span><span>2×</span></div>
        </div>

        <div class="bidzz-group">
          <div class="bidzz-label">
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:4px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Sleep Timer</span>
            <span class="bidzz-value" id="bidzz-panel-timer-label">Off</span>
          </div>
          <div class="bidzz-timer-row">
            <button class="bidzz-timer-btn" data-mins="15">15m</button>
            <button class="bidzz-timer-btn" data-mins="30">30m</button>
            <button class="bidzz-timer-btn" data-mins="60">60m</button>
            <button class="bidzz-timer-btn bidzz-danger" id="bidzz-panel-timer-cancel">✕</button>
          </div>
          <div class="bidzz-countdown" id="bidzz-panel-countdown">—</div>
        </div>

        <div class="bidzz-theme-header" id="bidzz-theme-toggle">
          <span>Theme</span>
          <span class="bidzz-theme-active" id="bidzz-theme-active">Dark</span>
          <svg class="bidzz-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <div class="bidzz-theme-collapse" id="bidzz-theme-body">
          <div class="bidzz-theme-grid">
            ${themeCardsHtml}
          </div>
        </div>
      </div>`

    document.body.appendChild(fab)
    document.body.appendChild(panel)

    fab.addEventListener('click', () => {
      panelOpen = !panelOpen
      panel.classList.toggle('bidzz-open', panelOpen)
      fab.classList.toggle('bidzz-active', panelOpen)
    })

    document.getElementById('bidzz-panel-close').addEventListener('click', () => {
      panelOpen = false; panel.classList.remove('bidzz-open'); fab.classList.remove('bidzz-active')
    })

    document.addEventListener('click', (e) => {
      if (panelOpen && !panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        panelOpen = false; panel.classList.remove('bidzz-open'); fab.classList.remove('bidzz-active')
      }
    })

    /* Volume slider */
    const slider = document.getElementById('bidzz-panel-slider')
    const volLabel = document.getElementById('bidzz-panel-vol-label')
    chrome.storage.local.get(VOLUME_KEY, (result) => {
      const val = result[VOLUME_KEY] ?? 100
      slider.value = val; volLabel.textContent = `${val}%`
    })
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value)
      volLabel.textContent = `${val}%`
      chrome.storage.local.set({ [VOLUME_KEY]: val })
    })

    /* Timer buttons */
    const timerBtns = panel.querySelectorAll('.bidzz-timer-btn[data-mins]')
    const cancelBtn = document.getElementById('bidzz-panel-timer-cancel')
    timerBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.dataset.mins)
        const endTime = Date.now() + mins * 60000
        chrome.storage.local.set({ [TIMER_KEY]: { endTime } })
        timerBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
      })
    })
    cancelBtn.addEventListener('click', () => chrome.storage.local.remove(TIMER_KEY))

    /* Theme cards */
    function themeSelect(themeId) {
      chrome.storage.local.set({ [THEME_KEY]: themeId })
      applyTheme(themeId)
      document.querySelectorAll('.bidzz-theme-card').forEach(c => c.classList.remove('active'))
      document.querySelectorAll('.bidzz-fem-btn').forEach(b => b.classList.remove('active'))
      const t = THEMES.find(x => x.id === themeId)
      if (t && t.group === 'feminine') {
        const card = document.querySelector('.bidzz-theme-card.wide')
        if (card) card.classList.add('active')
        document.querySelectorAll(`.bidzz-fem-btn`).forEach(b => {
          if (b.dataset.sub === t.sub) b.classList.add('active')
        })
      } else {
        const card = document.querySelector(`.bidzz-theme-card[data-theme="${themeId}"]`)
        if (card) card.classList.add('active')
      }
      updateThemeLabel(themeId)
    }

    document.querySelectorAll('.bidzz-theme-card[data-theme]').forEach(card => {
      card.addEventListener('click', () => themeSelect(card.dataset.theme))
    })

    /* Feminine sub-buttons */
    document.querySelectorAll('.bidzz-fem-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        themeSelect(`feminine-${btn.dataset.sub}`)
      })
    })

    /* Feminine card click toggles sub */
    const femCard = document.querySelector('.bidzz-theme-card.wide')
    if (femCard) {
      femCard.addEventListener('click', (e) => {
        if (e.target.closest('.bidzz-fem-btn')) return
        const current = document.querySelector('.bidzz-fem-btn.active')
        const sub = current ? (current.dataset.sub === 'light' ? 'dark' : 'light') : 'light'
        themeSelect(`feminine-${sub}`)
      })
    }

    /* Theme collapse */
    function updateThemeLabel(themeId) {
      const label = document.getElementById('bidzz-theme-active')
      if (!label) return
      const t = THEMES.find(x => x.id === themeId)
      label.textContent = t ? t.label : 'Dark'
    }
    function initThemeCollapse() {
      const toggle = document.getElementById('bidzz-theme-toggle')
      const body = document.getElementById('bidzz-theme-body')
      if (!toggle || !body) return
      chrome.storage.local.get(THEME_COLLAPSE_KEY, (result) => {
        const collapsed = result[THEME_COLLAPSE_KEY] !== false
        body.classList.toggle('open', !collapsed)
        toggle.classList.toggle('collapsed', collapsed)
      })
      toggle.addEventListener('click', () => {
        const isOpen = body.classList.contains('open')
        body.classList.toggle('open', !isOpen)
        toggle.classList.toggle('collapsed', isOpen)
        chrome.storage.local.set({ [THEME_COLLAPSE_KEY]: !isOpen })
      })
    }
    initThemeCollapse()

    /* Init theme state */
    chrome.storage.local.get([THEME_KEY, VOLUME_KEY, STATS_KEY, TIMER_KEY], (result) => {
      const themeId = result[THEME_KEY] || 'dark'
      applyTheme(themeId)
      themeSelect(themeId)
      renderPanelStats(result[STATS_KEY])
      if (result[TIMER_KEY]) updatePanelTimer()
    })

    chrome.storage.onChanged.addListener((changes) => {
      if (changes[STATS_KEY]) renderPanelStats(changes[STATS_KEY].newValue)
      if (changes[TIMER_KEY]) updatePanelTimer()
      if (changes[VOLUME_KEY]) {
        const v = changes[VOLUME_KEY].newValue ?? 100
        slider.value = v; volLabel.textContent = `${v}%`
      }
    })
  }

  /* ── Welcome Modal ── */
  function createModal() {
    if (document.getElementById('bidzz-overlay')) return
    const overlay = document.createElement('div')
    overlay.id = 'bidzz-overlay'
    const modal = document.createElement('div')
    modal.id = 'bidzz-modal'
    modal.innerHTML = `
      <div id="bidzz-modal-content">
        <div id="bidzz-modal-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#1DB954"/>
            <path d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12S30.627 12 24 12zm5.52 17.892a.748.748 0 01-1.032.252c-2.832-1.728-6.396-2.124-10.596-1.164a.75.75 0 01-.336-1.464c4.536-1.056 8.424-.588 11.568 1.344.36.216.468.672.252 1.032zm1.476-3.384a.936.936 0 01-1.284.312c-3.24-1.992-8.184-2.568-12.024-1.404a.936.936 0 01-1.152-.648.936.936 0 01.648-1.152c4.344-1.32 9.768-.672 13.5 1.608.456.264.576.828.312 1.284zm.132-3.516c-3.888-2.304-10.296-2.52-14.004-1.392a1.124 1.124 0 01-1.404-.72 1.124 1.124 0 01.72-1.404c4.248-1.296 11.292-1.044 15.708 1.572.504.3.672.948.372 1.452a1.05 1.05 0 01-1.392.492z" fill="#fff"/>
          </svg>
        </div>
        <h2 id="bidzz-modal-title">Welcome to Bidzz Extension</h2>
        <p id="bidzz-modal-desc">Your Spotify experience, upgraded.<br/>Skip ads &amp; enjoy uninterrupted music.</p>
        <button id="bidzz-modal-btn">Get Started</button>
      </div>`
    overlay.appendChild(modal)
    document.body.appendChild(overlay)
    requestAnimationFrame(() => {
      overlay.classList.add('bidzz-visible')
      modal.classList.add('bidzz-visible')
    })
    const dismiss = () => {
      overlay.classList.remove('bidzz-visible')
      modal.classList.remove('bidzz-visible')
      setTimeout(() => overlay.remove(), 300)
    }
    document.getElementById('bidzz-modal-btn').addEventListener('click', dismiss)
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss() })
  }

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  function init() {
    try {
      injectThemesCss()
      chrome.storage.local.get([THEME_KEY, VOLUME_KEY, TIMER_KEY], (result) => {
        try {
          createModal()
          applyTheme(result[THEME_KEY] || 'dark')
          const gain = result[VOLUME_KEY] ?? 100
          injectVolumeBoost(gain / 100)
          if (result[TIMER_KEY]) startTimerPolling()
          buildPanel()
        } catch (e) {
          console.warn('[Bidzz] Init callback error:', e)
        }
      })
    } catch (e) {
      console.warn('[Bidzz] Init error:', e)
    }
  }

  chrome.storage.onChanged.addListener((changes) => {
    try {
      if (changes[VOLUME_KEY]) {
        const v = changes[VOLUME_KEY].newValue ?? 100
        syncVolume(v / 100)
      }
      if (changes[TIMER_KEY]) {
        if (changes[TIMER_KEY].newValue) startTimerPolling()
        else stopTimerPolling()
      }
    } catch (e) {
      console.warn('[Bidzz] onChanged error:', e)
    }
  })
})()
