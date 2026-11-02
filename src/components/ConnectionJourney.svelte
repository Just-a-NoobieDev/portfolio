<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { journeyProgress } from '../lib/journey-progress'
  let host: HTMLElement
  let canvasHost: HTMLDivElement
  let progress = $state(0)
  let ready = $state(false)
  const choreography = $derived(journeyProgress(progress))
  const phase = $derived(choreography.chapter)
  const chapters = [
    {
      label: '01 / POSSIBILITY',
      title: 'A thought worth following.',
      description: 'Every good project starts with a question.',
    },
    {
      label: '02 / MOMENTUM',
      title: 'Build the connection.',
      description: 'The pieces find their place. A direction becomes clear.',
    },
    {
      label: '03 / A NEW PERSPECTIVE',
      title: 'See what’s possible.',
      description: 'Go beyond the surface. Find a new point of view.',
    },
    {
      label: '04 / WHAT COMES NEXT',
      title: 'Let’s work together.',
      description: 'Bring your idea. Let’s see where it can go.',
    },
  ]
  onMount(() => {
    let disposed = false
    let destroyScene: (() => void) | undefined
    const driver = { value: 0 }
    const tween = gsap.to(driver, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: host,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
      },
      onUpdate: () => {
        progress = driver.value
        host.style.setProperty('--connection-progress', String(progress))
        host
          .closest<HTMLElement>('.page-line-flow')
          ?.style.setProperty(
            '--thread-opacity',
            String(journeyProgress(progress).lineOpacity),
          )
      },
    })
    // Load the extra scene near its section instead of allocating another GPU scene at startup.
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting || disposed) return
        observer.disconnect()
        try {
          const { createConnectionJourney } =
            await import('../lib/connection-scene')
          if (disposed) return
          destroyScene = createConnectionJourney(
            canvasHost,
            host,
            () => {
              ready = true
            },
            () => {
              ready = false
            },
            () => progress,
          )
        } catch {
          ready = false
        }
      },
      { rootMargin: '500px' },
    )
    observer.observe(host)
    ScrollTrigger.refresh()
    return () => {
      disposed = true
      observer.disconnect()
      tween.scrollTrigger?.kill()
      tween.kill()
      destroyScene?.()
    }
  })
</script>

<section
  id="connection"
  class="connection-journey"
  bind:this={host}
  aria-label="From a possibility to a connection: a scroll-driven journey"
>
  <div
    class="connection-sticky"
    class:ready
    class:immersed={choreography.focus > 0.98}
    style={`--scene-focus:${choreography.focus};--intro-copy:${choreography.introOpacity}`}
  >
    <div class="connection-frame">
      <div
        class="connection-scene"
        bind:this={canvasHost}
        role="img"
        aria-label="A framed blue signal expands into a full-screen bridge journey, passes through a gateway, and enters a constellation of connections"
      >
        <div class="connection-fallback" aria-hidden="true"><i></i><b></b></div>
      </div>
    </div>
    <div class="connection-top">
      <span>FROM A POSSIBILITY TO A CONNECTION</span><span
        >FOLLOW THE SIGNAL ↓</span
      >
    </div>
    <div
      class="connection-heading"
      class:invitation={phase === 3}
      class:preview-copy={phase === 0}
    >
      {#key phase}<span class="eyebrow">{chapters[phase].label}</span>
        {#if phase === 3}<h2>
            <a href="/contact"
              >Let’s work<br /><em>together.</em><span
                class="connection-arrow"
                aria-hidden="true">↗</span
              ></a
            >
          </h2>
        {:else}<h2>{chapters[phase].title}</h2>{/if}
        <p>{chapters[phase].description}</p>{/key}
    </div>
    <div class="connection-caption">
      <span>A CLEAR PATH FROM IDEA TO EXPERIENCE.</span><span
        >SCROLL TO CONTINUE ↓</span
      >
    </div>
    <div class="connection-timeline" aria-hidden="true"><i></i></div>
  </div>
</section>
