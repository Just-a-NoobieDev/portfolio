import * as THREE from 'three'
import { createCarlCharacter } from './carl-character'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Original, code-modeled miniature. No downloaded character or reference assets.
export function createDeveloperDesk({
  screens = true,
}: { screens?: boolean } = {}) {
  const group = new THREE.Group()
  group.name = 'Carl_Developer_Workstation'
  const textures: THREE.CanvasTexture[] = []
  const material = (color: string, roughness = 0.45, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness })
  const dark = material('#242a3b'),
    silver = material('#b3bdd0', 0.25, 0.75)
  const white = material('#f0eade'),
    blue = material('#3e55ef', 0.28)
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
  const desk = new THREE.Group()
  desk.name = 'Ivory_desk'
  group.add(desk)
  box(desk, [4.3, 0.12, 1.8], [0, -0.05, 0.5], white, 0.04)
  for (const x of [-1.88, 1.88])
    for (const z of [-0.12, 1.13]) {
      box(desk, [0.09, 1.48, 0.09], [x, -0.85, z], silver, 0.012)
      box(desk, [0.095, 0.045, 0.095], [x, -1.61, z], dark, 0.008)
    }
  const character = createCarlCharacter()
  group.add(character.group)
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
      isOrb ? 'build-something.ts / live preview' : 'carl / build-something.ts',
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
      c.fillStyle = '#0d162d'
      c.fillRect(0, 43, 310, 437)
      c.font = '16px monospace'
      const source = [
        'const orb = createOrb({',
        '  color: "#3655ff",',
        '  light: curiosity,',
        '  motion: true',
        '})',
        '',
        'scene.add(orb)',
        '',
        'function animate(t) {',
        '  orb.rotate(t)',
        '  render(scene)',
        '}',
      ]
      source.forEach((line, i) => {
        c.fillStyle = i % 2 ? '#9bd8c5' : '#a9b8ff'
        c.fillText(line, 22, 86 + i * 26)
      })
      c.strokeStyle = '#365082'
      c.lineWidth = 1
      for (let x = 325; x < 768; x += 45) {
        c.beginPath()
        c.moveTo(x, 65)
        c.lineTo(x, 410)
        c.stroke()
      }
      for (let y = 65; y < 415; y += 45) {
        c.beginPath()
        c.moveTo(325, y)
        c.lineTo(735, y)
        c.stroke()
      }
      c.fillStyle = '#91a7f5'
      c.font = '16px monospace'
      c.fillText('LIVE PREVIEW', 480, 445)
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    textures.push(texture)
    return texture
  }
  // Two readable, emissive displays; the live orb is rendered over the preview.
  const monitor = new THREE.Group()
  monitor.name = 'Second_monitor'
  monitor.position.set(1.45, 0.83, 1.0)
  monitor.rotation.y = -1.45
  group.add(monitor)
  box(monitor, [1.65, 1.06, 0.09], [0, 0, 0], dark)
  box(monitor, [0.09, 0.34, 0.1], [0, -0.67, 0], silver)
  box(monitor, [0.65, 0.04, 0.4], [0, -0.85, 0], silver)
  const screenMat = (orb: boolean) =>
    new THREE.MeshBasicMaterial({
      map: screens ? screenTexture(orb) : null,
      color: screens ? '#ffffff' : '#18253f',
      side: THREE.FrontSide,
    })
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(1.51, 0.94),
    screenMat(true),
  )
  display.name = 'Monitor_screen'
  display.position.z = 0.052
  monitor.add(display)
  const laptop = new THREE.Group()
  laptop.name = 'Laptop'
  laptop.position.set(-0.45, 0.1, 0.5)
  laptop.rotation.y = Math.PI
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
  laptopDisplay.name = 'Laptop_screen'
  laptopDisplay.position.z = 0.033
  lid.add(laptopDisplay)
  // The keyboard and both typing targets share the laptop transform.
  box(laptop, [1.05, 0.025, 0.4], [0, 0.045, 0.12], dark)
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 12; col++)
      box(
        laptop,
        [0.063, 0.015, 0.055],
        [-0.44 + col * 0.08, 0.065, -0.01 + row * 0.08],
        silver,
        0.006,
      )
  group.updateMatrixWorld(true)
  character.setTypingTargets(
    character.group.worldToLocal(
      laptop.localToWorld(new THREE.Vector3(0.22, 0.12, 0.23)),
    ),
    character.group.worldToLocal(
      laptop.localToWorld(new THREE.Vector3(-0.22, 0.12, 0.23)),
    ),
  )
  character.animate(0, 0)
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.11, 0.3, 24),
    blue,
  )
  mug.name = 'Coffee_beside_the_laptop'
  mug.position.set(0.65, 0.18, 1.1)
  group.add(mug)
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.095, 0.025, 8, 20),
    blue,
  )
  handle.position.set(0.79, 0.2, 1.1)
  group.add(handle)
  const coffee = new THREE.Mesh(
    new THREE.CircleGeometry(0.112, 24),
    material('#382016', 0.3),
  )
  coffee.rotation.x = -Math.PI / 2
  coffee.position.set(0.65, 0.332, 1.1)
  group.add(coffee)
  const orbOrigin = new THREE.Object3D()
  orbOrigin.position.set(0.28, 0, 0.23)
  monitor.add(orbOrigin)
  const orbHandoff = character.reachAnchor
  return {
    group,
    orbOrigin,
    orbHandoff,
    lookAtOrb(target: THREE.Vector3, delta: number, tracking: number) {
      const focus = laptopDisplay.getWorldPosition(new THREE.Vector3())
      character.lookAtOrb(focus.lerp(target, tracking), delta)
    },
    animate(time: number, release = 0) {
      character.animate(time, release)
    },
    dispose() {
      textures.forEach((texture) => texture.dispose())
    },
  }
}
