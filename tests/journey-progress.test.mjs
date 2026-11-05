import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(
  new URL('../src/lib/journey-progress.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { journeyProgress } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

test('the view expands before the bridge and camera journey develop', () => {
  assert.equal(journeyProgress(0).focus, 0)
  assert.equal(journeyProgress(0.1).travel, 0)
  assert.equal(journeyProgress(0.25).focus, 1)
  assert.ok(journeyProgress(0.22).travel < 0.01)
  assert.equal(journeyProgress(0.22).passage, 0)
})
test('the journey reaches four chapters and ends beyond the gateway', () => {
  assert.deepEqual(
    [0, 0.3, 0.6, 0.95].map((p) => journeyProgress(p).chapter),
    [0, 1, 2, 3],
  )
  assert.equal(journeyProgress(1).travel, 1)
  assert.equal(journeyProgress(1).passage, 1)
  assert.equal(journeyProgress(1).introOpacity, 0)
})
test('view expansion and camera movement stay continuous across chapter boundaries', () => {
  let previous = journeyProgress(0)
  for (let i = 1; i <= 10000; i++) {
    const p = i / 10000,
      current = journeyProgress(p)
    for (const key of ['focus', 'travel', 'passage']) {
      assert.ok(current[key] >= previous[key])
      assert.ok(current[key] - previous[key] < 0.002)
    }
    previous = current
  }
  assert.deepEqual(journeyProgress(-1), journeyProgress(0))
  assert.deepEqual(journeyProgress(2), journeyProgress(1))
})

test('the incoming line and preview copy clear before dark expansion starts', () => {
  for (let i = 0; i <= 1000; i++) {
    const state = journeyProgress(i / 1000)
    if (state.focus > 0) {
      assert.equal(state.lineOpacity, 0)
      assert.equal(state.introOpacity, 0)
    }
  }
})

test('Carl waits, catches before construction, and releases before waving', () => {
  const waiting = journeyProgress(0)
  for (const key of [
    'reach',
    'catch',
    'build',
    'turn',
    'travel',
    'release',
    'greet',
  ])
    assert.equal(waiting[key], 0)
  for (let i = 0; i <= 1000; i++) {
    const state = journeyProgress(i / 1000)
    if (state.build > 0 || state.focus > 0) assert.equal(state.catch, 1)
    if (state.travel > 0) {
      assert.equal(state.turn, 1)
      assert.equal(state.focus, 1)
      assert.ok(state.build > 0)
    }
    if (state.release > 0) assert.equal(state.travel, 1)
    if (state.greet > 0) assert.equal(state.release, 1)
  }
  assert.equal(journeyProgress(1).greet, 1)
})
