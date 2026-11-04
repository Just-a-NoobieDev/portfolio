<script lang="ts">
  import { onMount, tick } from 'svelte'
  import gsap from 'gsap'
  import Signature from './components/Signature.svelte'
  import SignalTrace from './components/SignalTrace.svelte'
  import ScrollThread from './components/ScrollThread.svelte'
  import ConnectionJourney from './components/ConnectionJourney.svelte'
  import ProcessJourney from './components/ProcessJourney.svelte'
  import ProcessExperience from './components/ProcessExperience.svelte'
  import NextChapter from './components/NextChapter.svelte'
  import PageScrollbar from './components/PageScrollbar.svelte'
  import ProjectShowcase from './components/ProjectShowcase.svelte'
  import ContactBlock from './components/ContactBlock.svelte'
  import { projects, featuredProjects } from './lib/projects'
  import { profile } from './lib/profile'
  import { liquidButton, magnetic, reveal } from './lib/motion'
  import { REPLAY_SIGNATURE } from './lib/motion-preference'
  let path = $state(location.pathname.replace(/\/$/, '') || '/')
  let filter = $state('All work')
  let menuOpen = $state(false)
  let headerOutOfView = $state(false)
  let siteHeader: HTMLElement
  let returnMenuFocus: HTMLElement | null = null
  let menuClosing = false
  let transitionBusy = $state(false)
  let queuedNavigation: { next: string; push: boolean } | undefined
  let intro: HTMLDivElement,
    curtain: HTMLDivElement,
    menu: HTMLDialogElement,
    menuPanel: HTMLDivElement,
    menuTrigger: HTMLButtonElement
  let time = $state('')
  let introWord = $state('Kumusta.')
  let transitionTitle = $state('Explore.')
  let entrance: gsap.core.Timeline | undefined
  let menuMotion: gsap.core.Timeline | undefined
  function playIntro() {
    entrance?.kill()
    window.scrollTo({ top: 0, behavior: 'instant' })
    introWord = 'Kumusta.'
    gsap.set(intro, { display: 'flex', visibility: 'visible', yPercent: 0 })
    gsap.set('[data-enter]', { y: 56, opacity: 0 })
    entrance = gsap
      .timeline({
        onComplete: () => {
          intro.style.visibility = 'hidden'
        },
      })
      .fromTo(
        '.intro-greeting',
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
      )
      .fromTo(
        '.intro-blue',
        { scaleX: 0 },
        { scaleX: 1, duration: 2.7, ease: 'power2.inOut' },
        0,
      )
    entrance
      .to('.intro-greeting', { y: -25, opacity: 0, duration: 0.35 }, 1.3)
      .call(
        () => {
          introWord = 'Let’s build.'
        },
        [],
        1.67,
      )
      .set('.intro-greeting', { y: 25 }, 1.67)
      .to('.intro-greeting', { y: 0, opacity: 1, duration: 0.6 }, 1.7)
    entrance
      .to(intro, { yPercent: -110, duration: 1.25, ease: 'power2.inOut' }, 2.65)
      .call(() => void animatePage(0.24), [], 2.65)
      .call(
        () => window.dispatchEvent(new CustomEvent(REPLAY_SIGNATURE)),
        [],
        2.8,
      )
  }
  const scrollPositions = new Map<string, number>()
  const nav = [
    { path: '/', label: 'Home' },
    { path: '/work', label: 'Work' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]
  const pageName = $derived(
    nav.find((item) => item.path === path)?.label ??
      projects.find((p) => `/work/${p.slug}` === path)?.title ??
      'Page not found',
  )
  const currentProject = $derived(
    projects.find((project) => `/work/${project.slug}` === path),
  )
  const visibleProjects = $derived(
    projects.filter(
      (project) => filter === 'All work' || project.category === filter,
    ),
  )
  async function animatePage(delay = 0) {
    await tick()
    gsap.killTweensOf('[data-enter]')
    gsap.fromTo(
      '[data-enter]',
      { y: 56, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.065,
        delay,
        ease: 'power3.out',
        clearProps: 'all',
      },
    )
  }
  async function navigate(
    next: string,
    push = true,
    source?: HTMLImageElement,
  ) {
    next = next.replace(/\/$/, '') || '/'
    if (transitionBusy) {
      queuedNavigation = { next, push }
      return
    }
    if (next === path) {
      if (menuOpen) await closeMenu()
      return
    }
    transitionBusy = true
    const restoreScroll =
      !push || (next === '/work' && path.startsWith('/work/'))
    scrollPositions.set(path, window.scrollY)
    let shared: HTMLDivElement | undefined
    try {
      if (source && next.startsWith('/work/')) {
        const from = source.getBoundingClientRect()
        if (from.width > 0 && from.bottom > 0 && from.top < innerHeight) {
          shared = document.createElement('div')
          shared.className = 'shared-preview'
          const image = source.cloneNode(true) as HTMLImageElement
          image.removeAttribute('loading')
          image.style.cssText =
            'width:100%;height:100%;object-fit:contain;display:block'
          shared.appendChild(image)
          Object.assign(shared.style, {
            left: `${from.left}px`,
            top: `${from.top}px`,
            width: `${from.width}px`,
            height: `${from.height}px`,
          })
          document.body.appendChild(shared)
        }
      }
      if (menuOpen) {
        menuMotion?.kill()
        menu.close()
        menuOpen = false
        document.body.style.overflow = ''
      }
      transitionTitle =
        nav.find((item) => item.path === next)?.label ??
        projects.find((item) => `/work/${item.slug}` === next)?.title ??
        'Explore'
      // Own the entire transform: a CSS translateY would otherwise survive
      // as a pixel offset and keep the covering curtain below the viewport.
      gsap.set(curtain, { x: 0, y: 0, yPercent: 105, visibility: 'visible' })
      gsap.fromTo(
        '.curtain-name',
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          delay: 0.18,
          ease: 'power2.out',
        },
      )
      await gsap.to(curtain, {
        yPercent: 0,
        duration: 0.65,
        ease: 'power2.inOut',
      })
      if (push) history.pushState({}, '', next)
      path = next
      await tick()
      window.scrollTo({
        top: restoreScroll ? (scrollPositions.get(next) ?? 0) : 0,
        behavior: 'instant',
      })
      document
        .querySelector<HTMLElement>('#page-title')
        ?.focus({ preventScroll: true })
      // Start the content underneath the exiting curtain, with enough overlap
      // for the heading to still be moving when it is actually revealed.
      void animatePage(0.24)
      gsap.to('.curtain-name', {
        y: -45,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      })
      const revealCurtain = gsap.to(curtain, {
        yPercent: -105,
        duration: 0.9,
        ease: 'power2.inOut',
      })
      const target = shared
        ? document.querySelector<HTMLImageElement>('.detail-image img')
        : null
      if (shared && target) {
        const to = target.getBoundingClientRect()
        await Promise.all([
          revealCurtain,
          gsap.to(shared, {
            left: to.left,
            top: to.top,
            width: to.width,
            height: to.height,
            duration: 1.05,
            ease: 'power2.inOut',
          }),
        ])
        await gsap.to(shared, { opacity: 0, duration: 0.18 })
      } else {
        shared?.remove()
        await revealCurtain
      }
      gsap.set(curtain, { visibility: 'hidden' })
    } finally {
      shared?.remove()
      transitionBusy = false
      if (queuedNavigation) {
        const pending = queuedNavigation
        queuedNavigation = undefined
        void navigate(pending.next, pending.push)
      }
    }
  }
  async function openMenu() {
    if (menu.open) return
    menuMotion?.kill()
    menuClosing = false
    returnMenuFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : menuTrigger
    menuOpen = true
    menu.showModal()
    menu
      .querySelector<HTMLButtonElement>('.menu-close')
      ?.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'
    menuMotion = gsap
      .timeline()
      .fromTo(
        '.menu-backdrop',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        0,
      )
      .fromTo(
        menuPanel,
        {
          xPercent: 125,
        },
        {
          xPercent: 0,
          duration: 1.05,
          ease: 'power4.inOut',
        },
        0,
      )
      .fromTo(
        '.menu-edge path',
        { attr: { d: 'M100 0 C-35 20 -35 80 100 100 Z' } },
        {
          attr: { d: 'M100 0 C100 20 100 80 100 100 Z' },
          duration: 1.15,
          ease: 'power3.inOut',
        },
        0,
      )
      .fromTo(
        '.menu-close',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' },
        0.2,
      )
      .fromTo(
        '.menu-link',
        { x: 95, y: 0, opacity: 0 },
        {
          x: 0,
          y: 0,
          opacity: 1,
          stagger: 0.065,
          duration: 0.85,
          ease: 'power3.out',
        },
        0.28,
      )
      .fromTo(
        '.menu-bottom',
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
        0.35,
      )
  }
  async function closeMenu(restoreFocus = true) {
    if (!menu.open || menuClosing) return
    menuClosing = true
    menuMotion?.kill()
    menuMotion = gsap
      .timeline()
      .to(
        '.menu-link',
        {
          x: 55,
          opacity: 0,
          stagger: 0.025,
          duration: 0.4,
          ease: 'power2.in',
        },
        0,
      )
      .to(
        menuPanel,
        {
          xPercent: 125,
          duration: 0.85,
          ease: 'power3.inOut',
        },
        0.04,
      )
      .to(
        '.menu-edge path',
        {
          attr: { d: 'M100 0 C-35 20 -35 80 100 100 Z' },
          duration: 0.8,
          ease: 'power3.inOut',
        },
        0,
      )
      .to(
        '.menu-backdrop',
        { opacity: 0, duration: 0.7, ease: 'power2.inOut' },
        0.12,
      )
    await menuMotion
    menu.close()
    menuOpen = false
    document.body.style.overflow = ''
    menuClosing = false
    if (restoreFocus) {
      await tick()
      returnMenuFocus?.focus({ preventScroll: true })
    }
  }
  onMount(() => {
    const updateTime = () =>
      (time = new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Manila',
      }).format(new Date()))
    updateTime()
    const previousRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const interval = setInterval(updateTime, 60000)
    const intercept = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        'a[href]',
      )
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        anchor.target === '_blank' ||
        anchor.origin !== location.origin ||
        anchor.hash ||
        /\.[a-z0-9]+$/i.test(anchor.pathname)
      )
        return
      const source =
        anchor.querySelector<HTMLImageElement>('img') ??
        anchor.closest('article')?.querySelector<HTMLImageElement>('img') ??
        undefined
      event.preventDefault()
      void navigate(anchor.pathname, true, source)
    }
    const pop = () => void navigate(location.pathname, false)
    document.addEventListener('click', intercept)
    window.addEventListener('popstate', pop)
    const headerObserver = new IntersectionObserver(([entry]) => {
      headerOutOfView =
        !entry?.isIntersecting && siteHeader.getBoundingClientRect().bottom <= 0
    })
    headerObserver.observe(siteHeader)
    playIntro()
    return () => {
      entrance?.kill()
      menuMotion?.kill()
      headerObserver.disconnect()
      history.scrollRestoration = previousRestoration
      clearInterval(interval)
      document.removeEventListener('click', intercept)
      window.removeEventListener('popstate', pop)
      document.body.style.overflow = ''
    }
  })
</script>

<svelte:head>
  <title
    >{path === '/'
      ? 'Carl James Roxas — Full-stack Developer'
      : `${pageName} — Carl James Roxas`}</title
  >
  <meta
    name="description"
    content={currentProject?.description ??
      'Carl James Roxas is a full-stack developer based in the Philippines. Explore selected web applications, APIs, and thoughtful digital experiences.'}
  />
  <meta
    name="theme-color"
    content={path === '/contact' ? '#1b1c1e' : '#f4f3ee'}
  />
</svelte:head>
<a href="#main" class="skip-link">Skip to content</a>
<div class="intro" bind:this={intro} aria-hidden="true">
  <span class="intro-mark">CJ</span><span class="intro-greeting"
    >{introWord}</span
  >
  <span class="intro-name"
    >CARL JAMES ROXAS / THOUGHTFUL CODE. REMARKABLE EXPERIENCES.</span
  >
  <div class="intro-blue"></div>
</div>
<div class="page-curtain" bind:this={curtain} aria-hidden="true">
  <span class="curtain-name"
    >{transitionTitle}<span class="blue-dot">.</span></span
  >
</div>
<PageScrollbar hidden={menuOpen || transitionBusy} />
<div id="top" class:contact-page={path === '/contact'}>
  <header class="site-header" bind:this={siteHeader}>
    <a href="/" class="brand" aria-label="Carl James Roxas — Home"
      ><span class="brand-mark">CJ</span><span>Carl James Roxas</span></a
    >
    <nav aria-label="Main navigation" class="desktop-nav">
      <a
        href="/work"
        aria-current={path.startsWith('/work') ? 'page' : undefined}
        ><span class="rolling"
          ><span>Work</span><span aria-hidden="true">Work</span></span
        ><span class="nav-dot"></span></a
      ><a href="/about" aria-current={path === '/about' ? 'page' : undefined}
        ><span class="rolling"
          ><span>About</span><span aria-hidden="true">About</span></span
        ><span class="nav-dot"></span></a
      ><a href="/contact" use:magnetic class="nav-contact"
        >Let’s talk <span>↗</span></a
      >
    </nav>
    <button
      class="menu-trigger header-menu-trigger"
      use:magnetic
      onclick={openMenu}
      bind:this={menuTrigger}
      aria-label="Open navigation menu"
      aria-expanded={menuOpen}
      aria-controls="navigation-dialog"><span>Menu</span><i></i><i></i></button
    >
  </header>
  <div
    class="floating-menu"
    class:visible={headerOutOfView && !menuOpen}
    inert={!headerOutOfView || menuOpen}
    aria-hidden={!headerOutOfView || menuOpen}
  >
    <button
      class="menu-trigger floating-menu-trigger"
      use:magnetic
      use:liquidButton
      onclick={openMenu}
      aria-label="Open navigation menu"
      aria-expanded={menuOpen}
      aria-controls="navigation-dialog"
    >
      <span class="button-fill" aria-hidden="true"></span><span
        class="menu-glyph"
        aria-hidden="true"><i></i><i></i></span
      >
    </button>
  </div>
  <main id="main" tabindex="-1">
    {#if path === '/'}
      <div class="home-experience">
        <div class="hero-runway">
          <section class="hero">
            <div class="hero-copy">
              <div class="eyebrow" data-enter>
                <span class="status-dot"></span> FULL-STACK DEVELOPER / PHILIPPINES
              </div>
              <h1 id="page-title" tabindex="-1">
                <span data-enter>Thoughtful code.</span><span data-enter
                  >Remarkable</span
                ><span class="blue-text" data-enter>experiences.</span>
              </h1>
              <p class="hero-description" data-enter>
                I build thoughtful interfaces and the<br
                  class="desktop-break"
                /> reliable systems behind them.
              </p>
              <div class="hero-actions" data-enter>
                <a href="/work" class="button primary" use:magnetic
                  >Explore my work <span>↗</span></a
                ><a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  class="text-link">Résumé <span>↗</span></a
                >
              </div>
            </div>
            <div
              class="hero-art"
              data-process-orb
              role="slider"
              aria-orientation="horizontal"
              aria-valuemin="9"
              aria-valuemax="43"
              aria-valuenow="20"
              tabindex="0"
              aria-label="Interactive 3D miniature of Carl coding at a laptop and second monitor. Drag or use left and right arrows to rotate. Home resets the view."
            >
              <div class="process-hero-fallback" aria-hidden="true"></div>
            </div>
            <div class="hero-bottom">
              <a href="#introduction" class="scroll-cue"
                ><span>SCROLL TO EXPLORE</span><i></i><span>↓</span></a
              ><span class="hero-location"
                >BASED IN BULACAN, PH <span class="clock">{time} PHT</span
                ></span
              >
            </div>
          </section>
        </div>
        <div class="page-line-flow">
          <ScrollThread variant="page" />
          <SignalTrace />
          <ProcessJourney />
          <div class="work-thread">
            <div class="kinetic-marquee" aria-hidden="true">
              <div>
                {#each [0, 1, 2, 3] as repeat}<span
                    >INTERFACES <i>✳</i> SYSTEMS <i>✳</i> EXPERIENCES <i>✳</i>
                  </span>{/each}
              </div>
            </div>
            <section class="selected-work section-wrap" id="selected-work">
              <div class="work-heading" use:reveal>
                <div>
                  <div class="eyebrow">03 / SELECTED WORK</div>
                  <h2>Built to <em>solve.</em></h2>
                </div>
                <a href="/work" class="text-link"
                  >All work <sup>{String(projects.length).padStart(2, '0')}</sup
                  >
                  <span>↗</span></a
                >
              </div>
              <ProjectShowcase items={featuredProjects} compact />
            </section>
            <div class="journey-link section-wrap">
              <a href="#connection" class="text-link"
                >Follow the signal <span>↓</span></a
              >
            </div>
          </div>
          <ConnectionJourney />
        </div>
        <ProcessExperience />
      </div>
      <ContactBlock connected />
    {:else if path === '/work'}
      <section class="page-intro section-wrap">
        <div class="eyebrow" data-enter>01 / SELECTED WORK & EXPLORATIONS</div>
        <h1 id="page-title" tabindex="-1" data-enter>
          Ideas made<br /><em>into something.</em>
        </h1>
        <div class="page-intro-bottom" data-enter>
          <p>
            A selection of applications, platforms, and experiments.<br
            />Different problems. The same attention to detail.
          </p>
          <span class="large-index"
            >{String(projects.length).padStart(2, '0')}</span
          >
        </div>
      </section>
      <section class="work-archive section-wrap" aria-label="Project showcase">
        <div class="filter-row" data-enter>
          <div class="filters" aria-label="Filter projects">
            {#each ['All work', 'Web application', 'Backend & APIs'] as category}<button
                class:active={filter === category}
                aria-pressed={filter === category}
                onclick={() => (filter = category)}
                >{category}<sup
                  >{category === 'All work'
                    ? projects.length
                    : projects.filter((p) => p.category === category)
                        .length}</sup
                ></button
              >{/each}
          </div>
          <span class="archive-hint">A FEW THINGS I’VE BUILT ↙</span>
        </div>
        <ProjectShowcase items={visibleProjects} />
        <p class="archive-note" aria-live="polite">
          Showing {visibleProjects.length}
          {visibleProjects.length === 1 ? 'project' : 'projects'}. A few more
          ideas are always in the works.
        </p>
      </section>
      <ContactBlock />
    {:else if path === '/about'}
      <section class="about-intro section-wrap">
        <div class="eyebrow" data-enter>02 / A LITTLE MORE HUMAN</div>
        <div class="about-heading">
          <h1 id="page-title" tabindex="-1" data-enter>
            Behind<br /><em>the code.</em>
          </h1>
          <span class="about-stamp" data-enter
            >DEVELOPER.<br />CURIOUS BY DEFAULT.<br />BASED IN THE PHILIPPINES.</span
          >
        </div>
        <div class="about-grid">
          <div class="portrait-wrap" data-enter>
            <img
              src="/images/carl-color.jpg"
              alt="Carl James Roxas"
              width="1600"
              height="1600"
            /><span class="portrait-label">CARL JAMES ROXAS <span>↗</span></span
            >
          </div>
          <div class="about-copy" data-enter>
            <h2>A developer who cares<br />how it all <em>connects.</em></h2>
            <p>
              I’m Carl James Roxas, a full-stack developer from Bulacan,
              Philippines. I enjoy taking an idea from its first sketch through
              to a working application.
            </p>
            <p class="muted">
              My particular focus is backend development: the APIs, databases,
              and business logic that make a product work. I also enjoy building
              the interface that brings those systems to people.
            </p>
            <p class="muted">
              I graduated with a Bachelor of Science in Information Technology,
              majoring in Web and Mobile App Development. Building, exploring,
              and learning stay at the center of how I work.
            </p>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              class="button primary"
              use:magnetic>View my résumé <span>↗</span></a
            >
          </div>
        </div>
      </section>
      <section class="toolkit section-wrap">
        <div class="section-eyebrow" use:reveal>
          <span>THE TOOLS CHANGE. THE CURIOSITY STAYS.</span><span
            >MY TOOLKIT</span
          >
        </div>
        <h2 use:reveal>Across the <em>stack.</em></h2>
        <div class="toolkit-grid">
          <div use:reveal>
            <span class="small-index">01 / INTERFACES</span>
            <h3>What people use.</h3>
            <p>TypeScript · React · Next.js<br />Svelte · Tailwind CSS</p>
          </div>
          <div use:reveal={0.06}>
            <span class="small-index">02 / SYSTEMS</span>
            <h3>What makes it work.</h3>
            <p>Node.js · NestJS · Express · Go<br />REST APIs · GraphQL</p>
          </div>
          <div use:reveal={0.12}>
            <span class="small-index">03 / FOUNDATIONS</span>
            <h3>What connects it.</h3>
            <p>PostgreSQL · MongoDB · Supabase<br />Git · Docker</p>
          </div>
        </div>
      </section>
      <ContactBlock />
    {:else if path === '/contact'}
      <ContactBlock full />
    {:else if currentProject}
      <section class="project-detail section-wrap">
        <a href="/work" class="text-link back-work" data-enter>← Back to work</a
        >
        <div class="detail-top" data-enter>
          <div class="eyebrow">WORK / PROJECT OVERVIEW</div>
          <span class="detail-status"
            ><span class="status-dot"></span>{currentProject.caseStudy
              .status === 'published'
              ? 'CASE STUDY'
              : 'CASE STUDY COMING SOON'}</span
          >
        </div>
        <h1 id="page-title" tabindex="-1" data-enter>
          {currentProject.title}<span class="blue-text">.</span>
        </h1>
        <p class="detail-description" data-enter>
          {currentProject.description}
        </p>
        <div class="detail-meta" data-enter>
          <div>
            <span class="eyebrow">MY ROLE</span>
            <p>{currentProject.role}</p>
          </div>
          <div>
            <span class="eyebrow">BUILT WITH</span>
            <p>{currentProject.technologies.join(' · ')}</p>
          </div>
          <div class="detail-actions">
            {#if currentProject.demoStatus === 'offline'}<span
                class="offline-label">Demo currently offline</span
              >{/if}{#if currentProject.demoUrl && currentProject.demoStatus !== 'offline'}<a
                href={currentProject.demoUrl}
                target="_blank"
                rel="noreferrer"
                class="button primary">Visit project <span>↗</span></a
              >{/if}{#if currentProject.repositoryUrl}<a
                href={currentProject.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                class="text-link">Source code ↗</a
              >{/if}
          </div>
        </div>
        <div
          class="detail-image"
          style={`--project-color:${currentProject.color}`}
          data-enter
        >
          <img
            src={currentProject.image}
            alt={currentProject.imageAlt}
            width="1400"
            height="900"
          />
        </div>
        {#if currentProject.caseStudy.status === 'published'}{#each currentProject.caseStudy.sections ?? [] as section}<section
              class="case-section"
              use:reveal
            >
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>{/each}{:else}<div class="coming-soon" use:reveal>
            <span class="eyebrow">A CLOSER LOOK, SOON.</span>
            <h2>The work is here.<br /><em>The story is on its way.</em></h2>
            <p>
              I’m putting together the decisions, details, and lessons behind
              this project. For now, the overview and screenshots give a first
              look at the work.
            </p>
            <a href="/work" class="text-link"
              >Explore more work <span>↗</span></a
            >
          </div>{/if}
      </section>
      <ContactBlock />
    {:else}
      <section class="not-found section-wrap">
        <span class="eyebrow" data-enter>404 / A SMALL DETOUR</span>
        <h1 id="page-title" tabindex="-1" data-enter>
          Nothing here.<br /><em>Plenty elsewhere.</em>
        </h1>
        <a href="/" class="button primary">Back to home ↗</a>
      </section>
      <ContactBlock />
    {/if}
    {#key path}<NextChapter
        {path}
        oncontinue={(href) => void navigate(href)}
      />{/key}
  </main>
</div>
<dialog
  id="navigation-dialog"
  class="navigation-dialog"
  bind:this={menu}
  oncancel={(event) => {
    event.preventDefault()
    void closeMenu()
  }}
  aria-label="Site navigation"
>
  <button
    class="menu-backdrop"
    onclick={() => void closeMenu()}
    tabindex="-1"
    aria-label="Close navigation"
  ></button>
  <button
    onclick={() => void closeMenu()}
    use:magnetic
    use:liquidButton
    aria-label="Close navigation menu"
    class="menu-close"
    ><span class="button-fill" aria-hidden="true"></span><span
      class="menu-glyph"
      aria-hidden="true"><i></i><i></i></span
    ></button
  >
  <div class="menu-panel" bind:this={menuPanel}>
    <svg
      class="menu-edge"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"><path d="M100 0 C100 20 100 80 100 100 Z" /></svg
    >
    <div class="menu-top">
      <span class="eyebrow">TAKE A LOOK AROUND</span>
    </div>
    <nav aria-label="Expanded navigation">
      {#each nav as item, index}<a
          class:current={path === item.path ||
            (item.path === '/work' && path.startsWith('/work/'))}
          href={item.path}
          class="menu-link"
          ><span>{item.label}</span><span class="menu-number">0{index + 1}</span
          ></a
        >{/each}
    </nav>
    <div class="menu-bottom">
      <span>ELSEWHERE</span>
      <div>
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer">LinkedIn ↗</a
        >
      </div>
    </div>
  </div>
</dialog>
