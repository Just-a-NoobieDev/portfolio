import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  })
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
  )
}
const { sceneStory } = await load('../src/lib/scene-story.ts')

test('scroll chapters include the final chapter at the exact end', () => {
  assert.deepEqual(
    [0, 0.25, 0.5, 0.75, 1].map((p) => sceneStory(p).chapter),
    [0, 1, 2, 3, 3],
  )
})
test('the sculpture opens, shows interfaces, reveals connections, then reforms', () => {
  assert.equal(sceneStory(0).open, 0)
  assert.ok(sceneStory(0.35).layers > 0.95)
  assert.ok(sceneStory(0.65).network > 0.95)
  assert.equal(sceneStory(1).open, 0)
  assert.equal(sceneStory(1).layers, 0)
  assert.equal(sceneStory(1).network, 0)
  assert.equal(sceneStory(1).resolve, 1)
})
test('scrolling backward produces the same state and every parameter stays bounded', () => {
  const steps = Array.from({ length: 201 }, (_, i) => i / 200)
  const forward = steps.map(sceneStory)
  const reverse = [...steps].reverse().map(sceneStory).reverse()
  assert.deepEqual(forward, reverse)
  for (const state of forward) {
    for (const [key, value] of Object.entries(state)) {
      assert.ok(
        value >= 0 && value <= (key === 'chapter' ? 3 : 1),
        `${key} out of range`,
      )
    }
  }
  assert.equal(sceneStory(-1).progress, 0)
  assert.equal(sceneStory(2).progress, 1)
})
test('full motion initializes without consulting OS preferences or old saved choices', async () => {
  const original = globalThis.document
  globalThis.document = { documentElement: { dataset: { motion: 'reduced' } } }
  try {
    const { initializeMotion } = await load('../src/lib/motion-preference.ts')
    initializeMotion()
    assert.equal(document.documentElement.dataset.motion, 'full')
  } finally {
    if (original === undefined) delete globalThis.document
    else globalThis.document = original
  }
})
