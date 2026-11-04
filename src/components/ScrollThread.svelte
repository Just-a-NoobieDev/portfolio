<script lang="ts">
  import { onMount } from 'svelte'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import {
    threadPath,
    storyThreadPath,
    storyDrawProgress,
    type ThreadVariant,
  } from '../lib/thread-path'
  let { variant, draw }: { variant: ThreadVariant; draw?: number } = $props()
  let container: HTMLDivElement
  let svg: SVGSVGElement
  let line: SVGPathElement
  let length = $state(0)
  let scrollProgress = $state(0)
  $effect(() => {
    const value = Math.max(0, Math.min(1, draw ?? scrollProgress))
    if (line && length) {
      line.setAttribute('stroke-dashoffset', String(length * (1 - value)))
      svg.style.visibility = value > 0.00005 ? 'visible' : 'hidden'
    }
  })
  onMount(() => {
    const host = container.parentElement!
    let trigger: ScrollTrigger | undefined
    let arrival = 0,
      departure = 0,
      processStart = 0,
      processEnd = 0,
      start = 0,
      end = 0
    let hasProcess = false
    let samples: { travel: number; length: number }[] = []
    const readDraw = () => {
      if (!hasProcess) return trigger?.progress ?? 0
      if (window.scrollY >= processEnd && samples.length) {
        const fraction = Math.max(
          0,
          Math.min(
            1,
            (window.scrollY - processEnd) / Math.max(1, end - processEnd),
          ),
        )
        const target = fraction * samples[samples.length - 1]!.travel
        let index = 1
        while (index < samples.length - 1 && samples[index]!.travel < target)
          index++
        const from = samples[index - 1]!,
          to = samples[index]!
        const mix =
          (target - from.travel) / Math.max(0.001, to.travel - from.travel)
        return (from.length + (to.length - from.length) * mix) / length
      }
      return storyDrawProgress(
        window.scrollY >= processStart && window.scrollY < processEnd
          ? processStart +
              (processEnd - processStart) *
                (Number(
                  host
                    .querySelector<HTMLElement>('#process')
                    ?.style.getPropertyValue('--process-progress'),
                ) || 0)
          : window.scrollY,
        start,
        processStart,
        processEnd,
        end,
        arrival,
        departure,
      )
    }
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
      const process = host.querySelector<HTMLElement>('#process')
      hasProcess = !!process
      if (process && scene && sceneTop !== undefined) {
        const top =
          process.getBoundingClientRect().top - host.getBoundingClientRect().top
        const bottom = top + process.offsetHeight
        const paths = storyThreadPath(
          width,
          introHeight!,
          top,
          bottom,
          sceneTop,
          workBottom!,
          previewHeight!,
        )
        line.setAttribute('d', paths.path)
        const measurePath = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        )
        length = line.getTotalLength()
        measurePath.setAttribute('d', paths.before)
        arrival = measurePath.getTotalLength() / length
        measurePath.setAttribute('d', paths.through)
        departure = measurePath.getTotalLength() / length
        // Weight vertical travel so the drawing head stays in view across Work.
        // Horizontal loops still consume scroll distance rather than appearing at once.
        samples = [{ travel: 0, length: departure * length }]
        let previous = line.getPointAtLength(departure * length),
          distance = 0
        for (let i = 1; i <= 320; i++) {
          const at = (departure + ((1 - departure) * i) / 320) * length
          const point = line.getPointAtLength(at)
          distance +=
            Math.max(0, point.y - previous.y) +
            Math.abs(point.x - previous.x) * 0.08 +
            Math.abs(point.y - previous.y) * 0.08 +
            0.001
          samples.push({ travel: distance, length: at })
          previous = point
        }
        const absoluteTop = host.getBoundingClientRect().top + window.scrollY
        start = absoluteTop - innerHeight * 0.65
        processStart = absoluteTop + top
        processEnd = absoluteTop + bottom - innerHeight
        end = absoluteTop + sceneTop
      } else
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
        String(length * (1 - (draw ?? readDraw()))),
      )
      svg.style.visibility =
        (draw ?? readDraw()) > 0.00005 ? 'visible' : 'hidden'
    }
    measure()
    const update = () => {
      // Hold the arrival stroke at the pinned preview until it has faded away.
      const pin =
        window.scrollY >= processStart && window.scrollY < processEnd
          ? window.scrollY - processStart
          : 0
      container.style.transform = `translateY(${pin}px)`
      scrollProgress = readDraw()
    }
    window.addEventListener('process-progress', update)
    const heroLayout = () => {
      measure()
      ScrollTrigger.refresh()
    }
    window.addEventListener('hero-layout', heroLayout)
    if (draw === undefined)
      trigger = ScrollTrigger.create({
        trigger: host,
        start: 'top 65%',
        end: () => {
          const scene = host.querySelector<HTMLElement>('#connection')
          return scene
            ? window.scrollY + scene.getBoundingClientRect().top + 0
            : 'bottom 35%'
        },
        onUpdate: (self) => {
          if (hasProcess) update()
          else scrollProgress = self.progress
        },
        onRefresh: (self) => {
          if (hasProcess) update()
          else scrollProgress = self.progress
        },
      })
    const resize = new ResizeObserver(() => {
      measure()
      ScrollTrigger.refresh()
    })
    resize.observe(host)
    return () => {
      resize.disconnect()
      window.removeEventListener('hero-layout', heroLayout)
      window.removeEventListener('process-progress', update)
      trigger?.kill()
    }
  })
</script>

<div class="scroll-thread" bind:this={container} aria-hidden="true">
  <svg bind:this={svg} preserveAspectRatio="none"><path bind:this={line} /></svg
  >
</div>
