<script lang="ts">
  import { onMount } from 'svelte'
  import { nextChapter, ScrollContinuation } from '../lib/scroll-continuation'
  let {
    path,
    oncontinue,
  }: { path: string; oncontinue: (href: string) => void } = $props()
  const chapter = $derived(nextChapter(path))
  let host: HTMLElement
  let progress = $state(0)
  let leaving = $state(false)
  onMount(() => {
    const continuation = new ScrollContinuation()
    let previousTouch = 0
    const atEnd = () =>
      host.getBoundingClientRect().bottom <= innerHeight + 4 &&
      window.scrollY + innerHeight >= document.documentElement.scrollHeight - 4
    const input = (distance: number) => {
      if (leaving || document.querySelector('dialog[open]')) return
      const finished = continuation.feed(distance, atEnd())
      progress = continuation.progress
      if (finished) {
        leaving = true
        oncontinue(chapter.href)
      }
    }
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const pixels =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1)
      input(Math.min(160, Math.max(-160, pixels)))
    }
    const touchStart = (event: TouchEvent) => {
      previousTouch = event.touches[0]?.clientY ?? 0
    }
    const touchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? previousTouch
      input((previousTouch - y) * 1.5)
      previousTouch = y
    }
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        event.defaultPrevented ||
        target.closest(
          'input,textarea,select,[contenteditable="true"],dialog[open]',
        )
      )
        return
      if (event.key === 'ArrowDown') input(60)
      if (
        ['PageDown', 'End'].includes(event.key) ||
        (event.key === ' ' && !event.shiftKey && !target.closest('a,button'))
      )
        input(220)
      if (
        ['ArrowUp', 'PageUp', 'Home'].includes(event.key) ||
        (event.key === ' ' && event.shiftKey)
      )
        input(-220)
    }
    const resetAwayFromEnd = () => {
      if (!leaving && !atEnd()) {
        continuation.reset()
        progress = 0
      }
    }
    const resize = () => {
      if (!leaving) {
        continuation.reset()
        progress = 0
      }
    }
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('keydown', key)
    window.addEventListener('scroll', resetAwayFromEnd, { passive: true })
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('keydown', key)
      window.removeEventListener('scroll', resetAwayFromEnd)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<footer
  id="next-chapter"
  class="next-footer"
  bind:this={host}
  style={`--continuation:${progress}`}
  aria-label={`Continue to ${chapter.title}`}
>
  <div class="next-footer-destination">
    <span class="next-footer-kicker">KEEP EXPLORING / {chapter.number}</span>
    <a href={chapter.href} class="next-footer-title"
      >{chapter.title}<span aria-hidden="true">↗</span></a
    >
  </div>
  <div class="next-footer-progress">
    <div class="next-footer-instruction">
      <span
        >{leaving
          ? 'OPENING NEXT PAGE'
          : 'CONTINUE SCROLLING TO THE NEXT PAGE'}</span
      ><span>{Math.round(progress * 100)}%</span>
    </div>
    <div
      class="next-footer-track"
      role="progressbar"
      aria-label={`Scroll progress to ${chapter.title}`}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={Math.round(progress * 100)}
    >
      <i></i>
    </div>
    <span class="next-footer-hint"
      >OR SELECT {chapter.title.toUpperCase()} ↗</span
    >
  </div>
</footer>
