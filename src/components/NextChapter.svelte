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
    const inEnding = () => host.getBoundingClientRect().top < innerHeight * 0.5
    const finish = () => {
      if (leaving || document.querySelector('dialog[open]')) return
      leaving = true
      oncontinue(chapter.href)
    }
    const intent = (direction: number) => {
      if (continuation.intent(direction, performance.now(), inEnding()))
        finish()
    }
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) intent(event.deltaY)
    }
    const touchStart = (event: TouchEvent) => {
      previousTouch = event.touches[0]?.clientY ?? 0
    }
    const touchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? previousTouch
      intent(previousTouch - y)
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
      if (
        ['ArrowDown', 'PageDown', 'End'].includes(event.key) ||
        (event.key === ' ' && !event.shiftKey && !target.closest('a,button'))
      )
        intent(1)
      if (
        ['ArrowUp', 'PageUp', 'Home'].includes(event.key) ||
        (event.key === ' ' && event.shiftKey)
      )
        intent(-1)
    }
    const update = () => {
      const rect = host.getBoundingClientRect()
      progress = Math.min(
        1,
        Math.max(0, -rect.top / Math.max(1, host.offsetHeight - innerHeight)),
      )
      if (continuation.update(progress, performance.now())) finish()
    }
    const resize = new ResizeObserver(() => {
      // Geometry changes are not evidence of intentional scrolling.
      continuation.intent(-1, performance.now(), false)
      update()
    })
    resize.observe(host)
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: true })
    window.addEventListener('keydown', key)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => {
      resize.disconnect()
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('keydown', key)
      window.removeEventListener('scroll', update)
    }
  })
</script>

<section
  id="next-chapter"
  class="next-chapter"
  bind:this={host}
  aria-label={`Continue scrolling to ${chapter.title}`}
>
  <div class="next-chapter-sticky" style={`--continuation:${progress}`}>
    <div class="next-chapter-top">
      <span>THE NEXT CHAPTER</span><span
        >04 CHAPTERS / ONE CONTINUOUS JOURNEY</span
      >
    </div>
    <div class="chapter-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="next-chapter-copy">
      <span class="eyebrow">{chapter.number} / UP NEXT</span>
      <a href={chapter.href} class="next-chapter-title"
        >{chapter.title}<span aria-hidden="true">↗</span></a
      >
      <p>{chapter.detail}</p>
    </div>
    <div class="next-chapter-bottom">
      <div class="next-chapter-instruction">
        <span
          >{leaving
            ? 'OPENING THE NEXT CHAPTER'
            : `KEEP SCROLLING TO OPEN ${chapter.title.toUpperCase()}`}</span
        ><span
          >{Math.round(progress * 100)
            .toString()
            .padStart(3, '0')}%</span
        >
      </div>
      <div
        class="next-chapter-track"
        role="progressbar"
        aria-label={`Scroll progress to ${chapter.title}`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(progress * 100)}
      >
        <i></i>
      </div>
      <span class="next-chapter-hint">OR SELECT THE TITLE TO CONTINUE ↗</span>
    </div>
  </div>
</section>
