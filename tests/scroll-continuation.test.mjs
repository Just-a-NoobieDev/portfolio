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

test('restoring a page at the ending never navigates without fresh input', () => {
  const c = new ScrollContinuation()
  assert.equal(c.update(1, 100), false)
  assert.equal(c.update(1, 90000), false)
  assert.equal(c.intent(1, 90001, true), true)
  assert.equal(c.intent(1, 90002, true), false)
})
test('downward scrolling through the progress range navigates exactly once', () => {
  const c = new ScrollContinuation()
  c.update(0.3, 0)
  c.intent(1, 100, true)
  assert.equal(c.update(0.75, 200), false)
  assert.equal(c.update(1, 300), true)
  assert.equal(c.update(1, 400), false)
  assert.equal(c.intent(1, 500, true), false)
})
test('a gesture outside the ending cannot arm an automatic page jump', () => {
  const c = new ScrollContinuation()
  c.intent(1, 10, false)
  assert.equal(c.update(1, 20), false)
})
test('scrolling back or changing geometry cancels a previously armed continuation', () => {
  const c = new ScrollContinuation()
  c.update(0.7, 0)
  c.intent(1, 10, true)
  c.intent(-1, 20, false)
  assert.equal(c.update(1, 30), false)
})
test('stale input does not trigger navigation when layout later reaches the end', () => {
  const c = new ScrollContinuation()
  c.update(0.9, 0)
  c.intent(1, 10, true)
  assert.equal(c.update(1, 3000), false)
})
test('the four main chapters form a complete route sequence', () => {
  assert.deepEqual(
    ['/', '/work', '/about', '/contact'].map((path) => nextChapter(path).href),
    ['/work', '/about', '/contact', '/'],
  )
  assert.equal(nextChapter('/work/nabify').href, '/work')
})
