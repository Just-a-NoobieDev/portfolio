<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { processProgress } from '../lib/process-progress'
  let section: HTMLElement
  let progress = $state(0)
  let productView = $state('overview')
  let productSide = $state('front')
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
            String(
              section.getBoundingClientRect().bottom <= innerHeight + 1
                ? 1
                : processProgress(progress).lineOpacity,
            ),
          )
        window.dispatchEvent(new Event('process-progress'))
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
  data-product-view={productView}
  data-product-side={productSide}
  aria-label="My freelance process: understand, plan, build, and launch"
>
  <div
    class="process-sticky"
    style={`--process-focus:${motion.focus};--process-intro:${motion.introOpacity}`}
  >
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
    <div
      data-product-rotate
      class="product-rotate"
      class:active={progress > 0.74}
      role="slider"
      tabindex={progress > 0.74 ? 0 : -1}
      aria-label="Rotate the finished digital product. Drag or use left and right arrows. Home resets the view."
      aria-valuenow="0"
      aria-valuemin="-360"
      aria-valuemax="360"
      aria-orientation="horizontal"
    ></div>
    {#if progress > 0.83}
      <div class="product-controls" aria-label="Explore the finished product">
        <div class="product-views">
          {#each ['overview', 'requests', 'analytics'] as view}
            <button
              class:current={productView === view}
              aria-pressed={productView === view}
              onclick={() => (productView = view)}>{view}</button
            >
          {/each}
        </div>
        <button
          class="product-system"
          aria-pressed={productSide === 'system'}
          onclick={() =>
            (productSide = productSide === 'front' ? 'system' : 'front')}
          >{productSide === 'front'
            ? 'See the system ↗'
            : 'See the product ↗'}</button
        >
        <span>Drag to rotate ↔</span>
      </div>
    {/if}
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
