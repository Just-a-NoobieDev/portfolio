# Carl James Roxas — Portfolio

A Svelte 5 + Vite + TypeScript portfolio. GSAP handles entrances, navigation, scroll reveals, magnetic buttons, and project transitions. A dynamically imported Three.js scene builds a twisting chrome ribbon around an electric blue core. Its scroll story opens the sculpture, reveals real project interfaces, and animates connections before reforming it. No model file or remote rendering service is needed.

## Run locally

This project uses pnpm 10, pinned in `package.json`. Keep `pnpm-lock.yaml` committed when dependencies change.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. Other commands:

```sh
pnpm check     # Svelte, accessibility diagnostics, and TypeScript
pnpm test      # Scroll choreography and automatic-motion regression checks
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

The Home gallery, Work gallery, category counts, overview page, and generated route update from this entry. The first three projects by `order` also supply the floating screenshots in the 3D scroll scene. Use a unique lowercase slug with hyphens; the build validates it and checks that the image exists. Missing optional links are hidden. `featured: false` keeps the project on Work only.

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
- Colors, type, layout, and breakpoints: `src/app.css`.
- Geometry, materials, assembly, and pointer response: `src/lib/signature-scene.ts`.
- Reusable motion actions: `src/lib/motion.ts`.

Current content and assets come from the existing portfolio repository. Nabify and Smart Bottle Bin retain their old demo URLs in the data but are marked offline after DNS checks; turn them online only when the demos are restored. New projects and current professional details can be added without changing the shared layouts.

## Interaction behavior

- Every page load begins with “Kumusta.” followed by “Let’s build.” Returning visits use the same greeting.
- Destination-labeled route transitions start immediately, take about 0.64 seconds, and retain a queued navigation click. Page content enters while the curtain exits.
- A twisting chrome ribbon and blue core replace the initial-based sculpture. The object moves automatically and responds to pointer movement and desktop dragging, without instructional UI or rotation buttons.
- “Under the interface” has four reversible scroll chapters across four viewport heights: a closed ribbon, opened geometry with real project interface panels, a particle constellation with flowing connections, and a reassembled sculpture. The camera and materials change with scroll position.
- Word-by-word scroll reveals, a typographic marquee, and scroll-linked project images connect the sections.
- Project previews respond to desktop pointers and remain visible on touch devices.
- A project image expands into its overview when its starting position is visible; other links use the route curtain.
- A native modal dialog traps menu focus, supports Escape, and restores focus on close.
- Animations run automatically on every visit. There is no motion or replay toolbar; old saved choices do not disable animation. The device settings remain unchanged.
- Scenes use capped frame rates and device pixel ratios, pause offscreen/in background tabs, and release GPU resources on unmount. A CSS sculpture remains visible if WebGL fails.
- Browser history is preserved, and Back restores each page’s previous scroll position.

## Hosting

`.openai/hosting.json` stores the private Sites project identity and static output directory. It contains no credentials. Keep deployment credentials outside source control. You can deploy the same static build to your own Vercel project later.
