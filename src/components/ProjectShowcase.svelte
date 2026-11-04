<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'
  import type { Project } from '../lib/projects'
  import { reveal } from '../lib/motion'
  let { items, compact = false }: { items: Project[]; compact?: boolean } =
    $props()
  let list: HTMLDivElement
  let active = $state(-1)
  let resetPreview: (() => void) | undefined
  let updateSlides: (() => void) | undefined

  $effect(() => {
    items
    updateSlides?.()
    resetPreview?.()
  })

  onMount(() => {
    // A body-level preview can cross row boundaries without being clipped by
    // the Home page's scroll-art wrapper or a reveal transform.
    // This overlay is owned by this controller, not by Svelte's fragment.
    // Route changes and hot updates can therefore remove it independently.
    const preview = document.createElement('div')
    preview.className = 'project-hover-preview'
    preview.setAttribute('aria-hidden', 'true')
    const strip = document.createElement('div')
    strip.className = 'project-hover-strip'
    const view = document.createElement('div')
    view.className = 'project-hover-view'
    view.append('View ')
    const arrow = document.createElement('span')
    arrow.textContent = '↗'
    view.append(arrow)
    preview.append(strip, view)
    updateSlides = () => {
      const slides = document.createDocumentFragment()
      for (const project of items) {
        const slide = document.createElement('div')
        slide.className = 'project-hover-slide'
        slide.style.background = project.color
        const image = document.createElement('img')
        image.src = project.image
        image.alt = ''
        image.width = 900
        image.height = 550
        image.loading = 'lazy'
        slide.append(image)
        slides.append(slide)
      }
      strip.replaceChildren(slides)
    }
    updateSlides()
    document.body.appendChild(preview)
    const media = matchMedia(
      '(hover: hover) and (pointer: fine) and (min-width: 761px)',
    )
    gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 })
    const xTo = gsap.quickTo(preview, 'x', {
      duration: 0.5,
      ease: 'power3.out',
    })
    const yTo = gsap.quickTo(preview, 'y', {
      duration: 0.5,
      ease: 'power3.out',
    })
    let shown = false
    let keyboard = false
    let destroyed = false
    const hide = () => {
      active = -1
      shown = false
      gsap.to(preview, {
        scale: 0.72,
        autoAlpha: 0,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    resetPreview = hide
    const place = (x: number, y: number, immediately: boolean) => {
      const half = preview.offsetWidth / 2
      const edge = Math.min(half + 16, innerHeight / 2)
      const nextX = Math.max(half + 16, Math.min(innerWidth - half - 16, x))
      const nextY = Math.max(edge, Math.min(innerHeight - edge, y))
      if (immediately) {
        xTo.tween.pause()
        yTo.tween.pause()
        gsap.set(preview, { x: nextX, y: nextY })
      } else {
        xTo(nextX)
        yTo(nextY)
      }
    }
    const show = (row: HTMLElement, x: number, y: number) => {
      if (!media.matches) return
      const index = items.findIndex(
        (item) => item.slug === row.dataset.projectSlug,
      )
      if (index < 0) return
      // Prioritize the active artwork; adjacent slides warm the cache.
      for (const candidate of [index - 1, index, index + 1]) {
        const image = strip.children[candidate]?.querySelector('img')
        if (image) image.loading = 'eager'
      }
      place(x, y, !shown)
      if (index !== active) {
        active = index
        gsap.to(strip, {
          yPercent: -index * 100,
          duration: shown ? 0.55 : 0,
          ease: 'power3.inOut',
          overwrite: true,
        })
      }
      if (!shown) {
        shown = true
        gsap.fromTo(
          preview,
          { scale: 0.78, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: 'auto',
          },
        )
      }
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !media.matches) return
      keyboard = false
      const target = event.target as Element
      const row = target.closest<HTMLElement>('[data-project-slug]')
      if (!row || !list.contains(row) || target.closest('.showcase-links')) {
        hide()
        return
      }
      show(row, event.clientX, event.clientY)
    }
    const leave = () => {
      if (!keyboard) hide()
    }
    const focus = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      keyboard = false
      const row = target.closest<HTMLElement>('[data-project-slug]')
      if (
        !target.matches(':focus-visible') ||
        !row ||
        target.closest('.showcase-links')
      ) {
        hide()
        return
      }
      keyboard = true
      const rect = row.getBoundingClientRect()
      show(row, innerWidth * 0.72, rect.top + rect.height / 2)
    }
    const blur = () =>
      queueMicrotask(() => {
        if (destroyed) return
        if (!list.contains(document.activeElement)) {
          keyboard = false
          hide()
        }
      })
    const scroll = () => {
      if (keyboard) {
        const row = document.activeElement?.closest<HTMLElement>(
          '[data-project-slug]',
        )
        if (row && list.contains(row)) {
          const rect = row.getBoundingClientRect()
          show(row, innerWidth * 0.72, rect.top + rect.height / 2)
          return
        }
      }
      hide()
    }
    const change = () => {
      keyboard = false
      hide()
    }
    list.addEventListener('pointermove', move)
    list.addEventListener('pointerleave', leave)
    list.addEventListener('focusin', focus)
    list.addEventListener('focusout', blur)
    list.addEventListener('click', hide)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', change, { passive: true })
    window.addEventListener('blur', hide)
    media.addEventListener('change', change)
    return () => {
      destroyed = true
      resetPreview = undefined
      updateSlides = undefined
      list.removeEventListener('pointermove', move)
      list.removeEventListener('pointerleave', leave)
      list.removeEventListener('focusin', focus)
      list.removeEventListener('focusout', blur)
      list.removeEventListener('click', hide)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', change)
      window.removeEventListener('blur', hide)
      media.removeEventListener('change', change)
      xTo.tween.kill()
      yTo.tween.kill()
      gsap.killTweensOf([preview, strip])
      preview.remove()
    }
  })
</script>

<div class="project-showcase" class:compact bind:this={list}>
  {#each items as project (project.slug)}
    <article
      class="showcase-row"
      class:preview-active={active === items.indexOf(project)}
      data-project-slug={project.slug}
      use:reveal
    >
      <a
        class="showcase-row-hit"
        href={`/work/${project.slug}`}
        tabindex="-1"
        aria-hidden="true"
      ></a>
      <a
        class="showcase-mobile-image"
        href={`/work/${project.slug}`}
        style={`--project-color:${project.color}`}
        aria-label={`Explore ${project.title}`}
      >
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          width="900"
          height="550"
        />
        <span aria-hidden="true">View project ↗</span>
      </a>
      <div class="showcase-main">
        <span class="showcase-number"
          >{String(project.order).padStart(2, '0')}</span
        >
        <div class="showcase-copy">
          <svelte:element this={compact ? 'h3' : 'h2'} class="showcase-title"
            ><a href={`/work/${project.slug}`}
              >{project.shortTitle ?? project.title}</a
            ></svelte:element
          >
          {#if !compact}
            <p>{project.description}</p>
            <div class="showcase-links">
              {#if project.demoStatus === 'offline'}<span>Demo offline</span
                >{/if}
              {#if project.demoUrl && project.demoStatus !== 'offline'}<a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer">Visit project ↗</a
                >{/if}
              {#if project.repositoryUrl}<a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer">Source code ↗</a
                >{/if}
            </div>
          {/if}
        </div>
        <div class="showcase-meta">
          <span>{project.role}</span><small
            >{project.technologies.slice(0, compact ? 3 : 5).join(' / ')}</small
          >
        </div>
        <span class="showcase-arrow" aria-hidden="true">↗</span>
      </div>
    </article>
  {/each}
</div>

<style>
  .project-showcase {
    border-top: 1px solid var(--line);
  }
  .showcase-row {
    position: relative;
    border-bottom: 1px solid var(--line);
  }
  .showcase-row-hit {
    position: absolute;
    inset: 0;
    z-index: 1;
  }
  .showcase-main {
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) minmax(155px, 23%) 24px;
    gap: 24px;
    align-items: center;
    padding: 48px 0;
    min-height: 245px;
    position: relative;
    z-index: 2;
    pointer-events: none;
  }
  .showcase-main a {
    pointer-events: auto;
  }
  .showcase-number {
    font:
      9px ui-monospace,
      monospace;
    color: var(--muted);
    align-self: start;
    padding-top: 12px;
  }
  .showcase-title {
    font-size: clamp(32px, 3.8vw, 58px);
    letter-spacing: -0.06em;
    line-height: 1.13;
    font-weight: 450;
    transition:
      color 0.35s,
      transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
  }
  .showcase-title a {
    display: inline-block;
  }
  .showcase-copy p {
    max-width: 540px;
    font-size: 12px;
    line-height: 1.75;
    color: var(--muted);
    margin-top: 17px;
  }
  .showcase-meta {
    display: grid;
    gap: 15px;
    font-size: 12px;
    line-height: 1.6;
  }
  .showcase-meta small {
    font:
      8px/1.8 ui-monospace,
      monospace;
    color: var(--muted);
    text-transform: uppercase;
  }
  .showcase-arrow {
    font-size: 27px;
  }
  .showcase-links {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    font-size: 10px;
    margin-top: 20px;
    color: var(--muted);
  }
  .showcase-links a {
    border-bottom: 1px solid var(--line);
    padding-bottom: 3px;
  }
  .showcase-links a:hover {
    color: var(--blue);
  }
  .showcase-mobile-image {
    display: block;
    background: var(--project-color);
    padding: 9%;
    position: relative;
    z-index: 2;
    aspect-ratio: 1.4;
  }
  .showcase-mobile-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .showcase-mobile-image span {
    position: absolute;
    right: 15px;
    bottom: 12px;
    font-size: 10px;
  }
  .compact .showcase-main {
    min-height: 195px;
    padding: 48px 0;
  }
  .compact .showcase-title {
    font-size: clamp(38px, 4.8vw, 72px);
  }
  :global(.project-hover-preview) {
    position: fixed;
    z-index: 90;
    top: 0;
    left: 0;
    width: clamp(300px, 34vw, 480px);
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 5px;
    pointer-events: none;
    visibility: hidden;
    opacity: 0;
    will-change: transform;
  }
  :global(.project-hover-strip) {
    width: 100%;
    height: 100%;
    will-change: transform;
  }
  :global(.project-hover-slide) {
    height: 100%;
    width: 100%;
    padding: 12%;
    display: grid;
    place-items: center;
  }
  :global(.project-hover-slide img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 2px;
  }
  :global(.project-hover-view) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 94px;
    aspect-ratio: 1;
    border-radius: 50%;
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    background: var(--blue);
    color: white;
    font-size: 14px;
  }
  :global(.project-hover-view span) {
    font-size: 16px;
  }
  @media (hover: hover) and (pointer: fine) and (min-width: 761px) {
    .showcase-mobile-image {
      display: none;
    }
    .showcase-row-hit,
    .showcase-title a {
      cursor: none;
    }
    .preview-active .showcase-title {
      color: #a3a39e;
      transform: translateX(-8px);
    }
    .showcase-row:focus-within .showcase-title {
      color: #858580;
    }
  }
  @media (pointer: coarse), (hover: none) {
    :global(.project-hover-preview) {
      display: none;
    }
  }
  @media (max-width: 1000px) {
    .showcase-main {
      grid-template-columns: 20px minmax(0, 1fr) 155px 20px;
      gap: 16px;
    }
    .showcase-meta {
      font-size: 10px;
    }
  }
  @media (max-width: 760px) {
    .showcase-row {
      padding: 24px 0 30px;
    }
    .showcase-row-hit {
      display: none;
    }
    .showcase-main,
    .compact .showcase-main {
      grid-template-columns: 20px minmax(0, 1fr) 20px;
      min-height: 0;
      padding: 23px 0 0;
      gap: 12px;
    }
    .showcase-number {
      padding-top: 8px;
    }
    .showcase-title,
    .compact .showcase-title {
      font-size: 32px;
    }
    .showcase-copy p {
      font-size: 12px;
      margin-top: 13px;
    }
    .showcase-meta {
      grid-column: 2;
      font-size: 11px;
      gap: 9px;
    }
    .showcase-arrow {
      grid-column: 3;
      grid-row: 1;
      font-size: 24px;
    }
    :global(.project-hover-preview) {
      display: none;
    }
  }
</style>
