<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import Signature from './Signature.svelte'
  import { prefersReducedMotion, MOTION_CHANGE } from '../lib/motion-preference'
  let stage: HTMLElement
  let phase = $state(0)
  let reduced = $state(prefersReducedMotion())
  const phases = [
    {
      label: 'The interface.',
      detail: 'Where an idea becomes something you can use.',
    },
    {
      label: 'The connections.',
      detail: 'APIs and logic give every interaction a purpose.',
    },
    {
      label: 'The whole picture.',
      detail: 'Thoughtful pieces. One considered experience.',
    },
  ]
  onMount(() => {
    let trigger: ScrollTrigger | undefined
    function configure() {
      trigger?.kill()
      reduced = prefersReducedMotion()
      phase = 0
      stage.style.setProperty('--stage-progress', '0')
      if (!prefersReducedMotion()) {
        trigger = ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            phase = Math.min(2, Math.floor(self.progress * 3))
            stage.style.setProperty('--stage-progress', String(self.progress))
          },
        })
        ScrollTrigger.refresh()
      }
    }
    configure()
    window.addEventListener(MOTION_CHANGE, configure)
    return () => {
      trigger?.kill()
      window.removeEventListener(MOTION_CHANGE, configure)
      gsap.killTweensOf(stage)
    }
  })
</script>

<section
  id="system"
  class="kinetic-stage"
  bind:this={stage}
  aria-label="An interactive look at how the pieces connect"
>
  <div class="kinetic-sticky">
    <div class="stage-top">
      <span>UNDER THE INTERFACE</span><span
        >{reduced
          ? 'STILL VIEW / MOTION IS OFF'
          : 'SCROLL TO TAKE IT APART ↓'}</span
      >
    </div>
    <div class="stage-grid" aria-hidden="true"></div>
    <div class="stage-scene"><Signature immersive dark /></div>
    <div class="stage-copy">
      <span class="eyebrow">THINKING IN SYSTEMS</span>
      <h2>Every detail.<br /><em>Connected.</em></h2>
      <div class="stage-phase" aria-live="off">
        {#key phase}<h3>{phases[phase].label}</h3>
          <p>{phases[phase].detail}</p>{/key}
      </div>
    </div>
    <div class="stage-bottom">
      <div class="stage-steps">
        {#each ['Interface', 'API & logic', 'Data & systems'] as step, index}<span
            class:active={phase === index}><i>0{index + 1}</i>{step}</span
          >{/each}
      </div>
      <span class="stage-note">BUILT FROM THE INSIDE OUT ↗</span>
    </div>
    <div class="stage-progress" aria-hidden="true"></div>
  </div>
</section>
