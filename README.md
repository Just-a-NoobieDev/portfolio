# Carl James Roxas — Portfolio

A Svelte 5 + Vite + TypeScript portfolio. GSAP handles entrances, navigation, scroll reveals, magnetic buttons, and project transitions. A shared Three.js experience carries one blue orb from a miniature coding studio along the drawn line into a bright, scroll-driven freelance process: understand, plan, build, and launch. A separate darker closing journey expands into a full-screen bridge and constellation before the contact invitation. No model file or remote rendering service is needed.

## Run locally

This project uses pnpm 10, pinned in `package.json`. Keep `pnpm-lock.yaml` committed when dependencies change.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. Other commands:

```sh
pnpm check     # Svelte, accessibility diagnostics, and TypeScript
pnpm test      # Scroll choreography, automatic motion, and continuation checks
pnpm build     # Production output, including direct route entrypoints
pnpm preview   # Preview the production build
pnpm format    # Format source files
```

The build output is `dist/`. The app can be hosted as a static site. A Vercel configuration and a Netlify/Cloudflare Pages redirect file are included. The build also writes route entrypoints for the four main pages and every project, so direct project links do not depend on a development server.

## Add a project

1. Put a screenshot in `public/images/`, preferably a compressed WebP or JPEG.
2. Add one entry in `src/lib/projects.ts`. TypeScript checks required fields and accepted statuses.
3. Run `pnpm check` and `pnpm build`, then deploy the updated `dist/` output.

```ts
{
  slug: 'my-new-project',
  title: 'My New Project',
  description: 'A short, factual description of what the project does.',
  category: 'Web application', // or 'Backend & APIs'
  role: 'Full-stack development',
  image: '/images/my-new-project.webp',
  imageAlt: 'A useful description of the screenshot',
  color: '#e4e6e9',
  technologies: ['Svelte', 'TypeScript'],
  demoUrl: 'https://your-real-project.example', // optional
  demoStatus: 'online', // use 'offline' to hide an unavailable demo link
  repositoryUrl: 'https://github.com/your-account/your-project', // optional
  featured: true, // appears on Home as well as Work
  order: 5, // lower values appear first
  caseStudy: { status: 'coming-soon' },
}
```

The Home gallery, Work gallery, category counts, overview page, and generated route update from this entry. Use a unique lowercase slug with hyphens; the build validates it and checks that the image exists. Missing optional links are hidden. `featured: false` keeps the project on Work only.

Project overviews contain screenshots and project links today. When a write-up is ready, the same shared layout can render it:

```ts
caseStudy: {
  status: 'published',
  sections: [
    { heading: 'The problem', body: 'Your verified project story.' },
    { heading: 'My contribution', body: 'What you personally built.' },
    { heading: 'Decisions and lessons', body: 'The implementation choices.' },
  ],
},
```

## Update personal details

- Name, email, location, résumé path, and professional links: `src/lib/profile.ts`.
- Personal biography and toolkit: the About section in `src/App.svelte`.
- Replace `public/Carl-James-Roxas-Resume.pdf` when your résumé changes.
- About uses the supplied color portrait at `public/images/carl-color.jpg`, without a grayscale filter.
- Colors, type, layout, and breakpoints: `src/app.css`.
- Geometry, materials, assembly, and pointer response: `src/lib/signature-scene.ts`.
- Reusable motion actions: `src/lib/motion.ts`.
- Freelance process scene and timing: `src/lib/process-scene.ts` and `src/lib/process-progress.ts`.
- Line composition and rendering: `src/components/ScrollThread.svelte` and `src/lib/thread-path.ts`.
- Closing bridge and camera choreography: `src/lib/connection-scene.ts`.
- Next-page order and scroll-intent rules: `src/lib/scroll-continuation.ts`.

All 13 projects from the old portfolio’s five archive pages are included on Work. Home keeps the two featured entries. The authentication entry’s old links pointed to the unrelated employee-record project, so those links are omitted until verified. The NestJS API retains its original placeholder artwork. Current content and assets come from the existing portfolio repository. Nabify and Smart Bottle Bin retain their old demo URLs in the data but are marked offline after DNS checks; turn them online only when the demos are restored. New projects and current professional details can be added without changing the shared layouts.

## Interaction behavior

- Every page load begins with “Kumusta.” followed by “Let’s build.” Returning visits use the same greeting.
- Destination-labeled route transitions start immediately and take about 1.55 seconds with gentler easing. Navigation clicks made during a transition are queued. The destination label glides in and out, and the page entrance overlaps the curtain reveal.
- The hero is an original code-modeled miniature of Carl at a laptop and second monitor (`src/lib/developer-desk.ts`). A seated character types subtly; one screen shows code and the other contains the actual shared orb mesh. Dragging rotates the entire desk with eased motion; left/right arrows rotate and Home resets. Vertical touch scrolling stays available. On scroll, that same preview orb emerges from the monitor and joins the measured line path. All geometry and screen textures are local, with no model downloads or additional dependencies.
- The process journey replaces the earlier “Under the interface” walkthrough. It starts framed, expands into a light blueprint world, resolves tangled questions into a plan, raises physical experience/logic/data modules, then scans and activates the completed system. There are no browser mockups in this scene. It unfolds over 620 viewport-height units on desktop and 580 on mobile. The same hero orb mesh follows the incoming line, continues along the stroke through Selected Work, and physically transfers to the closing renderer once its projected position and size match; the renderer is paused offscreen and disposed on navigation.
- One connected SVG path and one scroll controller carry the line from the naturally scrolling introduction through the process journey, selected work, and the framed closing opening. Measured arrival and departure lengths keep the same stroke sequential across the pinned process runway, so later fragments cannot appear early. Original flowing curves use measured SVG lengths; scrolling backward retracts the stroke. Images naturally cover the line where it passes behind them. The entry curve keeps descending into the preview and finishes there. The line and preview copy clear before the dark frame starts expanding; the contact footer has no decorative line.
- The original “possibility to connection” closing scene starts in a framed view, expands to fill the viewport, assembles a silver bridge, and carries a blue signal through a gateway into a constellation. Four chapters unfold over 650 viewport-height units on desktop (560 on mobile), with scroll smoothing and overlapping camera movement. It loads close to the section and pauses offscreen.
- A compact footer row with a scroll-progress bar continues the journey: Home → Work → About → Contact → Home. Once the document reaches its bottom, further wheel, touch, or keyboard input fills the small bar and uses the existing route curtain. It adds no full-screen section or extra scroll runway. Pausing, resizing, and restoring history cannot trigger navigation on their own. The destination title is also a normal link.
- A typographic marquee and scroll-linked project images connect the sections.
- Home and Work share `src/components/ProjectShowcase.svelte`: spacious project rows, a large cursor-following preview with a blue View circle, smooth vertical image changes, and a muted active title. The preview is portalled above the page so it can overlap rows. Keyboard focus exposes the same artwork; touch and small screens show linked images inline. Demo and source links stay independently clickable.
- A project image expands into its overview when its starting position is visible; other links use the route curtain.
- A native modal dialog traps menu focus, supports Escape, and restores focus on close. Its curved edge settles over 0.85 seconds, links enter with a short stagger, and closing eases over 0.65 seconds. The menu trigger uses the same magnetic pointer motion as the main buttons.
- Animations run automatically on every visit. There is no motion or replay toolbar; old saved choices do not disable animation. The device settings remain unchanged.
- Scenes use capped frame rates and device pixel ratios, pause offscreen/in background tabs, and release GPU resources on unmount. A CSS sculpture remains visible if WebGL fails.
- Browser history is preserved, and Back restores each page’s previous scroll position.

## Hosting

`.openai/hosting.json` stores the private Sites project identity and static output directory. It contains no credentials. Keep deployment credentials outside source control. You can deploy the same static build to your own Vercel project later.

The desktop header scrolls naturally. An IntersectionObserver reveals the fixed circular menu only after that header leaves the viewport; mobile keeps its header menu for access at the top. The fixed button scales in, has a directional blue liquid hover fill and magnetic movement, and hands off to a matching blue close button. The drawer unfolds with an animated SVG leading edge and staggered horizontal link entrances, then reverses on close. The native dialog traps focus, supports Escape and outside clicks, and returns focus without changing scroll position. The custom page scrollbar hides while the dialog locks page scrolling.

The native browser scrollbar and old top reading-progress line are replaced by `src/components/PageScrollbar.svelte`: a short, inset vertical rail with a rounded thumb, blend-mode contrast on light/dark scenes, pointer dragging, track clicks, and keyboard controls. It reflects actual document scroll, recalculates after route/filter/viewport changes, and leaves wheel/touch page scrolling native. Dragging the rail does not count as intent to continue to the next page.

The process opening uses an original scroll-driven liquid reveal (`FluidReveal.svelte` / `fluid-reveal.ts`). The incoming line remains visible until the wave begins; a blue contour spreads ahead of the scene, whose actual WebGL canvas is clipped by a matching curved mask. The left edge swells across the page before the mask covers the viewport. Both the wave and reveal are deterministic and reverse on upward scroll; no video or external transition assets are used.
