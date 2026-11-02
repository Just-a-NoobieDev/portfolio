import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(
  new URL('../src/lib/scroll-continuation.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { ScrollContinuation, nextChapter } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

test('scrolling through the page cannot fill the footer bar', () => {
  const c = new ScrollContinuation()
  assert.equal(c.feed(2000, false), false)
  assert.equal(c.progress, 0)
})
test('continued input at the document end fills the bar and navigates once', () => {
  const c = new ScrollContinuation()
  assert.equal(c.feed(200, true), false)
  assert.equal(c.progress, 1 / 3)
  assert.equal(c.feed(200, true), false)
  assert.equal(c.feed(200, true), true)
  assert.equal(c.progress, 1)
  assert.equal(c.feed(200, true), false)
})
test('scrolling back drains the bar and leaving the footer clears it', () => {
  const c = new ScrollContinuation()
  c.feed(300, true)
  c.feed(-120, true)
  assert.equal(c.progress, 0.3)
  c.feed(-200, false)
  assert.equal(c.progress, 0)
})
test('resetting after resize or restoration cannot trigger a page change', () => {
  const c = new ScrollContinuation()
  c.feed(550, true)
  c.reset()
  assert.equal(c.progress, 0)
  assert.equal(c.feed(50, true), false)
})
test('the four main chapters form a complete route sequence', () => {
  assert.deepEqual(
    ['/', '/work', '/about', '/contact'].map((path) => nextChapter(path).href),
    ['/work', '/about', '/contact', '/'],
  )
  assert.equal(nextChapter('/work/nabify').href, '/work')
})
