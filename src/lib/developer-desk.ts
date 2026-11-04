import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Original, code-modeled miniature. No downloaded character or reference assets.
export function createDeveloperDesk() {
  const group = new THREE.Group()
  const textures: THREE.CanvasTexture[] = []
  const material = (color: string, roughness = 0.45, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness })
  const navy = material('#263c7d'),
    skin = material('#cc906b'),
    hair = material('#171b25')
  const dark = material('#242a3b'),
    silver = material('#b3bdd0', 0.25, 0.75)
  const white = material('#f0eade'),
    blue = material('#3e55ef', 0.28)
  const shoes = material('#e2e5ec'),
    denim = material('#394354')
  function box(
    parent: THREE.Object3D,
    size: number[],
    at: number[],
    mat: THREE.Material,
    radius = 0.05,
  ) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(size[0]!, size[1]!, size[2]!, 3, radius),
      mat,
    )
    mesh.position.set(at[0]!, at[1]!, at[2]!)
    parent.add(mesh)
    return mesh
  }
  function ellipsoid(
    parent: THREE.Object3D,
    size: number[],
    at: number[],
    mat: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), mat)
    mesh.scale.set(size[0]!, size[1]!, size[2]!)
    mesh.position.set(at[0]!, at[1]!, at[2]!)
    parent.add(mesh)
    return mesh
  }
  function limb(
    parent: THREE.Object3D,
    from: number[],
    to: number[],
    radius: number,
    mat: THREE.Material,
  ) {
    const start = new THREE.Vector3(...(from as [number, number, number]))
    const end = new THREE.Vector3(...(to as [number, number, number]))
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        radius,
        Math.max(0.01, start.distanceTo(end) - radius * 2),
        5,
        12,
      ),
      mat,
    )
    mesh.position.copy(start).lerp(end, 0.5)
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    )
    parent.add(mesh)
    return mesh
  }
  // A small architectural stage keeps the silhouette grounded at every angle.
  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(2.75, 2.75, 0.13, 80),
    material('#e1e5f1'),
  )
  stage.position.y = -1.75
  group.add(stage)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.72, 0.015, 6, 100), blue)
  rim.rotation.x = Math.PI / 2
  rim.position.y = -1.675
  group.add(rim)
  box(group, [4.3, 0.16, 1.8], [0, -0.05, 0.5], white, 0.07)
  for (const x of [-1.8, 1.8]) {
    box(group, [0.11, 1.5, 0.11], [x, -0.85, 0.1], silver)
    box(group, [0.11, 1.5, 0.11], [x, -0.85, 1.05], silver)
    box(group, [0.6, 0.06, 1.35], [x, -1.6, 0.5], dark)
  }
  // Chair, seated figure, tapered limbs, sculpted hair and facial features.
  box(group, [1, 0.16, 0.9], [0, -0.52, -0.6], dark)
  box(group, [1.05, 1.1, 0.17], [0, 0.02, -1.05], navy, 0.08)
  limb(group, [0, -0.6, -0.6], [0, -1.55, -0.6], 0.065, silver)
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5
    const end = [Math.cos(a) * 0.65, -1.58, -0.6 + Math.sin(a) * 0.65]
    limb(group, [0, -1.45, -0.6], end, 0.035, silver)
    ellipsoid(group, [0.085, 0.08, 0.085], end, dark)
  }
  const person = new THREE.Group()
  group.add(person)
  ellipsoid(person, [0.48, 0.65, 0.29], [0, 0.24, -0.62], navy)
  box(person, [0.74, 0.22, 0.65], [0, -0.4, -0.46], denim, 0.09)
  limb(person, [0, 0.72, -0.58], [0, 1.04, -0.55], 0.15, skin)
  const head = new THREE.Group()
  head.position.set(0, 1.27, -0.51)
  head.rotation.x = 0.08
  person.add(head)
  ellipsoid(head, [0.35, 0.43, 0.32], [0, 0, 0], skin)
  ellipsoid(head, [0.37, 0.29, 0.33], [0, 0.24, -0.05], hair)
  ellipsoid(head, [0.29, 0.14, 0.2], [-0.08, 0.4, 0.05], hair).rotation.z = -0.2
  for (const x of [-0.34, 0.34])
    ellipsoid(head, [0.065, 0.11, 0.065], [x, -0.02, 0], skin)
  for (const x of [-0.12, 0.12]) {
    ellipsoid(head, [0.035, 0.045, 0.025], [x, 0.02, 0.302], dark)
    box(head, [0.09, 0.025, 0.03], [x, 0.12, 0.29], hair, 0.01)
  }
  ellipsoid(head, [0.055, 0.07, 0.075], [0, -0.045, 0.31], skin)
  box(head, [0.12, 0.025, 0.02], [0, -0.17, 0.29], material('#8b5343'), 0.01)
  const hands: THREE.Group[] = []
  for (const sign of [-1, 1]) {
    limb(
      person,
      [sign * 0.38, 0.55, -0.57],
      [sign * 0.63, 0.13, -0.15],
      0.15,
      navy,
    )
    limb(
      person,
      [sign * 0.63, 0.13, -0.15],
      [sign * 0.33, 0.12, 0.42],
      0.105,
      skin,
    )
    const hand = new THREE.Group()
    hand.position.set(sign * 0.33, 0.13, 0.46)
    person.add(hand)
    ellipsoid(hand, [0.13, 0.055, 0.15], [0, 0, 0], skin)
    hands.push(hand)
    for (let i = 0; i < 4; i++)
      limb(
        hand,
        [-0.075 + i * 0.045, 0, 0.06],
        [-0.075 + i * 0.045, -0.015, 0.18],
        0.018,
        skin,
      )
    limb(
      person,
      [sign * 0.22, -0.42, -0.5],
      [sign * 0.26, -0.65, 0.2],
      0.17,
      denim,
    )
    limb(
      person,
      [sign * 0.26, -0.65, 0.2],
      [sign * 0.27, -1.45, 0.18],
      0.13,
      denim,
    )
    box(person, [0.32, 0.18, 0.55], [sign * 0.27, -1.5, 0.32], shoes, 0.07)
  }
  function screenTexture(isOrb: boolean) {
    const canvas = document.createElement('canvas')
    canvas.width = 768
    canvas.height = 480
    const c = canvas.getContext('2d')!
    c.fillStyle = '#111b35'
    c.fillRect(0, 0, 768, 480)
    c.fillStyle = '#293451'
    c.fillRect(0, 0, 768, 42)
    for (let i = 0; i < 3; i++) {
      c.fillStyle = ['#ef8a91', '#ebcb85', '#8eceb6'][i]!
      c.beginPath()
      c.arc(23 + i * 22, 21, 5, 0, Math.PI * 2)
      c.fill()
    }
    c.font = '18px monospace'
    c.fillStyle = '#9baad5'
    c.fillText(
      isOrb ? 'preview / a little possibility' : 'carl / build-something.ts',
      115,
      28,
    )
    c.font = '21px monospace'
    const lines = [
      'const idea = new Possibility()',
      '',
      'idea.connect({',
      '  thought: curiosity,',
      '  craft: thoughtfulCode,',
      '  outcome: remarkable',
      '})',
      '',
      'await idea.bringToLife()',
    ]
    if (!isOrb)
      lines.forEach((line, i) => {
        c.fillStyle =
          i % 3 === 0 ? '#90a7ff' : i % 3 === 1 ? '#99d8c4' : '#e3d6ba'
        c.fillText(line, 46 + (i === 3 || i === 4 ? 20 : 0), 92 + i * 36)
      })
    else {
      c.strokeStyle = '#365082'
      c.lineWidth = 1
      for (let x = 50; x < 768; x += 45) {
        c.beginPath()
        c.moveTo(x, 65)
        c.lineTo(x, 410)
        c.stroke()
      }
      for (let y = 65; y < 415; y += 45) {
        c.beginPath()
        c.moveTo(30, y)
        c.lineTo(735, y)
        c.stroke()
      }
      c.fillStyle = '#91a7f5'
      c.font = '16px monospace'
      c.fillText('ONE IDEA. ENDLESS POSSIBILITIES.', 202, 445)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.push(texture)
    return texture
  }
  // Two readable, emissive displays; the live orb is rendered over the preview.
  const monitor = new THREE.Group()
  monitor.position.set(1.15, 0.83, 0.37)
  monitor.rotation.y = -0.16
  group.add(monitor)
  box(monitor, [1.65, 1.06, 0.09], [0, 0, 0], dark)
  box(monitor, [0.09, 0.34, 0.1], [0, -0.67, 0], silver)
  box(monitor, [0.65, 0.04, 0.4], [0, -0.85, 0], silver)
  const screenMat = (orb: boolean) =>
    new THREE.MeshBasicMaterial({
      map: screenTexture(orb),
      side: THREE.DoubleSide,
    })
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(1.51, 0.94),
    screenMat(true),
  )
  display.position.z = 0.052
  monitor.add(display)
  const laptop = new THREE.Group()
  laptop.position.set(-1.04, 0.1, 0.65)
  laptop.rotation.y = 0.2
  group.add(laptop)
  box(laptop, [1.45, 0.065, 0.95], [0, 0, 0], silver)
  const lid = new THREE.Group()
  lid.position.set(0, 0.47, -0.4)
  lid.rotation.x = -0.15
  laptop.add(lid)
  box(lid, [1.45, 0.94, 0.055], [0, 0, 0], dark)
  const laptopDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(1.33, 0.82),
    screenMat(false),
  )
  laptopDisplay.position.z = 0.033
  lid.add(laptopDisplay)
  // A second keyboard at the hands makes the coding motion legible.
  box(group, [1.05, 0.04, 0.45], [0, 0.055, 0.57], dark)
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      box(
        group,
        [0.063, 0.015, 0.055],
        [-0.44 + col * 0.08, 0.085, 0.42 + row * 0.09],
        silver,
        0.006,
      )
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.3, 24),
    blue,
  )
  mug.position.set(1.87, 0.18, 0.85)
  group.add(mug)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.095, 0.025, 8, 20),
    blue,
  )
  handle.position.set(2, 0.2, 0.85)
  group.add(handle)
  const orbOrigin = new THREE.Object3D()
  orbOrigin.position.set(0, 0, 0.23)
  monitor.add(orbOrigin)
  return {
    group,
    orbOrigin,
    animate(time: number) {
      hands.forEach((hand, i) => {
        hand.position.y = 0.13 + Math.sin(time * 7 + i * 2) * 0.012
        hand.rotation.x = Math.sin(time * 7 + i) * 0.04
      })
      head.rotation.y = Math.sin(time * 0.45) * 0.065
      person.scale.y = 1 + Math.sin(time * 1.8) * 0.003
    },
    dispose() {
      textures.forEach((texture) => texture.dispose())
    },
  }
}
