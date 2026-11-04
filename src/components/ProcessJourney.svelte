<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import FluidReveal from './FluidReveal.svelte'
  import { processProgress } from '../lib/process-progress'
  let section: HTMLElement
  let progress = $state(0)
  const motion = $derived(processProgress(progress))
  const chapters = [
    {
      label: '02 / HOW WE GET THERE',
      title: 'A clear path.\nFrom idea to launch.',
      description:
        'Your goals shape the work. Here’s how we turn them into something useful.',
    },
    {
      label: '01 / UNDERSTAND & PLAN',
      title: 'Start with the right questions.',
      description:
        'Understand your people, your goals, and the problem. Then agree on a clear scope and direction.',
    },
    {
      label: '02 / DESIGN & BUILD',
      title: 'Make every layer work together.',
      description:
        'A considered interface. Reliable application logic. Data that connects it all.',
    },
    {
      label: '03 / TEST & LAUNCH',
      title: 'Ready for the real world.',
      description:
        'Review, refine, and test the whole experience. Launch with a clear handover and a plan for what comes next.',
    },
  ]
  onMount(() => {
    const driver = { value: 0 }
    const tween = gsap.to(driver, {
      value: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
      },
      onUpdate: () => {
        progress = driver.value
        section.style.setProperty('--process-progress', String(progress))
        section
          .closest<HTMLElement>('.page-line-flow')
          ?.style.setProperty(
            '--process-thread-opacity',
            String(processProgress(progress).lineOpacity),
          )
      },
    })
    ScrollTrigger.refresh()
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })
</script>

<section
  id="process"
  class="process-journey"
  bind:this={section}
  aria-label="My freelance process: understand, plan, build, and launch"
>
  <div
    class="process-sticky"
    style={`--process-focus:${motion.focus};--process-intro:${motion.introOpacity}`}
  >
    <FluidReveal progress={motion.focus} />
    <div class="process-frame">
      <div class="process-fallback" aria-hidden="true">
        <i></i><i></i><i></i><b></b>
      </div>
    </div>
    <div class="process-top">
      <span>FROM COMPLEXITY TO CLARITY</span><span
        >SCROLL TO BUILD THE PICTURE ↓</span
      >
    </div>
    <div class="process-copy" class:process-intro={motion.chapter === 0}>
      {#key motion.chapter}<span class="eyebrow"
          >{chapters[motion.chapter]!.label}</span
        >
        <h2>{chapters[motion.chapter]!.title}</h2>
        <p>{chapters[motion.chapter]!.description}</p>{/key}
    </div>
    <ol class="process-steps" aria-label="Process chapters">
      <li class:current={motion.chapter === 0}>Understand</li>
      <li class:current={motion.chapter === 1}>Plan</li>
      <li class:current={motion.chapter === 2}>Build</li>
      <li class:current={motion.chapter === 3}>Launch</li>
    </ol>
    <div class="process-caption">
      <span>ONE IDEA. A CONSIDERED SYSTEM.</span><a href="#selected-work"
        >SEE THE RESULTS ↓</a
      >
    </div>
    <div class="process-timeline" aria-hidden="true">
      <i style={`transform:scaleX(${progress})`}></i>
    </div>
  </div>
</section>
