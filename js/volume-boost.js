;(() => {
  let audioCtx = null
  let gainNode = null
  let source = null
  let currentAudio = null
  let gain = 1.0
  let retryTimer = null

  function findAudio() {
    return document.querySelector('audio')
  }

  function cleanup() {
    if (source) {
      try { source.disconnect() } catch (e) {}
      source = null
    }
    if (gainNode) {
      try { gainNode.disconnect() } catch (e) {}
      gainNode = null
    }
    if (audioCtx) {
      try { audioCtx.close() } catch (e) {}
      audioCtx = null
    }
    if (currentAudio) {
      if (gain <= 1.0) currentAudio.volume = 1.0
      currentAudio = null
    }
  }

  function setup(audio) {
    if (!audio || audio === currentAudio) return
    cleanup()
    currentAudio = audio

    if (gain <= 1.0) {
      audio.volume = 1.0
      return
    }

    try {
      audioCtx = new AudioContext()
      gainNode = audioCtx.createGain()
      gainNode.gain.value = gain
      source = audioCtx.createMediaElementSource(audio)
      source.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      audio.volume = 0
      resumeCtx()
    } catch (e) {
      audio.volume = Math.min(gain, 1.0)
    }
  }

  function resumeCtx() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
  }

  function setGain(val) {
    gain = Math.min(2.0, Math.max(1.0, val))
    if (gainNode) {
      gainNode.gain.value = gain
    }
    if (gain <= 1.0 && currentAudio) {
      currentAudio.volume = 1.0
    }
  }

  function tryAttach() {
    const audio = findAudio()
    if (audio) setup(audio)
  }

  const observer = new MutationObserver(() => {
    const audio = findAudio()
    if (audio && audio !== currentAudio) {
      setup(audio)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  tryAttach()

  document.addEventListener('play', resumeCtx, true)
  document.addEventListener('click', resumeCtx, true)
  document.addEventListener('pointerdown', resumeCtx, true)

  retryTimer = setInterval(() => {
    if (!currentAudio || gain <= 1.0) return
    resumeCtx()
    const audio = findAudio()
    if (audio && audio !== currentAudio) setup(audio)
  }, 2000)

  window.addEventListener('message', (e) => {
    if (e.source !== window) return
    if (e.data?.type === 'BIDZZ_VOLUME') {
      const prevGain = gain
      setGain(e.data.value)
      if (prevGain <= 1.0 && gain > 1.0) {
        tryAttach()
      }
    }
  })
})()
