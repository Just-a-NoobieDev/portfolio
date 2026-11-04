import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import { moduleUrl } from '../scripts/model-source.mjs'
const { createDeveloperDesk } = await import(
  await moduleUrl(
    fileURLToPath(new URL('../src/lib/developer-desk.ts', import.meta.url)),
  )
)
const { heroHandoff } = await import(
  await moduleUrl(
    fileURLToPath(new URL('../src/lib/hero-handoff.ts', import.meta.url)),
  )
)

test('the developer rises and holds the orb before it departs', () => {
  assert.equal(heroHandoff(0).stand, 0)
  assert.equal(heroHandoff(0.4).stand, 1)
  assert.equal(heroHandoff(0.5).reach, 1)
  assert.equal(heroHandoff(0.6).depart, 0)
  assert.equal(heroHandoff(1).depart, 1)
  assert.equal(heroHandoff(0.25).surprise, 1)
})
test('supporting hand stays over the physical keyboard throughout standing', () => {
  const desk = createDeveloperDesk({ screens: false })
  const laptop = desk.group.getObjectByName('Laptop')
  const hand = desk.group.getObjectByName('Left_typing_hand')
  for (const progress of [0, 0.2, 0.4, 0.6, 1]) {
    desk.animate(0, progress)
    desk.group.updateMatrixWorld(true)
    const local = laptop.worldToLocal(
      hand.getWorldPosition(new THREE.Vector3()),
    )
    assert.ok(Math.abs(local.x) < 0.5)
    assert.ok(local.y >= 0.1 && local.y < 0.15)
    assert.ok(local.z > -0.05 && local.z < 0.3)
  }
  desk.dispose()
})
test('facial patches follow the head surface and legs contain no open knee seam', () => {
  const desk = createDeveloperDesk({ screens: false })
  const mouth = desk.group.getObjectByName('Surface_fitted_surprised_mouth')
  const positions = mouth.geometry.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i),
      y = positions.getY(i)
    const surface = 0.32 * Math.sqrt(1 - (x / 0.35) ** 2 - (y / 0.43) ** 2)
    assert.ok(Math.abs(positions.getZ(i) - surface - 0.003) < 1e-6)
  }
  for (const p of [0, 0.25, 0.5, 1]) {
    desk.animate(0, p)
    for (const name of [
      'Left_continuous_trouser_leg',
      'Right_continuous_trouser_leg',
    ]) {
      const geometry = desk.group.getObjectByName(name).geometry
      assert.ok(geometry.index.count > 0)
      assert.ok(
        [...geometry.getAttribute('position').array].every(Number.isFinite),
      )
    }
  }
  desk.dispose()
})
