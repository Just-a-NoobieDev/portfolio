<script lang="ts">
  import { onMount } from 'svelte'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  let host: HTMLElement
  let svg: SVGSVGElement
  let line: SVGPathElement
  let tip: SVGCircleElement
  let progress = 0
  onMount(() => {
    let length = 0
    const draw = (value: number) => {
      progress = value
      line.setAttribute('stroke-dashoffset', String(length * (1 - progress)))
      const point = line.getPointAtLength(length * progress)
      tip.setAttribute('cx', String(point.x))
      tip.setAttribute('cy', String(point.y))
      tip.style.opacity = progress > 0.001 ? '1' : '0'
    }
    const measure = () => {
      const mobile = host.clientWidth <= 760
      svg.setAttribute('viewBox', mobile ? '0 0 390 844' : '0 0 1440 800')
      line.setAttribute(
        'd',
        mobile
          ? 'M410 98H375Q360 98 360 113V714Q360 760 314 760H76Q30 760 30 714V655'
          : 'M1500 130H1370Q1330 130 1330 170V575Q1330 660 1245 660H850Q760 660 760 570V550Q760 510 720 510H150Q70 510 70 590V620Q70 710 160 710H680',
      )
      length = line.getTotalLength()
      // Use the real measured path length, not normalized 0–1 CSS dash values.
      line.setAttribute('stroke-dasharray', `${length} ${length}`)
      draw(progress)
      svg.style.visibility = 'visible'
    }
    measure()
    const trigger = ScrollTrigger.create({
      trigger: host,
      start: 'top top',
      end: 'bottom bottom',
      // A direct distance mapping: no threshold, stagger, or timed reveal.
      onUpdate: (self) => draw(self.progress),
      onRefresh: (self) => draw(self.progress),
    })
    const resize = new ResizeObserver(() => {
      measure()
      ScrollTrigger.refresh()
    })
    resize.observe(host)
    return () => {
      resize.disconnect()
      trigger.kill()
    }
  })
</script>

<section
  class="signal-introduction"
  id="introduction"
  bind:this={host}
  aria-label="From a first idea to a connected experience"
>
  <div class="signal-sticky">
    <div class="signal-trace" aria-hidden="true">
      <svg viewBox="0 0 1440 800" preserveAspectRatio="none" bind:this={svg}>
        <path
          class="signal-stroke"
          bind:this={line}
          d="M1500 130H1370Q1330 130 1330 170V575Q1330 660 1245 660H850Q760 660 760 570V550Q760 510 720 510H150Q70 510 70 590V620Q70 710 160 710H680"
        />
        <circle class="signal-tip" bind:this={tip} r="7" />
      </svg>
    </div>
    <div class="signal-content section-wrap">
      <div class="section-eyebrow">
        <span>A LITTLE ABOUT MY APPROACH</span><span>01 / INTRODUCTION</span>
      </div>
      <div class="signal-copy-grid">
        <h2>
          Good software<br />starts with<br /><em>understanding.</em>
        </h2>
        <div class="signal-description">
          <p>
            From the first interaction to the logic behind the scenes, I care
            about how the pieces fit together.
          </p>
          <p class="muted">
            I’m Carl, a full-stack developer based in the Philippines. I turn
            ideas into considered web applications, with a particular love for
            backend development.
          </p>
          <a href="/about" class="text-link">More about me <span>↗</span></a>
          <a href="#system" class="text-link system-link"
            >Explore the system <span>↓</span></a
          >
        </div>
      </div>
      <div class="signal-footnote">
        <span>ONE IDEA. MANY CONSIDERED CONNECTIONS.</span><span
          >SCROLL TO TRACE THE THINKING ↓</span
        >
      </div>
    </div>
  </div>
</section>
