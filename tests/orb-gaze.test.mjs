import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
import * as THREE from 'three'

const source = await readFile(
  new URL('../src/lib/orb-gaze.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
})
const { visibleOrbTarget } = await import(
  `data:text/javascript;base64,${Buffer.from(
    outputText.replace("'three'", JSON.stringify(import.meta.resolve('three'))),
  ).toString('base64')}`
)

test('gaze follows the rendered orb through arrival with an offset receiving camera', () => {
  const camera = new THREE.PerspectiveCamera(46, 1.6, 0.1, 100)
  camera.position.set(0, 1.2, 14)
  camera.lookAt(0, 0.1, 6)
  camera.setViewOffset(1440, 900, -1440 * 0.21, 0, 1440, 900)
  camera.updateMatrixWorld()
  const bounds = { left: 20, top: 40, width: 1440, height: 900 }
  const palm = new THREE.Vector3(-0.4, 0.5, 6)
  const projected = palm.clone().project(camera)
  const landing = {
    x: bounds.left + ((projected.x + 1) / 2) * bounds.width,
    y: bounds.top + ((1 - projected.y) / 2) * bounds.height,
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    const orb = { x: landing.x - 350 * (1 - t), y: landing.y - 300 * (1 - t) }
    const target = visibleOrbTarget(camera, bounds, orb, palm)
    const actual = target.clone().project(camera)
    assert.ok(
      Math.abs(bounds.left + ((actual.x + 1) / 2) * bounds.width - orb.x) <
        1e-6,
    )
    assert.ok(
      Math.abs(bounds.top + ((1 - actual.y) / 2) * bounds.height - orb.y) <
        1e-6,
    )
    if (i < 20) assert.ok(target.y > palm.y)
    else assert.ok(target.distanceTo(palm) < 1e-6)
  }
})
