import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const clamp = (value: number) => THREE.MathUtils.clamp(value, 0, 1)
const smooth = (a: number, b: number, value: number) =>
  THREE.MathUtils.smoothstep(value, a, b)

export function createConnectionJourney(
  host: HTMLElement,
  section: HTMLElement,
  onReady: () => void,
  onLost: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 0.9
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#101625', 0.027)
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 100)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  room.dispose()
  scene.environment = environment.texture
  const key = new THREE.DirectionalLight('#ffffff', 3)
  key.position.set(-4, 8, 5)
  const rim = new THREE.DirectionalLight('#486dff', 4)
  rim.position.set(5, 2, -12)
  scene.add(key, rim, new THREE.AmbientLight('#b2beef', 0.55))
  const silver = new THREE.MeshStandardMaterial({
    color: '#a7b6cd',
    metalness: 0.96,
    roughness: 0.21,
  })
  const blue = new THREE.MeshPhysicalMaterial({
    color: '#113bff',
    metalness: 0.35,
    roughness: 0.2,
    clearcoat: 0.5,
    emissive: '#002dff',
    emissiveIntensity: 0.6,
  })
  const glow = new THREE.MeshBasicMaterial({ color: '#6895ff' })
  const pale = new THREE.MeshBasicMaterial({ color: '#b7d7ff' })
  const structure = new THREE.Group()
  scene.add(structure)
  const slats: THREE.Mesh[] = []
  const bridgeGeometry = new RoundedBoxGeometry(3.6, 0.13, 0.48, 3, 0.055)
  const total = 36
  function bridgePoint(fraction: number) {
    return new THREE.Vector3(
      Math.sin(fraction * Math.PI) * 1.25,
      -1.65 + Math.sin(fraction * Math.PI) * 0.3,
      7 - fraction * 29,
    )
  }
  for (let i = 0; i < total; i++) {
    const slat = new THREE.Mesh(bridgeGeometry, i % 6 === 0 ? blue : silver)
    structure.add(slat)
    slats.push(slat)
  }
  const railCurves: THREE.CatmullRomCurve3[] = []
  for (const direction of [-1, 1]) {
    const points = Array.from({ length: 50 }, (_, i) =>
      bridgePoint(i / 49).add(new THREE.Vector3(direction * 1.65, 0.25, 0)),
    )
    const curve = new THREE.CatmullRomCurve3(points)
    railCurves.push(curve)
    structure.add(
      new THREE.Mesh(new THREE.TubeGeometry(curve, 100, 0.018, 6, false), glow),
    )
  }
  const spineCurve = new THREE.CatmullRomCurve3(
    Array.from({ length: 60 }, (_, i) =>
      bridgePoint(i / 59).add(new THREE.Vector3(0, 0.35, 0)),
    ),
  )
  const spine = new THREE.Mesh(
    new THREE.TubeGeometry(spineCurve, 120, 0.025, 6, false),
    glow,
  )
  structure.add(spine)
  // Two sides of a gateway align, then open. The geometry and story are original.
  const gate = new THREE.Group()
  gate.position.set(0, 1, -21)
  structure.add(gate)
  const gateHalves: THREE.Group[] = []
  for (const sign of [-1, 1]) {
    const half = new THREE.Group()
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(3.05, 0.11, 10, 70, Math.PI),
      silver,
    )
    arch.rotation.z = sign < 0 ? Math.PI / 2 : -Math.PI / 2
    half.add(arch)
    const light = new THREE.Mesh(
      new THREE.TorusGeometry(2.88, 0.028, 6, 70, Math.PI),
      glow,
    )
    light.rotation.z = arch.rotation.z
    half.add(light)
    gate.add(half)
    gateHalves.push(half)
  }
  const signal = new THREE.Group()
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.39, 4), blue)
  const shell = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.018, 6, 64),
    pale,
  )
  shell.rotation.x = 0.6
  signal.add(ball, shell)
  structure.add(signal)
  const light = new THREE.PointLight('#315bff', 8, 7, 2)
  signal.add(light)
  const packets: THREE.Mesh[] = []
  for (let i = 0; i < 14; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), pale)
    structure.add(dot)
    packets.push(dot)
  }
  const stars = new Float32Array(420 * 3)
  for (let i = 0; i < 420; i++) {
    stars[i * 3] = Math.sin(i * 127.1) * 17
    stars[i * 3 + 1] = Math.cos(i * 71.7) * 9
    stars[i * 3 + 2] = 10 - ((i * 13.37) % 1) * 55
  }
  const starsGeometry = new THREE.BufferGeometry()
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
  const dust = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({
      color: '#7d9cd7',
      size: 0.025,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    }),
  )
  scene.add(dust)
  const floor = new THREE.GridHelper(80, 60, '#354b78', '#24324e')
  floor.position.y = -2.25
  ;(floor.material as THREE.Material).transparent = true
  ;(floor.material as THREE.Material).opacity = 0.22
  structure.add(floor)
  let target = 0,
    progress = 0,
    visible = false,
    lost = false,
    first = true,
    previous = 0,
    time = 0
  let pointerX = 0,
    pointerY = 0
  const scroll = () => {
    target = clamp(
      -section.getBoundingClientRect().top /
        Math.max(1, section.offsetHeight - innerHeight),
    )
  }
  const size = () => {
    renderer.setSize(
      Math.max(1, host.clientWidth),
      Math.max(1, host.clientHeight),
    )
    camera.aspect = host.clientWidth / Math.max(1, host.clientHeight)
    camera.updateProjectionMatrix()
    scroll()
  }
  const resize = new ResizeObserver(size)
  resize.observe(host)
  size()
  const observe = new IntersectionObserver(
    ([entry]) => {
      visible = !!entry?.isIntersecting
      previous = 0
    },
    { rootMargin: '100px' },
  )
  observe.observe(host)
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const rect = host.getBoundingClientRect()
    pointerX = (event.clientX - rect.left) / rect.width - 0.5
    pointerY = (event.clientY - rect.top) / rect.height - 0.5
  }
  const leave = () => {
    pointerX = 0
    pointerY = 0
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    onLost()
  }
  const contextRestored = () => {
    lost = false
    first = true
  }
  renderer.setAnimationLoop((now) => {
    if (!visible || document.hidden || lost) {
      previous = 0
      return
    }
    if (previous && now - previous < 1000 / 40) return
    const dt = previous ? Math.min((now - previous) / 1000, 0.06) : 0.016
    previous = now
    time += dt
    progress = THREE.MathUtils.damp(progress, target, 8, dt)
    const form = smooth(0.03, 0.55, progress),
      open = smooth(0.68, 0.97, progress)
    slats.forEach((slat, i) => {
      const fraction = i / (total - 1),
        base = bridgePoint(fraction)
      const localForm = smooth(
        fraction * 0.23,
        0.27 + fraction * 0.23,
        progress,
      )
      const scatter = 1 - localForm
      slat.position
        .copy(base)
        .add(
          new THREE.Vector3(
            Math.sin(i * 2.3) * scatter * 7,
            Math.cos(i * 1.7) * scatter * 4,
            Math.sin(i) * scatter * 2,
          ),
        )
      slat.rotation.set(
        scatter * ((i % 3) - 1) * 1.6,
        Math.cos(fraction * Math.PI) * -0.14 + scatter * 0.8,
        Math.sin(i * 1.4) * scatter * 1.5,
      )
    })
    const signalPosition = bridgePoint(0.05 + progress * 0.9)
    signalPosition.y += 1.15 + Math.sin(time * 2) * 0.07
    signal.position.copy(signalPosition)
    ball.rotation.set(time * 0.18, time * 0.3, 0)
    shell.rotation.set(time * 0.4, time * 0.2, 0.3)
    signal.scale.setScalar(1 + open * 0.35)
    gateHalves.forEach((half, i) => {
      const direction = i === 0 ? -1 : 1
      half.position.x = direction * ((1 - form) * 4 + open * 1.35)
      half.rotation.y = direction * ((1 - form) * 0.7 + open * 0.55)
      half.rotation.z = direction * (1 - form) * 0.35
    })
    gate.rotation.z = Math.sin(time * 0.22) * 0.025
    packets.forEach((packet, i) => {
      const curve = railCurves[i % 2]!
      packet.position.copy(curve.getPoint((time * 0.07 + i / 14) % 1))
      packet.scale.setScalar(0.3 + form * 0.7)
    })
    const mobile = camera.aspect < 1
    camera.position.set(
      (mobile ? 2.4 : 4.5) * (1 - progress) + pointerX * 0.5,
      (mobile ? 3.5 : 3) - progress * 1.15 + pointerY * 0.25,
      14 - progress * 26,
    )
    camera.lookAt(
      signal.position.x * 0.4,
      -0.2 + open * 0.5,
      -6 - progress * 17,
    )
    dust.rotation.y = time * 0.008
    structure.position.x = mobile ? 0 : 1.5 * (1 - open)
    renderer.render(scene, camera)
    if (first) {
      first = false
      onReady()
    }
  })
  window.addEventListener('scroll', scroll, { passive: true })
  host.addEventListener('pointermove', pointer)
  host.addEventListener('pointerleave', leave)
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored)
  return () => {
    resize.disconnect()
    observe.disconnect()
    renderer.setAnimationLoop(null)
    window.removeEventListener('scroll', scroll)
    host.removeEventListener('pointermove', pointer)
    host.removeEventListener('pointerleave', leave)
    renderer.domElement.removeEventListener('webglcontextlost', contextLost)
    renderer.domElement.removeEventListener(
      'webglcontextrestored',
      contextRestored,
    )
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>()
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Points ||
        object instanceof THREE.LineSegments
      ) {
        geometries.add(object.geometry)
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material])
          materials.add(material)
      }
    })
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
