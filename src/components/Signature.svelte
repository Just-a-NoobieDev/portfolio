<script lang="ts">
  import { onMount } from 'svelte'
  import {
    prefersReducedMotion,
    MOTION_CHANGE,
    setMotionEnabled,
  } from '../lib/motion-preference'
  let {
    compact = false,
    dark = false,
    immersive = false,
  }: { compact?: boolean; dark?: boolean; immersive?: boolean } = $props()
  let host: HTMLDivElement
  let ready = $state(false)
  let rotating = $state(false)
  function rotate() {
    rotating = !rotating
    if (prefersReducedMotion()) setMotionEnabled(true)
    host.dispatchEvent(new CustomEvent('signature:spin', { detail: rotating }))
  }
  onMount(() => {
    let disposed = false,
      generation = 0
    let cleanup: (() => void) | undefined
    async function start() {
      const current = ++generation
      cleanup?.()
      cleanup = undefined
      ready = false
      if (prefersReducedMotion()) rotating = false
      try {
        const { createSignature } = await import('../lib/signature-scene')
        if (disposed || current !== generation) return
        cleanup = createSignature(host, {
          compact,
          dark,
          immersive,
          reducedMotion: prefersReducedMotion(),
          onReady: () => {
            if (!disposed) ready = true
          },
          onLost: () => {
            if (!disposed) ready = false
          },
        })
        if (rotating)
          host.dispatchEvent(
            new CustomEvent('signature:spin', { detail: true }),
          )
      } catch {
        ready = false
      }
    }
    void start()
    window.addEventListener(MOTION_CHANGE, start)
    return () => {
      disposed = true
      ++generation
      cleanup?.()
      window.removeEventListener(MOTION_CHANGE, start)
    }
  })
</script>

<div
  class:immersive
  class:compact
  class:dark
  class:ready
  class="signature"
  bind:this={host}
  role={compact || immersive ? 'img' : 'group'}
  aria-label="An interlocking graphite C and electric blue J sculpture"
>
  <div class="signature-still" aria-hidden="true">
    <span>C</span><span>J</span>
  </div>
  {#if !compact && !immersive}<span class="signature-caption" aria-hidden="true"
      ><i></i> REALTIME 3D / DRAG TO EXPLORE</span
    >{/if}
  {#if !compact && !immersive}<button
      class="signature-rotate"
      onclick={rotate}
      aria-pressed={rotating}
      >{rotating ? 'Pause rotation' : 'Rotate sculpture'}
      <span aria-hidden="true">↻</span></button
    >{/if}
</div>
