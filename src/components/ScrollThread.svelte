<script lang="ts">
  import { onMount } from 'svelte'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { threadPath, type ThreadVariant } from '../lib/thread-path'
  let { variant, draw }: { variant: ThreadVariant; draw?: number } = $props()
  let container: HTMLDivElement
  let svg: SVGSVGElement
  let line: SVGPathElement
  let length = $state(0)
  let scrollProgress = $state(0)
  $effect(() => {
    const value = Math.max(0, Math.min(1, draw ?? scrollProgress))
    if (line && length)
      line.setAttribute('stroke-dashoffset', String(length * (1 - value)))
  })
  onMount(() => {
    const host = container.parentElement!
    let trigger: ScrollTrigger | undefined
    const measure = () => {
      const width = host.clientWidth,
        height = host.offsetHeight
      const work = host.querySelector<HTMLElement>('#selected-work')
      const workBottom = work
        ? work.getBoundingClientRect().bottom -
          host.getBoundingClientRect().top -
          30
        : undefined
      const introHeight =
        host.querySelector<HTMLElement>('#introduction')?.offsetHeight
      const scene = host.querySelector<HTMLElement>('#connection')
      const sceneTop = scene
        ? scene.getBoundingClientRect().top - host.getBoundingClientRect().top
        : undefined
      const previewHeight =
        scene?.querySelector<HTMLElement>('.connection-sticky')?.offsetHeight
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      line.setAttribute(
        'd',
        threadPath(
          variant,
          width,
          height,
          workBottom,
          introHeight,
          sceneTop,
          previewHeight,
        ),
      )
      length = line.getTotalLength()
      line.setAttribute('stroke-dasharray', `${length} ${length}`)
      line.setAttribute(
        'stroke-dashoffset',
        String(length * (1 - (draw ?? scrollProgress))),
      )
      svg.style.visibility = 'visible'
    }
    measure()
    if (draw === undefined)
      trigger = ScrollTrigger.create({
        trigger: host,
        start: 'top 85%',
        end: () => {
          const scene = host.querySelector<HTMLElement>('#connection')
          return scene
            ? window.scrollY + scene.getBoundingClientRect().top + 0
            : 'bottom 35%'
        },
        onUpdate: (self) => {
          scrollProgress = self.progress
        },
        onRefresh: (self) => {
          scrollProgress = self.progress
        },
      })
    const resize = new ResizeObserver(() => {
      measure()
      ScrollTrigger.refresh()
    })
    resize.observe(host)
    return () => {
      resize.disconnect()
      trigger?.kill()
    }
  })
</script>

<div class="scroll-thread" bind:this={container} aria-hidden="true">
  <svg bind:this={svg} preserveAspectRatio="none"><path bind:this={line} /></svg
  >
</div>
