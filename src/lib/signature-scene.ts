import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'
import { REPLAY_SIGNATURE } from './motion-preference'
import { sceneStory } from './scene-story'
import { projects } from './projects'

type Options = {
  compact: boolean
  immersive: boolean
  dark: boolean
  onReady: () => void
  onLost: () => void
}

// A flattened, twisting ribbon with a closed cross-section catches real light.
// Three independent arcs let the object physically open during the scroll story.
function ribbonGeometry(
  start: number,
  length: number,
  radius: number,
  width: number,
) {
  const positions: number[] = [],
    indices: number[] = []
  const segments = 100,
    sides = 12
  for (let i = 0; i <= segments; i++) {
    const u = start + (i / segments) * length
    const twist = u * 1.5 + 0.4
    const radial = new THREE.Vector3(Math.cos(u), Math.sin(u), 0)
    const across = radial
      .clone()
      .multiplyScalar(Math.cos(twist))
      .add(new THREE.Vector3(0, 0, Math.sin(twist)))
    const normal = radial
      .clone()
      .multiplyScalar(-Math.sin(twist))
      .add(new THREE.Vector3(0, 0, Math.cos(twist)))
    const center = new THREE.Vector3(
      radius * Math.cos(u),
      radius * Math.sin(u),
      0.36 * Math.sin(u * 3),
    )
    for (let j = 0; j <= sides; j++) {
      const v = (j / sides) * Math.PI * 2
      const vertex = center
        .clone()
        .addScaledVector(across, Math.cos(v) * width)
        .addScaledVector(normal, Math.sin(v) * 0.075)
      positions.push(vertex.x, vertex.y, vertex.z)
      if (i < segments && j < sides) {
        const a = i * (sides + 1) + j,
          b = a + sides + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  )
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

export function createSignature(host: HTMLElement, options: Options) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, options.compact ? 1.25 : 1.75),
  )
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.03)
  room.dispose()
  scene.environment = environment.texture
  scene.environmentIntensity = 1.2
  const key = new THREE.DirectionalLight(0xffffff, 2)
  key.position.set(-3, 5, 6)
  const rim = new THREE.DirectionalLight(0x426dff, 2)
  rim.position.set(4, -1, -2)
  const fill = new THREE.DirectionalLight(0xffffff, 1)
  fill.position.set(2, -3, 3)
  scene.add(key, rim, fill, new THREE.AmbientLight(0xffffff, 0.3))
  const chrome = new THREE.MeshPhysicalMaterial({
    color: '#aeb8cf',
    metalness: 1,
    roughness: 0.17,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  })
  const blue = new THREE.MeshPhysicalMaterial({
    color: '#002aff',
    metalness: 0.35,
    envMapIntensity: 0.4,
    roughness: 0.23,
    clearcoat: 0.4,
    emissive: '#0628d0',
    emissiveIntensity: 0.25,
  })
  const ink = new THREE.MeshStandardMaterial({
    color: '#101622',
    metalness: 0.75,
    roughness: 0.28,
  })
  const root = new THREE.Group()
  scene.add(root)
  const sculpture = new THREE.Group()
  root.add(sculpture)
  const arcs: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const arc = new THREE.Mesh(
      ribbonGeometry(
        (i * Math.PI * 2) / 3,
        (Math.PI * 2) / 3 - 0.035,
        1.85,
        0.48,
      ),
      i === 1 ? blue : chrome,
    )
    sculpture.add(arc)
    arcs.push(arc)
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.64, 5), blue)
  sculpture.add(core)
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.018, 8, 100),
    chrome,
  )
  innerRing.rotation.set(0.7, 0.4, 0.3)
  sculpture.add(innerRing)
  const outerOrbit = new THREE.Group()
  root.add(outerOrbit)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: options.dark ? '#5371ce' : '#9199b5',
    transparent: true,
    opacity: options.dark ? 0.3 : 0.28,
  })
  for (let i = 0; i < 2; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.75 + i * 0.15, 0.007, 4, 140),
      ringMaterial,
    )
    ring.rotation.set(0.8 + i * 1.1, i * 0.5, -0.3)
    outerOrbit.add(ring)
  }
  const satellites: THREE.Mesh[] = []
  for (let i = 0; i < 5; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(i === 0 ? 0.16 : 0.055, 16, 12),
      i === 0 ? blue : chrome,
    )
    root.add(dot)
    satellites.push(dot)
  }

  // The interface panels are actual local work, held in thin metal frames.
  const panels: THREE.Group[] = [],
    panelMaterials: THREE.Material[] = [],
    textures: THREE.Texture[] = []
  const paths: THREE.CatmullRomCurve3[] = [],
    pathLines: THREE.Mesh[] = [],
    packets: THREE.Mesh[] = []
  const loader = new THREE.TextureLoader()
  let disposed = false
  if (options.immersive) {
    const showcase = projects.slice(0, 3)
    for (let i = 0; i < showcase.length; i++) {
      const panel = new THREE.Group()
      const frameMaterial = ink.clone()
      const frame = new THREE.Mesh(
        new RoundedBoxGeometry(2.65, 1.82, 0.09, 3, 0.06),
        frameMaterial,
      )
      panel.add(frame)
      const screenMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0,
      })
      panelMaterials.push(frameMaterial, screenMaterial)
      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.66),
        screenMaterial,
      )
      screen.position.z = 0.055
      panel.add(screen)
      const url = showcase[i]!.image
      const texture = loader.load(url, (loaded) => {
        if (disposed) {
          loaded.dispose()
          return
        }
        loaded.colorSpace = THREE.SRGBColorSpace
        screenMaterial.map = loaded
        screenMaterial.needsUpdate = true
      })
      textures.push(texture)
      // Small signal rail on the back remains visible as the cards orbit.
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.025, 0.02), blue)
      rail.position.set(0, -0.75, -0.06)
      panel.add(rail)
      root.add(panel)
      panels.push(panel)
      const angle = (i * Math.PI * 2) / 3 + 0.3
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * 3.2, Math.sin(angle) * 2.5, -0.3),
        new THREE.Vector3(
          Math.cos(angle + 0.5) * 2,
          Math.sin(angle + 0.5) * 1.6,
          1.1,
        ),
        new THREE.Vector3(0, 0, 0),
      ])
      paths.push(curve)
      const line = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 50, 0.012, 5, false),
        new THREE.MeshBasicMaterial({
          color: '#4c6dff',
          transparent: true,
          opacity: 0,
        }),
      )
      pathLines.push(line)
      root.add(line)
      for (let j = 0; j < 3; j++) {
        const packet = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 6),
          new THREE.MeshBasicMaterial({
            color: '#a5c5ff',
            transparent: true,
            opacity: 0,
          }),
        )
        root.add(packet)
        packets.push(packet)
      }
    }
  }
  // A Fibonacci constellation changes from ambient dust into an organized system.
  const count = options.compact ? 65 : options.immersive ? 360 : 170
  const positions = new Float32Array(count * 3)
  const seeds: THREE.Vector3[] = []
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2,
      r = Math.sqrt(1 - y * y),
      phi = i * Math.PI * (3 - Math.sqrt(5))
    seeds.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
  }
  const particlesGeometry = new THREE.BufferGeometry()
  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3),
  )
  const particlesMaterial = new THREE.PointsMaterial({
    color: options.dark ? '#7299ff' : '#506ab1',
    size: options.immersive ? 0.029 : 0.022,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: options.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  root.add(particles)
  const connectionPositions = new Float32Array(80 * 6)
  const connectionGeometry = new THREE.BufferGeometry()
  connectionGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(connectionPositions, 3),
  )
  const connectionMaterial = new THREE.LineBasicMaterial({
    color: '#456fff',
    transparent: true,
    opacity: 0,
  })
  const connections = new THREE.LineSegments(
    connectionGeometry,
    connectionMaterial,
  )
  root.add(connections)

  const arrival = { value: 0 }
  const assembly = gsap.to(arrival, {
    value: 1,
    duration: 1.6,
    ease: 'power3.out',
    paused: true,
  })
  const stage = host.closest<HTMLElement>('.kinetic-stage')
  let visible = false,
    lost = false,
    first = true,
    lastFrame = 0,
    elapsed = 0
  let targetProgress = 0,
    progress = 0,
    pointerX = 0,
    pointerY = 0,
    dragX = 0,
    dragY = 0
  let dragging = false,
    lastX = 0,
    lastY = 0
  function scroll() {
    if (!stage) return
    targetProgress = THREE.MathUtils.clamp(
      -stage.getBoundingClientRect().top /
        Math.max(1, stage.offsetHeight - innerHeight),
      0,
      1,
    )
  }
  function size() {
    const w = Math.max(1, host.clientWidth),
      h = Math.max(1, host.clientHeight)
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    scroll()
  }
  const resize = new ResizeObserver(size)
  resize.observe(host)
  size()
  const observe = new IntersectionObserver(
    ([entry]) => {
      visible = entry!.isIntersecting
      if (visible && arrival.value === 0) assembly.play()
      lastFrame = 0
    },
    { rootMargin: '100px' },
  )
  observe.observe(host)
  function pointer(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    const rect = host.getBoundingClientRect()
    pointerX = (event.clientX - rect.left) / rect.width - 0.5
    pointerY = (event.clientY - rect.top) / rect.height - 0.5
    if (dragging) {
      dragY += (event.clientX - lastX) * 0.006
      dragX = THREE.MathUtils.clamp(
        dragX + (event.clientY - lastY) * 0.004,
        -0.45,
        0.45,
      )
      lastX = event.clientX
      lastY = event.clientY
    }
  }
  function down(event: PointerEvent) {
    if (event.pointerType === 'touch' || event.button !== 0) return
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    host.setPointerCapture(event.pointerId)
    host.classList.add('dragging')
  }
  function up() {
    dragging = false
    host.classList.remove('dragging')
  }
  function leave() {
    pointerX = 0
    pointerY = 0
  }
  function replay() {
    assembly.restart()
    if (!visible) assembly.pause(0)
  }
  function onLost(event: Event) {
    event.preventDefault()
    lost = true
    options.onLost()
  }
  function onRestore() {
    lost = false
    first = true
  }
  const render = (now: number) => {
    if (!visible || document.hidden || lost) {
      lastFrame = 0
      return
    }
    if (lastFrame && now - lastFrame < 1000 / (options.compact ? 30 : 45))
      return
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, 0.06) : 0.016
    lastFrame = now
    elapsed += dt
    const t = elapsed
    progress = THREE.MathUtils.damp(progress, targetProgress, 9, dt)
    const story = sceneStory(progress)
    const open = options.immersive ? story.open : 0
    const unassembled = 1 - arrival.value
    root.rotation.x = THREE.MathUtils.damp(
      root.rotation.x,
      -0.13 +
        pointerY * 0.18 +
        dragX +
        (options.immersive ? Math.sin(progress * Math.PI * 2) * 0.1 : 0),
      5,
      dt,
    )
    root.rotation.y = THREE.MathUtils.damp(
      root.rotation.y,
      -0.25 +
        pointerX * 0.3 +
        dragY +
        (options.immersive ? progress * 1.25 : Math.sin(t * 0.16) * 0.22),
      5,
      dt,
    )
    root.rotation.z = -0.17 + Math.sin(t * 0.21) * 0.045
    root.position.y = Math.sin(t * 0.65) * 0.09
    const baseDistance = options.immersive
      ? camera.aspect < 0.95
        ? 15.5
        : 13
      : camera.aspect < 0.95
        ? 11.8
        : 10.6
    camera.position.set(
      Math.sin(progress * Math.PI) * 0.65,
      0.25 + Math.sin(progress * Math.PI * 2) * 0.55,
      baseDistance + open * 2.5 - story.resolve * 0.7,
    )
    camera.lookAt(0, 0, 0)
    sculpture.rotation.z = t * 0.09 + progress * 0.5
    arcs.forEach((arc, i) => {
      const angle = (i * Math.PI * 2) / 3 + Math.PI / 3
      const spread = open * 1.55 + unassembled * 2
      arc.position.set(
        Math.cos(angle) * spread,
        Math.sin(angle) * spread,
        (i - 1) * open * 0.65,
      )
      arc.rotation.set(open * (i - 1) * 0.3, open * 0.55, open * (i - 1) * 0.22)
    })
    core.rotation.set(t * 0.14, t * 0.23, 0)
    core.scale.setScalar(
      (1 + Math.sin(t * 1.2) * 0.035) *
        (1 + story.network * 0.3 + story.resolve * 0.18),
    )
    blue.emissiveIntensity = 0.18 + story.network * 0.8 + story.resolve * 0.4
    innerRing.rotation.y = t * 0.27
    innerRing.rotation.x = t * 0.18
    outerOrbit.rotation.set(0.1 + t * 0.025, t * 0.045 + progress, -0.2)
    outerOrbit.scale.setScalar(1 + open * 0.36)
    satellites.forEach((dot, i) => {
      const angle = t * (0.2 + i * 0.025) + i * 1.5
      const radius = 2.75 + i * 0.13 + open
      dot.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.7,
        Math.sin(angle + i) * 1.2,
      )
    })
    panels.forEach((panel, i) => {
      const angle = (i * Math.PI * 2) / 3 + 0.3
      const radius = 0.3 + story.layers * 3.5
      panel.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.76,
        0.2 + (i - 1) * story.layers * 0.5,
      )
      panel.rotation.set(
        -0.12 + i * 0.08,
        -0.25 - progress * 0.7,
        (i - 1) * 0.12,
      )
      panel.scale.setScalar(Math.max(0.001, story.layers))
      panel.visible = story.layers > 0.005
      const screen = panelMaterials[i * 2 + 1] as THREE.MeshBasicMaterial
      screen.opacity = story.layers
    })
    pathLines.forEach((line) => {
      ;(line.material as THREE.MeshBasicMaterial).opacity = story.network * 0.65
    })
    packets.forEach((packet, i) => {
      const curve = paths[Math.floor(i / 3)]!
      packet.position.copy(curve.getPoint((t * 0.22 + (i % 3) / 3) % 1))
      ;(packet.material as THREE.MeshBasicMaterial).opacity = story.network
    })
    for (let i = 0; i < count; i++) {
      const seed = seeds[i]!
      const radius =
        2.7 +
        story.network * 0.85 +
        Math.sin(t * 0.3 + i) * 0.1 -
        story.resolve * 0.8
      const angle = t * 0.035 + (1 - story.network) * Math.sin(i * 1.7) * 0.15
      positions[i * 3] =
        (seed.x * Math.cos(angle) - seed.z * Math.sin(angle)) * radius
      positions[i * 3 + 1] = seed.y * radius
      positions[i * 3 + 2] =
        (seed.x * Math.sin(angle) + seed.z * Math.cos(angle)) * radius
    }
    particlesGeometry.attributes.position!.needsUpdate = true
    particlesMaterial.opacity = 0.25 + story.network * 0.65
    for (let i = 0; i < 80; i++) {
      const a = (i * 3) % count,
        b = (a + 5) % count
      for (let axis = 0; axis < 3; axis++) {
        connectionPositions[i * 6 + axis] = positions[a * 3 + axis]!
        connectionPositions[i * 6 + axis + 3] = positions[b * 3 + axis]!
      }
    }
    connectionGeometry.attributes.position!.needsUpdate = true
    connectionMaterial.opacity = options.immersive ? story.network * 0.28 : 0
    root.scale.setScalar(0.72 + arrival.value * 0.28)
    renderer.render(scene, camera)
    if (first) {
      first = false
      options.onReady()
    }
  }
  renderer.setAnimationLoop(render)
  host.addEventListener('pointermove', pointer)
  host.addEventListener('pointerdown', down)
  host.addEventListener('pointerup', up)
  host.addEventListener('lostpointercapture', up)
  host.addEventListener('pointerleave', leave)
  window.addEventListener('scroll', scroll, { passive: true })
  window.addEventListener(REPLAY_SIGNATURE, replay)
  renderer.domElement.addEventListener('webglcontextlost', onLost)
  renderer.domElement.addEventListener('webglcontextrestored', onRestore)
  scroll()
  return () => {
    disposed = true
    assembly.kill()
    resize.disconnect()
    observe.disconnect()
    renderer.setAnimationLoop(null)
    host.removeEventListener('pointermove', pointer)
    host.removeEventListener('pointerdown', down)
    host.removeEventListener('pointerup', up)
    host.removeEventListener('lostpointercapture', up)
    host.removeEventListener('pointerleave', leave)
    window.removeEventListener('scroll', scroll)
    window.removeEventListener(REPLAY_SIGNATURE, replay)
    renderer.domElement.removeEventListener('webglcontextlost', onLost)
    renderer.domElement.removeEventListener('webglcontextrestored', onRestore)
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
    textures.forEach((texture) => texture.dispose())
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
