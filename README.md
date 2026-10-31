# Carl James Roxas — Portfolio

A Svelte 5 + Vite + TypeScript portfolio. GSAP handles entrances, navigation, scroll reveals, magnetic buttons, and project transitions. A dynamically imported Three.js scene builds the CJ signature from geometry; no 3D model file or remote rendering service is needed.

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Other commands:

```sh
npm run check       # Svelte, accessibility diagnostics, and TypeScript
npm test            # Motion-preference regression checks
npm run build       # Production output, including direct route entrypoints
npm run preview     # Preview the production build
npm run format      # Format source files
```

The build output is `dist/`. The app can be hosted as a static site. A Vercel configuration and a Netlify/Cloudflare Pages redirect file are included. The build also writes route entrypoints for the four main pages and every project, so direct project links do not depend on a development server.

## Add a project

1. Put a screenshot in `public/images/`, preferably a compressed WebP or JPEG.
2. Add one entry in `src/lib/projects.ts`. TypeScript checks required fields and accepted statuses.
3. Run `npm run check` and `npm run build`, then deploy the updated `dist/` output.

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
- Colors, type, layout, and breakpoints: `src/app.css`.
- Geometry, materials, assembly, and pointer response: `src/lib/signature-scene.ts`.
- Reusable motion actions: `src/lib/motion.ts`.

Current content and assets come from the existing portfolio repository. Nabify and Smart Bottle Bin retain their old demo URLs in the data but are marked offline after DNS checks; turn them online only when the demos are restored. New projects and current professional details can be added without changing the shared layouts.

## Interaction behavior

- A replayable first-visit greeting, two-stage text entrance, and destination-labeled curved route transitions; return visits have a shorter entrance.
- A dedicated sticky 3D walkthrough separates and reconnects the CJ assembly as visitors scroll. Orbital elements, pointer drag, and an optional turntable make the geometry explorable.
- Word-by-word scroll reveals, a typographic marquee, and scroll-linked project images connect the sections.
- Project previews respond to desktop pointers and remain visible on touch devices.
- A project image expands into its overview when its starting position is visible; other links use the route curtain.
- A native modal dialog traps menu focus, supports Escape, and restores focus on close.
- The visible motion control defaults to the operating-system preference. Visitors can explicitly enable full animation or switch back to reduced motion; the choice is saved on this site. This never changes the device setting. The Replay control repeats the intro. All motion actions and 3D scenes reconfigure when the choice changes.
- Reduced motion stops movement and keeps a still rendered signature; the 3D walkthrough becomes a shorter, unpinned composition.
- In full-motion mode the scene animates at a capped frame rate, pauses offscreen/in background tabs, and releases GPU resources on unmount. A typographic still remains available if WebGL fails.
- Browser history is preserved, and Back restores each page’s previous scroll position.

## Hosting

`.openai/hosting.json` stores the private Sites project identity and static output directory. It contains no credentials. Keep deployment credentials outside source control. You can deploy the same static build to your own Vercel project later.
