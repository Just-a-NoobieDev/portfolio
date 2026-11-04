import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(
  new URL('../src/lib/process-progress.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { processProgress } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

test('the line reaches the preview and yields to the fluid front before restoring for Work', () => {
  assert.equal(processProgress(0).lineOpacity, 1)
  assert.equal(processProgress(0.035).lineOpacity, 1)
  assert.ok(processProgress(0.06).lineOpacity > 0)
  assert.equal(processProgress(0.085).lineOpacity, 0)
  assert.equal(processProgress(0.035).introOpacity, 1)
  assert.equal(processProgress(0.24).introOpacity, 0)
  assert.equal(processProgress(0.035).focus, 0)
  assert.equal(processProgress(0.24).focus, 1)
  assert.equal(processProgress(0.8).lineOpacity, 0)
  assert.equal(processProgress(1).lineOpacity, 1)
})
test('planning precedes construction, and launch follows assembly', () => {
  assert.equal(processProgress(0.24).build, 0)
  assert.equal(processProgress(0.43).plan, 1)
  assert.equal(processProgress(0.7).build, 1)
  assert.equal(processProgress(0.7).launch, 0)
  assert.deepEqual(
    [0, 0.35, 0.6, 0.9].map((p) => processProgress(p).chapter),
    [0, 1, 2, 3],
  )
})
test('all scroll parameters remain continuous, bounded and reversible', () => {
  let previous = processProgress(0)
  for (let i = 1; i <= 2000; i++) {
    const current = processProgress(i / 2000)
    for (const key of [
      'focus',
      'plan',
      'build',
      'launch',
      'lineOpacity',
      'introOpacity',
    ]) {
      assert.ok(current[key] >= 0 && current[key] <= 1)
      assert.ok(Math.abs(current[key] - previous[key]) < 0.04)
    }
    previous = current
  }
  assert.deepEqual(processProgress(-1), processProgress(0))
  assert.deepEqual(processProgress(2), processProgress(1))
})
