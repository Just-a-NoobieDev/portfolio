import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { smooth } from './process-progress'

// The same construction panels rotate into a product surface. Its two supporting
// layers stay attached behind it, so exploring the object reveals how it works.
export function createFinishedExperience() {
  const layers = Array.from({ length: 3 }, () => new THREE.Group())
  const cobalt = new THREE.MeshPhysicalMaterial({
    color: '#3655ff',
    metalness: 0.35,
    roughness: 0.25,
    clearcoat: 1,
  })
  const alloy = new THREE.MeshPhysicalMaterial({
    color: '#142553',
    metalness: 0.65,
    roughness: 0.28,
    clearcoat: 0.7,
  })
  const light = new THREE.MeshBasicMaterial({ color: '#8de8ff' })
  const geometry = new RoundedBoxGeometry(1, 1, 1, 3, 0.035)
  const parts: {
    group: THREE.Group
    x: number
    z: number
    w: number
    d: number
    order: number
  }[] = []
  const materials: THREE.MeshBasicMaterial[] = []
  const textures: THREE.CanvasTexture[] = []
  const continuousSurfaces: THREE.MeshBasicMaterial[] = []
  const canvases = Array.from({ length: 3 }, () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 920
    return canvas
  })
  let currentView = ''
  const draw = (view: string) => {
    if (view === currentView) return
    currentView = view
    canvases.forEach((canvas, layer) => {
      const c = canvas.getContext('2d')!
      const box = (
        x: number,
        y: number,
        w: number,
        h: number,
        color: string,
        r = 16,
      ) => {
        c.fillStyle = color
        c.beginPath()
        c.roundRect(x, y, w, h, r)
        c.fill()
      }
      const text = (
        label: string,
        x: number,
        y: number,
        size: number,
        color: string,
        weight = 500,
      ) => {
        c.font = `${weight} ${size}px sans-serif`
        c.fillStyle = color
        c.fillText(label, x, y)
      }
      c.fillStyle = layer === 2 ? '#f3f5fb' : '#0d1939'
      c.fillRect(0, 0, 1200, 920)
      if (layer < 2) {
        text(
          layer === 0 ? 'DATA / CONNECTED' : 'LOGIC / CONNECTED',
          50,
          70,
          24,
          '#8de8ff',
        )
        const labels =
          layer === 0
            ? ['CLIENTS', 'PROJECTS', 'BOOKINGS']
            : ['REQUEST', 'VALIDATE', 'DELIVER']
        labels.forEach((label, i) => {
          box(95 + i * 360, 310, 290, 180, '#1a3061')
          text(label, 125 + i * 360, 370, 22, '#d6e3ff')
          text('● ONLINE', 125 + i * 360, 440, 18, '#8de8ff')
          if (i < 2) box(385 + i * 360, 390, 70, 3, '#8de8ff', 0)
        })
        for (let i = 0; i < 7; i++)
          box(95, 570 + i * 28, 400 + (i % 3) * 175, 6, '#2d477e', 3)
      } else {
        box(0, 0, 1200, 94, '#ffffff', 0)
        text('✦  FLOW', 40, 59, 30, '#172345', 800)
        text('Workspace', 310, 56, 20, '#3655ff', 700)
        text('Projects', 488, 56, 20, '#748099')
        text('Clients', 620, 56, 20, '#748099')
        box(1070, 22, 48, 48, '#3655ff', 24)
        text('CJ', 1082, 54, 18, '#ffffff', 700)
        text('YOUR WORK, CONNECTED', 48, 155, 16, '#687794', 700)
        text(
          view === 'requests'
            ? 'Every request. One place.'
            : view === 'analytics'
              ? 'See what’s moving forward.'
              : 'A clear view of your business.',
          48,
          210,
          40,
          '#142142',
          700,
        )
        text(
          'Plan the work. Keep your clients in the loop. Move forward.',
          48,
          254,
          20,
          '#687794',
        )
        box(48, 300, 335, 132, '#3655ff')
        text('Active projects', 72, 340, 19, '#d2dcff')
        text('12', 72, 401, 46, '#ffffff', 700)
        box(402, 300, 345, 132, '#ffffff')
        text('Happy clients', 426, 340, 19, '#687794')
        text('38', 426, 401, 46, '#172345', 700)
        box(766, 300, 386, 132, '#ffffff')
        text('On time delivery', 792, 340, 19, '#687794')
        text('98%', 792, 401, 46, '#172345', 700)
        box(48, 458, 713, 404, '#ffffff')
        box(782, 458, 370, 404, '#ffffff')
        text(
          view === 'requests'
            ? 'Incoming requests'
            : view === 'analytics'
              ? 'Project performance'
              : 'Your projects',
          72,
          506,
          25,
          '#172345',
          700,
        )
        text('This week', 808, 506, 25, '#172345', 700)
        if (view === 'analytics') {
          const heights = [90, 140, 110, 190, 175, 235, 210]
          heights.forEach((h, i) =>
            box(
              90 + i * 86,
              805 - h,
              46,
              h,
              i === 5 ? '#3655ff' : '#dbe3ff',
              8,
            ),
          )
        } else {
          const names =
            view === 'requests'
              ? ['Brand website', 'Booking platform', 'Customer portal']
              : ['Studio website', 'Client dashboard', 'Booking experience']
          names.forEach((name, i) => {
            box(72, 538 + i * 94, 660, 78, '#f5f7fc', 12)
            text(name, 92, 571 + i * 94, 22, '#172345', 600)
            text(
              ['Design approved', 'In development', 'Ready to launch'][i]!,
              92,
              600 + i * 94,
              16,
              '#687794',
            )
            box(563, 557 + i * 94, 144, 33, i === 2 ? '#dbf3e8' : '#e5ebff', 16)
            text(
              ['On track', 'Building', 'Live'][i]!,
              586,
              579 + i * 94,
              16,
              i === 2 ? '#207a57' : '#3655ff',
              600,
            )
          })
        }
        const tasks = [
          'Review direction',
          'Build the experience',
          'Launch with confidence',
        ]
        tasks.forEach((task, i) => {
          box(810, 548 + i * 78, 24, 24, '#e5ebff', 7)
          text('✓', 815, 567 + i * 78, 18, '#3655ff', 700)
          text(task, 849, 568 + i * 78, 17, '#475975')
        })
        box(808, 791, 318, 42, '#172345', 12)
        text('Everything in sync  ↗', 863, 819, 18, '#ffffff', 600)
      }
    })
    textures.forEach((texture) => (texture.needsUpdate = true))
  }
  const layouts = [
    [
      [-1, -1, 1, 1],
      [0.5, -1, 2, 1],
      [-0.5, 0, 2, 1],
      [1, 0, 1, 1],
      [0, 1, 3, 1],
    ],
    [
      [0, -1, 3, 1],
      [-1, 0, 1, 1],
      [0.5, 0, 2, 1],
      [-0.5, 1, 2, 1],
      [1, 1, 1, 1],
    ],
    [
      [-0.5, -1, 2, 1],
      [1, -1, 1, 1],
      [0, 0.5, 3, 2],
    ],
  ]
  layouts.forEach((layout, layer) =>
    layout.forEach(([x, z, w, d], index) => {
      const part = new THREE.Group()
      part.name = `Continuous_product_panel_${layer}_${index}`
      part.add(new THREE.Mesh(geometry, layer === 2 ? cobalt : alloy))
      const texture = new THREE.CanvasTexture(canvases[layer])
      texture.colorSpace = THREE.SRGBColorSpace
      texture.offset.set((x! - w! / 2 + 1.5) / 3, (1.5 - z! - d! / 2) / 3)
      texture.repeat.set(w! / 3, d! / 3)
      texture.anisotropy = 4
      textures.push(texture)
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
      })
      materials.push(material)
      const surface = new THREE.Mesh(
        new THREE.PlaneGeometry(1.002, 1.002),
        material,
      )
      surface.rotation.x = -Math.PI / 2
      surface.position.y = 0.505
      part.add(surface)
      const seam = new THREE.Mesh(geometry, light)
      seam.position.set(0, 0, 0.502)
      seam.scale.set(0.84, 0.12, 0.012)
      part.add(seam)
      layers[layer]!.add(part)
      parts.push({
        group: part,
        x: x!,
        z: z!,
        w: w!,
        d: d!,
        order: layer * 0.045 + index * 0.02,
      })
    }),
  )
  // Once the panel edges meet, the display is a single unbroken surface.
  // It rides on the same layer and rotation; its depth occludes every seam.
  layers.forEach((layer, index) => {
    const texture = new THREE.CanvasTexture(canvases[index])
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    textures.push(texture)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    })
    continuousSurfaces.push(material)
    const display = new THREE.Mesh(
      new THREE.PlaneGeometry(3.652, 2.812),
      material,
    )
    display.name = 'Uninterrupted_product_display'
    display.rotation.x = -Math.PI / 2
    display.position.y = 0.098
    layer.add(display)
  })
  draw('overview')
  return {
    layers,
    setView: draw,
    setProgress(value: number) {
      for (const part of parts) {
        const phase = smooth(part.order, Math.min(1, 0.78 + part.order), value)
        part.group.position.set(
          part.x * 1.22,
          0,
          THREE.MathUtils.lerp(part.z * 0.83, part.z * 0.94, phase),
        )
        part.group.scale.set(
          part.w * 1.22 - THREE.MathUtils.lerp(0.045, 0.008, phase),
          0.16,
          THREE.MathUtils.lerp(
            part.d * 0.83 - 0.035,
            part.d * 0.94 - 0.008,
            phase,
          ),
        )
      }
      continuousSurfaces.forEach(
        (material) => (material.opacity = smooth(0.6, 0.9, value)),
      )
      materials.forEach(
        (material) => (material.opacity = smooth(0.35, 0.95, value)),
      )
    },
    dispose() {
      textures.forEach((texture) => texture.dispose())
    },
  }
}
