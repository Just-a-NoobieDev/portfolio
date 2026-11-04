import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText
const url = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const progress = url(
  compile(
    await readFile(
      new URL('../src/lib/process-progress.ts', import.meta.url),
      'utf8',
    ),
  ),
)
const source = compile(
  await readFile(
    new URL('../src/lib/fluid-reveal.ts', import.meta.url),
    'utf8',
  ),
).replace(
  /from ['"]\.\/process-progress['"]/,
  `from ${JSON.stringify(progress)}`,
)
const { fluidFramePath } = await import(url(source))
const coordinates = (path) =>
  [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]))

for (const [width, height] of [
  [1280, 720],
  [390, 844],
]) {
  test(`the liquid reveal starts framed, covers the viewport, and reverses at ${width}px`, () => {
    const before = coordinates(fluidFramePath(0, width, height))
    const x = before.filter((_, i) => i % 2 === 0),
      y = before.filter((_, i) => i % 2 === 1)
    assert.ok(Math.min(...x) > 0 && Math.max(...x) < 1)
    assert.ok(Math.min(...y) > 0 && Math.max(...y) < 1)
    const after = coordinates(fluidFramePath(1, width, height))
    const endX = after.filter((_, i) => i % 2 === 0),
      endY = after.filter((_, i) => i % 2 === 1)
    assert.ok(Math.min(...endX) < 0 && Math.max(...endX) > 1)
    assert.ok(Math.min(...endY) < 0 && Math.max(...endY) > 1)
    let previous = before
    for (let i = 1; i <= 500; i++) {
      const current = coordinates(fluidFramePath(i / 500, width, height))
      assert.equal(current.length, previous.length)
      current.forEach((value, index) => {
        assert.ok(Number.isFinite(value))
        assert.ok(Math.abs(value - previous[index]) < 0.02)
      })
      previous = current
    }
    assert.equal(
      fluidFramePath(-1, width, height),
      fluidFramePath(0, width, height),
    )
    assert.equal(
      fluidFramePath(2, width, height),
      fluidFramePath(1, width, height),
    )
  })
}
