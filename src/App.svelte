<script lang="ts">
  import { onMount, tick } from 'svelte'
  import gsap from 'gsap'
  import Signature from './components/Signature.svelte'
  import KineticStage from './components/KineticStage.svelte'
  import ProjectCard from './components/ProjectCard.svelte'
  import ContactBlock from './components/ContactBlock.svelte'
  import { projects, featuredProjects } from './lib/projects'
  import { profile } from './lib/profile'
  import { magnetic, reveal, wordReveal } from './lib/motion'
  import { REPLAY_SIGNATURE } from './lib/motion-preference'
  let path = $state(location.pathname.replace(/\/$/, '') || '/')
  let filter = $state('All work')
  let menuOpen = $state(false)
  let transitionBusy = false
  let queuedNavigation: { next: string; push: boolean } | undefined
  let intro: HTMLDivElement,
    curtain: HTMLDivElement,
    menu: HTMLDialogElement,
    menuPanel: HTMLDivElement,
    menuTrigger: HTMLButtonElement
  let activeProject = $state<string | null>(null)
  let time = $state('')
  let introWord = $state('Kumusta.')
  let transitionTitle = $state('Explore.')
  let scrollRatio = $state(0)
  let entrance: gsap.core.Timeline | undefined
  function playIntro() {
    entrance?.kill()
    window.scrollTo({ top: 0, behavior: 'instant' })
    introWord = 'Kumusta.'
    gsap.set(intro, { display: 'flex', visibility: 'visible', yPercent: 0 })
    entrance = gsap
      .timeline({
        onComplete: () => {
          intro.style.visibility = 'hidden'
          void animatePage()
        },
      })
      .fromTo(
        '.intro-greeting',
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
      )
      .fromTo(
        '.intro-blue',
        { scaleX: 0 },
        { scaleX: 1, duration: 1.45, ease: 'power2.inOut' },
        0,
      )
    entrance
      .to('.intro-greeting', { y: -25, opacity: 0, duration: 0.22 }, 0.65)
      .call(
        () => {
          introWord = 'Let’s build.'
        },
        [],
        0.88,
      )
      .set('.intro-greeting', { y: 25 }, 0.88)
      .to('.intro-greeting', { y: 0, opacity: 1, duration: 0.35 }, 0.9)
    entrance
      .to(intro, { yPercent: -110, duration: 0.85, ease: 'power4.inOut' }, 1.35)
      .call(
        () => window.dispatchEvent(new CustomEvent(REPLAY_SIGNATURE)),
        [],
        1.45,
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
  async function animatePage() {
    await tick()
    gsap.killTweensOf('[data-enter]')
    gsap.fromTo(
      '[data-enter]',
      { y: 45, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.045,
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
        menu.close()
        menuOpen = false
        document.body.style.overflow = ''
      }
      transitionTitle =
        nav.find((item) => item.path === next)?.label ??
        projects.find((item) => `/work/${item.slug}` === next)?.title ??
        'Explore'
      gsap.set(curtain, { yPercent: 105, visibility: 'visible' })
      await gsap.to(curtain, {
        yPercent: 0,
        duration: 0.24,
        ease: 'power3.inOut',
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
      if (shared) {
        const target =
          document.querySelector<HTMLImageElement>('.detail-image img')
        if (target) {
          const to = target.getBoundingClientRect()
          gsap.to(curtain, {
            yPercent: -105,
            duration: 0.4,
            ease: 'power3.inOut',
          })
          await gsap.to(shared, {
            left: to.left,
            top: to.top,
            width: to.width,
            height: to.height,
            duration: 0.52,
            ease: 'power3.inOut',
          })
          void animatePage()
          await gsap.to(shared, { opacity: 0, duration: 0.1 })
        }
      }
      if (!shared) void animatePage()
      await gsap.to(curtain, {
        yPercent: -105,
        duration: shared ? 0 : 0.4,
        ease: 'power3.inOut',
      })
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
    menuOpen = true
    menu.showModal()
    document.body.style.overflow = 'hidden'
    gsap.fromTo(
      menuPanel,
      { xPercent: 105 },
      {
        xPercent: 0,
        duration: 0.4,
        ease: 'power3.out',
      },
    )
    gsap.killTweensOf('[data-enter]')
    gsap.fromTo(
      '.menu-link',
      { y: 35, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.06,
        duration: 0.5,
        delay: 0.13,
        clearProps: 'all',
      },
    )
  }
  async function closeMenu() {
    await gsap.to(menuPanel, {
      xPercent: 105,
      duration: 0.3,
      ease: 'power3.inOut',
    })
    menu.close()
    menuOpen = false
    document.body.style.overflow = ''
    menuTrigger?.focus()
  }
  function movePreview(event: PointerEvent) {
    const row = event.currentTarget as HTMLElement,
      rect = row.getBoundingClientRect()
    row.style.setProperty(
      '--preview-y',
      `${(event.clientY - rect.top - rect.height / 2) * 0.22}px`,
    )
    row.style.setProperty(
      '--preview-x',
      `${(event.clientX - rect.left - rect.width / 2) * 0.025}px`,
    )
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
    const onScroll = () => {
      scrollRatio =
        window.scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    playIntro()
    return () => {
      entrance?.kill()
      window.removeEventListener('scroll', onScroll)
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
<div
  class="reading-progress"
  style={`transform:scaleX(${scrollRatio})`}
  aria-hidden="true"
></div>
<div id="top" class:contact-page={path === '/contact'}>
  <header class="site-header">
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
      class="menu-trigger"
      onclick={openMenu}
      bind:this={menuTrigger}
      aria-label="Open navigation menu"
      aria-expanded={menuOpen}
      aria-controls="navigation-dialog"><span>Menu</span><i></i><i></i></button
    >
  </header>
  <main id="main" tabindex="-1">
    {#if path === '/'}
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
            I build thoughtful interfaces and the<br class="desktop-break" /> reliable
            systems behind them.
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
        <div class="hero-art"><Signature /></div>
        <div class="hero-bottom">
          <a href="#introduction" class="scroll-cue"
            ><span>SCROLL TO EXPLORE</span><i></i><span>↓</span></a
          ><span class="hero-location"
            >BASED IN BULACAN, PH <span class="clock">{time} PHT</span></span
          >
        </div>
      </section>
      <section class="introduction section-wrap" id="introduction">
        <div class="section-eyebrow" use:reveal>
          <span>A LITTLE ABOUT MY APPROACH</span><span>01 / INTRODUCTION</span>
        </div>
        <div class="intro-grid">
          <h2
            use:wordReveal
            aria-label="Good software starts with understanding."
          >
            Good software starts<br />with <em>understanding.</em>
          </h2>
          <div class="intro-body" use:reveal={0.1}>
            <p>
              From the first interaction to the logic behind the scenes, I care
              about how the pieces fit together.
            </p>
            <p class="muted">
              I’m Carl, a full-stack developer based in the Philippines. I turn
              ideas into considered web applications, with a particular love for
              backend development.
            </p>
            <a href="/about" class="round-link"
              ><span>More about me</span><span class="round-arrow" use:magnetic
                >↗</span
              ></a
            >
            <a href="#system" class="text-link system-link"
              >Explore the system <span>↓</span></a
            >
          </div>
        </div>
      </section>
      <div class="kinetic-marquee" aria-hidden="true">
        <div>
          {#each [0, 1, 2, 3] as repeat}<span
              >INTERFACES <i>✳</i> SYSTEMS <i>✳</i> EXPERIENCES <i>✳</i>
            </span>{/each}
        </div>
      </div>
      <KineticStage />
      <section class="selected-work section-wrap" id="selected-work">
        <div class="work-heading" use:reveal>
          <div>
            <div class="eyebrow">02 / SELECTED WORK</div>
            <h2>Built to <em>solve.</em></h2>
          </div>
          <a href="/work" class="text-link"
            >All work <sup>0{projects.length}</sup> <span>↗</span></a
          >
        </div>
        <div class="project-grid">
          {#each featuredProjects as project, index (project.slug)}<ProjectCard
              {project}
              {index}
            />{/each}
        </div>
      </section>
      <section class="capabilities section-wrap">
        <div class="section-eyebrow" use:reveal>
          <span>FROM THE SURFACE TO THE SYSTEM</span><span>03 / WHAT I DO</span>
        </div>
        <div class="capability-row" use:reveal>
          <span class="small-index">01</span>
          <h3>Interfaces that feel right.</h3>
          <p>
            Responsive, considered frontends that make complex things feel
            simple.
          </p>
          <span aria-hidden="true">↗</span>
        </div>
        <div class="capability-row" use:reveal>
          <span class="small-index">02</span>
          <h3>Systems that hold up.</h3>
          <p>
            APIs, databases, and application logic that connect the experience.
          </p>
          <span aria-hidden="true">↗</span>
        </div>
      </section>
      <ContactBlock />
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
          <span class="large-index">0{projects.length}</span>
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
        <div class="project-list">
          {#each visibleProjects as project (project.slug)}<article
              class:preview-active={activeProject === project.slug}
              class="project-row"
              onpointerenter={() => (activeProject = project.slug)}
              onpointerleave={() => (activeProject = null)}
              onpointermove={movePreview}
            >
              <div
                class="project-row-image"
                style={`--project-color:${project.color}`}
              >
                <a
                  href={`/work/${project.slug}`}
                  tabindex="-1"
                  aria-hidden="true"
                  ><img
                    src={project.image}
                    alt=""
                    loading="lazy"
                    width="900"
                    height="550"
                  /><span class="view-cursor">VIEW ↗</span></a
                >
              </div>
              <div class="project-row-main">
                <span class="small-index">0{project.order}</span>
                <div>
                  <h2>
                    <a href={`/work/${project.slug}`}
                      >{project.shortTitle ?? project.title}</a
                    >
                  </h2>
                  <p>{project.description}</p>
                  <div class="project-tech">
                    {project.technologies.join(' / ')}
                  </div>
                  <div class="project-row-links">
                    {#if project.demoStatus === 'offline'}<span
                        class="offline-label">Demo offline</span
                      >{/if}{#if project.demoUrl && project.demoStatus !== 'offline'}<a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer">Visit project ↗</a
                      >{/if}{#if project.repositoryUrl}<a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer">Source code ↗</a
                      >{/if}<a href={`/work/${project.slug}`} class="case-link"
                      >Project overview <span>↗</span></a
                    >
                  </div>
                </div>
                <span class="row-arrow" aria-hidden="true">↗</span>
              </div>
            </article>{/each}
        </div>
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
              src="/images/carl.png"
              alt="Carl James Roxas"
              width="420"
              height="520"
            /><span class="portrait-label">CARL JAMES ROXAS <span>↗</span></span
            ><span class="portrait-decoration" aria-hidden="true">CJ</span>
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
    onclick={closeMenu}
    aria-label="Close navigation"
  ></button>
  <div class="menu-panel" bind:this={menuPanel}>
    <div class="menu-top">
      <span class="eyebrow">TAKE A LOOK AROUND</span><button
        onclick={closeMenu}
        class="menu-close">Close <span>×</span></button
      >
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
