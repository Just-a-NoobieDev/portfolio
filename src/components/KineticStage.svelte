<script lang="ts">
  import { onMount } from 'svelte'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import Signature from './Signature.svelte'
  import { sceneStory } from '../lib/scene-story'
  let stage: HTMLElement
  let phase = $state(0)
  let progress = $state(0)
  const phases = [
    {
      title: 'Start with an idea.',
      detail: 'A single interaction. A world of possibilities.',
      word: 'Potential.',
      label: 'The idea',
    },
    {
      title: 'Look beneath the surface.',
      detail: 'Interfaces unfold. Each layer has a purpose.',
      word: 'Structure.',
      label: 'The interface',
    },
    {
      title: 'Follow the connections.',
      detail: 'Logic, APIs, and data bring the experience to life.',
      word: 'Connection.',
      label: 'The system',
    },
    {
      title: 'Make it all feel like one.',
      detail: 'The complexity comes together. The experience feels simple.',
      word: 'Experience.',
      label: 'The whole',
    },
  ]
  onMount(() => {
    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress = self.progress
        phase = sceneStory(progress).chapter
        stage.style.setProperty('--stage-progress', String(progress))
      },
    })
    ScrollTrigger.refresh()
    return () => trigger.kill()
  })
</script>

<section
  id="system"
  class="kinetic-stage"
  bind:this={stage}
  aria-label="Under the interface: a scroll-driven 3D exploration"
>
  <div class="kinetic-sticky">
    <div class="stage-top">
      <span>UNDER THE INTERFACE</span><span>SCROLL TO UNFOLD ↓</span>
    </div>
    <div class="stage-grid" aria-hidden="true"></div>
    <div class="stage-orbital-text" aria-hidden="true">
      {phases[phase].word}
    </div>
    <div class="stage-scene"><Signature immersive dark /></div>
    <div class="stage-copy">
      <span class="eyebrow">A SMALL EXPLORATION OF HOW I THINK</span>
      <div class="stage-phase" aria-live="off">
        {#key phase}<span class="stage-chapter">0{phase + 1} / 04</span>
          <h2>{phases[phase].title}</h2>
          <p>{phases[phase].detail}</p>{/key}
      </div>
    </div>
    <div class="stage-bottom">
      <div class="stage-steps">
        {#each phases as item, index}<span class:active={phase === index}
            ><i>0{index + 1}</i>{item.label}</span
          >{/each}
      </div>
      <span class="stage-note"
        >{String(Math.round(progress * 100)).padStart(3, '0')} / 100</span
      >
    </div>
    <div class="stage-progress" aria-hidden="true"></div>
  </div>
</section>
