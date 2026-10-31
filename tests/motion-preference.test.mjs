import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

const source = await readFile(
  new URL('../src/lib/motion-preference.ts', import.meta.url),
  'utf8',
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText
let fixture = 0

async function setup({ reduced = true, saved, storageThrows = false } = {}) {
  const originals = Object.fromEntries(
    ['window', 'document', 'localStorage'].map((name) => [
      name,
      globalThis[name],
    ]),
  )
  const changes = [],
    events = [],
    storage = new Map(saved ? [['cj-motion', saved]] : [])
  const media = {
    matches: reduced,
    addEventListener: (_, handler) => changes.push(handler),
    removeEventListener: (_, handler) =>
      changes.splice(changes.indexOf(handler), 1),
  }
  globalThis.window = {
    matchMedia: () => media,
    dispatchEvent: (event) => events.push(event.type),
  }
  globalThis.document = { documentElement: { dataset: {} } }
  globalThis.localStorage = {
    getItem(key) {
      if (storageThrows) throw new Error('Storage unavailable')
      return storage.get(key) ?? null
    },
    setItem(key, value) {
      if (storageThrows) throw new Error('Storage unavailable')
      storage.set(key, value)
    },
  }
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${fixture++}`
  )
  return {
    module,
    media,
    events,
    storage,
    changes,
    dataset: document.documentElement.dataset,
    restore() {
      for (const [name, value] of Object.entries(originals)) {
        if (value === undefined) delete globalThis[name]
        else globalThis[name] = value
      }
    },
  }
}

test('first visit respects the operating-system preference', async () => {
  const f = await setup()
  try {
    const cleanup = f.module.initializeMotion()
    assert.equal(f.module.prefersReducedMotion(), true)
    assert.equal(f.dataset.motion, 'reduced')
    f.media.matches = false
    f.changes[0]()
    assert.equal(f.dataset.motion, 'full')
    cleanup()
    assert.equal(f.changes.length, 0)
  } finally {
    f.restore()
  }
})

test('explicit full motion overrides reduced motion without changing the OS', async () => {
  const f = await setup()
  try {
    f.module.initializeMotion()
    f.module.setMotionEnabled(true)
    assert.equal(f.dataset.motion, 'full')
    assert.equal(f.module.prefersReducedMotion(), false)
    assert.equal(f.media.matches, true)
    assert.equal(f.storage.get('cj-motion'), 'full')
    assert.ok(f.events.includes('portfolio:motion-change'))
  } finally {
    f.restore()
  }
})

test('saved preference survives reload and can be switched back to reduced motion', async () => {
  const f = await setup({ reduced: true, saved: 'full' })
  try {
    f.module.initializeMotion()
    assert.equal(f.dataset.motion, 'full')
    f.changes[0]()
    assert.equal(f.dataset.motion, 'full')
    f.module.setMotionEnabled(false)
    assert.equal(f.dataset.motion, 'reduced')
    assert.equal(f.storage.get('cj-motion'), 'reduced')
  } finally {
    f.restore()
  }
})

test('motion controls still work when storage is unavailable', async () => {
  const f = await setup({ storageThrows: true })
  try {
    f.module.initializeMotion()
    f.module.setMotionEnabled(true)
    assert.equal(f.dataset.motion, 'full')
    f.module.setMotionEnabled(false)
    assert.equal(f.dataset.motion, 'reduced')
  } finally {
    f.restore()
  }
})
