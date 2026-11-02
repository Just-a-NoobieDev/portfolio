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
