import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const source = await readFile(
  new URL('../src/lib/thread-path.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { threadPath } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)

for (const [
  width,
  height,
  workBottom,
  introHeight,
  sceneTop,
  previewHeight,
] of [
  [1440, 7200, 1800, 900, 2500, 900],
  [1280, 6600, 1650, 900, 2300, 720],
  [390, 8500, 2200, 1000, 3300, 844],
  [760, 8000, 2100, 1000, 3200, 900],
])
  test(`one continuous stroke has smooth joins at width ${width}`, () => {
    const d = threadPath(
      'page',
      width,
      height,
      workBottom,
      introHeight,
      sceneTop,
      previewHeight,
    )
    assert.equal(
      (d.match(/M/g) ?? []).length,
      1,
      'a second move would introduce a disconnected stroke',
    )
    assert.ok(!/NaN|Infinity/.test(d))
    const commands = [...d.matchAll(/([MC])([^MC]+)/g)]
    let endpoint,
      previousControl,
      joins = 0
    for (const [, command, values] of commands) {
      const numbers = values
        .trim()
        .split(/[\s,]+/)
        .map(Number)
      if (command === 'M') {
        endpoint = numbers
        continue
      }
      assert.equal(numbers.length, 6)
      if (previousControl) {
        const incoming = [
          endpoint[0] - previousControl[0],
          endpoint[1] - previousControl[1],
        ]
        const outgoing = [numbers[0] - endpoint[0], numbers[1] - endpoint[1]]
        const cosine =
          (incoming[0] * outgoing[0] + incoming[1] * outgoing[1]) /
          (Math.hypot(...incoming) * Math.hypot(...outgoing))
        assert.ok(cosine > 0.999999, `sharp join ${joins}: cosine ${cosine}`)
        joins++
      }
      previousControl = numbers.slice(2, 4)
      endpoint = numbers.slice(4, 6)
    }
    assert.equal(joins, 12)
  })

for (const width of [1440, 390])
  test(`the entry stroke descends into the frame at width ${width}`, () => {
    const d = threadPath('entry', width, 844)
    const commands = [...d.matchAll(/([MC])([^MC]+)/g)]
    let point
    for (const [, command, values] of commands) {
      const n = values
        .trim()
        .split(/[\s,]+/)
        .map(Number)
      if (command === 'M') {
        point = n
        continue
      }
      let lastY = point[1]
      for (let step = 1; step <= 100; step++) {
        const t = step / 100,
          u = 1 - t
        const y =
          u ** 3 * point[1] +
          3 * u * u * t * n[1] +
          3 * u * t * t * n[3] +
          t ** 3 * n[5]
        assert.ok(y >= lastY, 'the curve must not rise out above the frame')
        lastY = y
      }
      point = n.slice(4, 6)
    }
    assert.ok(point[0] < width * 0.95)
    assert.ok(point[1] > 844 * 0.4 && point[1] < 844 * 0.88)
  })

const { storyThreadPath, storyDrawProgress } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)
for (const width of [390, 1440])
  test(`the process-to-work stroke has one start and smooth joins at ${width}px`, () => {
    const { before, through, path } = storyThreadPath(
      width,
      1000,
      1000,
      6500,
      8200,
      7900,
      844,
    )
    assert.ok(through.startsWith(before) && path.startsWith(through))
    assert.equal((path.match(/M/g) ?? []).length, 1)
    assert.ok(!/NaN|Infinity/.test(path))
    let endpoint, control
    for (const [, command, values] of path.matchAll(/([MC])([^MC]+)/g)) {
      const n = values
        .trim()
        .split(/[\s,]+/)
        .map(Number)
      if (command === 'M') {
        endpoint = n
        continue
      }
      if (control) {
        const a = [endpoint[0] - control[0], endpoint[1] - control[1]]
        const b = [n[0] - endpoint[0], n[1] - endpoint[1]]
        assert.ok(
          (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b)) >
            0.99999,
        )
      }
      control = n.slice(2, 4)
      endpoint = n.slice(4)
    }
  })
test('a pinned process cannot reveal a later Work line early or cause a jump at its boundary', () => {
  const draw = (y) => storyDrawProgress(y, 0, 1000, 5000, 8000, 0.25, 0.7)
  assert.equal(draw(1000), 0.25)
  assert.equal(draw(5000), 0.7)
  assert.equal(draw(8000), 1)
  assert.equal(draw(-100), 0)
  let previous = 0
  for (let y = 0; y <= 9000; y++) {
    const current = draw(y)
    assert.ok(current >= previous && current - previous < 0.001)
    previous = current
  }
})

test('the line head stays at the preview until the liquid front has covered it', () => {
  const draw = (p) =>
    storyDrawProgress(1000 + p * 5000, 0, 1000, 6000, 9000, 0.2, 0.65)
  assert.equal(draw(0), 0.2)
  assert.equal(draw(0.04), 0.2)
  assert.equal(draw(0.05), 0.2)
  assert.ok(draw(0.06) > 0.2)
  assert.equal(draw(1), 0.65)
})
