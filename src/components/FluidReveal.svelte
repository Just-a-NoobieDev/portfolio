<script lang="ts">
  import { onMount } from 'svelte'
  import { fluidFramePath } from '../lib/fluid-reveal'
  import { smooth } from '../lib/process-progress'
  let { progress }: { progress: number } = $props()
  let width = $state(innerWidth)
  let height = $state(innerHeight)
  let svg: SVGSVGElement
  const windowPath = $derived(fluidFramePath(progress, width, height))
  const wave = $derived(
    Math.min(1, progress + Math.sin(progress * Math.PI) * 0.18),
  )
  const wavePath = $derived(fluidFramePath(wave, width, height))
  const opacity = $derived(
    smooth(0, 0.035, progress) * (1 - smooth(0.94, 1, progress)),
  )
  onMount(() => {
    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return
      width = entry.contentRect.width
      height = entry.contentRect.height
    })
    resize.observe(svg)
    return () => resize.disconnect()
  })
</script>

<svg class="liquid-reveal" bind:this={svg} aria-hidden="true">
  <defs>
    <clipPath id="process-liquid-window" clipPathUnits="objectBoundingBox">
      <path d={windowPath} />
    </clipPath>
  </defs>
  <svg viewBox="0 0 1 1" preserveAspectRatio="none" width="100%" height="100%">
    <path class="liquid-wave" d={wavePath} style={`opacity:${opacity}`} />
  </svg>
</svg>

<style>
  .liquid-reveal {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 1;
  }
  .liquid-wave {
    fill: var(--blue);
  }
</style>
