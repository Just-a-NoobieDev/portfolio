import { readFile, mkdir, writeFile } from 'node:fs/promises'
import ts from 'typescript'
// Static route entrypoints preserve direct links on hosts without SPA rewrites.
const source = await readFile('src/lib/projects.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText
const { projects } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)
const slugs = projects.map((project) => project.slug)
if (
  new Set(slugs).size !== slugs.length ||
  slugs.some((slug) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
) {
  throw new Error(
    'Project slugs must be unique and use lowercase words separated by hyphens.',
  )
}
for (const project of projects) await readFile(`public${project.image}`)
const html = await readFile('dist/index.html', 'utf8')
for (const route of [
  'work',
  'about',
  'contact',
  ...slugs.map((slug) => `work/${slug}`),
]) {
  await mkdir(`dist/${route}`, { recursive: true })
  await writeFile(`dist/${route}/index.html`, html)
}
await writeFile('dist/404.html', html)
