<script lang="ts">
  import { onMount } from 'svelte'
  let { hidden = false }: { hidden?: boolean } = $props()
  let track: HTMLDivElement
  let progress = $state(0)
  let thumbRatio = $state(0.2)
  let scrollable = $state(false)
  let dragging = $state(false)
  let grabOffset = 0
  let pointerId: number | undefined
  const unavailable = $derived(hidden || !scrollable)
  const limit = () =>
    Math.max(0, document.documentElement.scrollHeight - innerHeight)
  function update() {
    const max = limit()
    scrollable = max > 1
    progress = max ? Math.max(0, Math.min(1, scrollY / max)) : 0
    thumbRatio = Math.max(
      0.2,
      Math.min(
        0.6,
        innerHeight /
          Math.max(innerHeight, document.documentElement.scrollHeight),
      ),
    )
  }
  function moveTo(clientY: number) {
    const rect = track.getBoundingClientRect()
    const travel = rect.height * (1 - thumbRatio)
    const fraction = Math.max(
      0,
      Math.min(1, (clientY - rect.top - grabOffset) / travel),
    )
    window.scrollTo({ top: fraction * limit(), behavior: 'instant' })
    update()
  }
  function start(event: PointerEvent) {
    if (unavailable || event.button !== 0) return
    event.preventDefault()
    const rect = track.getBoundingClientRect()
    const thumbTop = rect.top + progress * rect.height * (1 - thumbRatio)
    const inThumb =
      event.clientY >= thumbTop &&
      event.clientY <= thumbTop + rect.height * thumbRatio
    grabOffset = inThumb
      ? event.clientY - thumbTop
      : (rect.height * thumbRatio) / 2
    dragging = true
    pointerId = event.pointerId
    track.setPointerCapture(event.pointerId)
    track.focus({ preventScroll: true })
    moveTo(event.clientY)
  }
  function move(event: PointerEvent) {
    if (dragging && event.pointerId === pointerId && !unavailable)
      moveTo(event.clientY)
  }
  function end() {
    dragging = false
    pointerId = undefined
  }
  function key(event: KeyboardEvent) {
    if (unavailable) return
    let target = scrollY
    switch (event.key) {
      case 'ArrowDown':
        target += 60
        break
      case 'ArrowUp':
        target -= 60
        break
      case 'PageDown':
        target += innerHeight * 0.85
        break
      case 'PageUp':
        target -= innerHeight * 0.85
        break
      case 'Home':
        target = 0
        break
      case 'End':
        target = limit()
        break
      default:
        return
    }
    event.preventDefault()
    window.scrollTo({
      top: Math.max(0, Math.min(limit(), target)),
      behavior: 'instant',
    })
    update()
  }
  onMount(() => {
    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        update()
      })
    }
    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  })
</script>

<div
  class="page-scrollbar"
  class:unavailable
  class:dragging
  bind:this={track}
  role="scrollbar"
  aria-label="Page scroll position"
  aria-controls="main"
  aria-orientation="vertical"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={Math.round(progress * 100)}
  aria-hidden={unavailable}
  inert={unavailable}
  tabindex={unavailable ? -1 : 0}
  onpointerdown={start}
  onpointermove={move}
  onpointerup={end}
  onpointercancel={end}
  onlostpointercapture={end}
  onkeydown={key}
>
  <span class="scroll-rail" aria-hidden="true"></span>
  <span
    class="scroll-thumb"
    aria-hidden="true"
    style={`height:${thumbRatio * 100}%;top:${progress * (1 - thumbRatio) * 100}%`}
  ></span>
</div>

<style>
  .page-scrollbar {
    position: fixed;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: clamp(140px, 25svh, 260px);
    z-index: 55;
    mix-blend-mode: difference;
    cursor: pointer;
    touch-action: none;
    user-select: none;
    opacity: 1;
    transition: opacity 0.35s;
  }
  .scroll-rail,
  .scroll-thumb {
    position: absolute;
    left: 11px;
    width: 6px;
    border-radius: 99px;
    pointer-events: none;
  }
  .scroll-rail {
    top: 0;
    height: 100%;
    background: rgba(255, 255, 255, 0.16);
  }
  .scroll-thumb {
    background: #fff;
    min-height: 18px;
    cursor: grab;
    transition:
      width 0.25s,
      left 0.25s;
  }
  .page-scrollbar:hover .scroll-thumb,
  .page-scrollbar:focus-visible .scroll-thumb,
  .dragging .scroll-thumb {
    width: 8px;
    left: 10px;
  }
  .page-scrollbar:focus-visible {
    outline: 1px solid #fff;
    outline-offset: 3px;
    border-radius: 99px;
  }
  .dragging {
    cursor: grabbing;
  }
  .unavailable {
    opacity: 0;
    pointer-events: none;
  }
  @media (max-width: 760px) {
    .page-scrollbar {
      right: 2px;
      width: 18px;
      height: 22svh;
      min-height: 110px;
    }
    .scroll-rail,
    .scroll-thumb {
      width: 4px;
      left: 7px;
    }
    .page-scrollbar:hover .scroll-thumb,
    .page-scrollbar:focus-visible .scroll-thumb,
    .dragging .scroll-thumb {
      width: 6px;
      left: 6px;
    }
  }
</style>
