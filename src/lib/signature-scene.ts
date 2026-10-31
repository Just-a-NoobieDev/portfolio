import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'
type Options = {
  compact: boolean
  dark: boolean
  reducedMotion: boolean
  onReady: () => void
  onLost: () => void
}
export function createSignature(host: HTMLElement, options: Options) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = options.dark ? 1.6 : 1.25
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 50)
  camera.position.set(0.5, 1, 10)
  camera.lookAt(0, 0, 0)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  scene.environment = environment.texture
  room.dispose()
  const key = new THREE.DirectionalLight(0xffffff, 6)
  key.position.set(-3, 6, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -5
  key.shadow.camera.right = 5
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -5
  key.shadow.bias = -0.001
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.7))
  const rim = new THREE.DirectionalLight(0x829dff, 3)
  rim.position.set(4, 2, -3)
  scene.add(rim)
  const graphite = new THREE.MeshStandardMaterial({
    color: '#292b30',
    metalness: 0.88,
    roughness: 0.3,
  })
  const blue = new THREE.MeshPhysicalMaterial({
    color: '#0024ff',
    metalness: 0.4,
    roughness: 0.21,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
  })
  const silver = new THREE.MeshStandardMaterial({
    color: '#d0d1d6',
    metalness: 1,
    roughness: 0.24,
  })
  const inset = new THREE.MeshStandardMaterial({
    color: '#101215',
    metalness: 0.4,
    roughness: 0.45,
  })
  const group = new THREE.Group()
  group.rotation.set(-0.1, -0.32, -0.07)
  scene.add(group)
  const pieces: THREE.Mesh[] = []
  function add(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
  ) {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
    pieces.push(mesh)
    return mesh
  }
  const c = new THREE.Shape()
  c.absarc(-0.75, 0.12, 1.5, Math.PI * 0.23, Math.PI * 1.77, false)
  c.lineTo(
    -0.75 + Math.cos(Math.PI * 1.77) * 0.81,
    0.12 + Math.sin(Math.PI * 1.77) * 0.81,
  )
  c.absarc(-0.75, 0.12, 0.81, Math.PI * 1.77, Math.PI * 0.23, true)
  c.closePath()
  const extrude = {
    depth: 0.62,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.075,
    bevelThickness: 0.075,
    curveSegments: 64,
  }
  add(new THREE.ExtrudeGeometry(c, extrude), graphite, 0, 0.15, 0)
  const j = new THREE.Shape()
  j.moveTo(0.76, 1.65)
  j.lineTo(1.5, 1.65)
  j.lineTo(1.5, -0.48)
  j.bezierCurveTo(1.5, -1.35, 1, -1.72, 0.26, -1.72)
  j.bezierCurveTo(-0.53, -1.72, -0.95, -1.29, -0.95, -0.58)
  j.lineTo(-0.22, -0.58)
  j.bezierCurveTo(-0.22, -0.9, -0.05, -1, 0.26, -1)
  j.bezierCurveTo(0.56, -1, 0.76, -0.82, 0.76, -0.48)
  j.closePath()
  add(new THREE.ExtrudeGeometry(j, extrude), blue, 0.27, -0.12, 0.18)
  for (const [x, y, z, rotation] of [
    [0.27, 1.18, 0.75, -0.32],
    [-0.25, -0.65, 0.86, 0.12],
  ]) {
    const plate = add(
      new RoundedBoxGeometry(0.29, 0.55, 0.12, 4, 0.06),
      silver,
      x,
      y,
      z,
    )
    plate.rotation.z = rotation
    const bolt = add(
      new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16),
      inset,
      x,
      y + 0.12,
      z + 0.09,
    )
    bolt.rotation.x = Math.PI / 2
  }
  const connector = add(
    new RoundedBoxGeometry(0.35, 0.4, 0.3, 4, 0.06),
    silver,
    -2,
    -0.78,
    0.9,
  )
  connector.rotation.set(0.35, 0.5, -0.32)
  const small = add(
    new THREE.TorusGeometry(0.13, 0.065, 12, 24),
    silver,
    1.87,
    1.4,
    0.3,
  )
  small.rotation.set(0.25, 0.6, 0.1)
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.ShadowMaterial({ opacity: options.dark ? 0.1 : 0.045 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -2.02
  floor.receiveShadow = true
  scene.add(floor)
  const rest = pieces.map((piece) => piece.position.clone())
  const assembly = gsap.timeline({ paused: true })
  if (!options.reducedMotion)
    pieces.forEach((piece, i) => {
      const base = rest[i]
      piece.position.x += i % 2 ? 0.6 : -0.6
      piece.position.y += i % 2 ? -0.15 : 0.25
      assembly.to(
        piece.position,
        { x: base.x, y: base.y, z: base.z, duration: 1.65, ease: 'power3.out' },
        0.1 + i * 0.035,
      )
    })
  let pointerX = 0,
    pointerY = 0,
    visible = true,
    lost = false,
    first = true,
    scrollProgress = 0,
    dirty = true
  function onPointer(event: PointerEvent) {
    if (options.reducedMotion || event.pointerType === 'touch') return
    dirty = true
    const rect = host.getBoundingClientRect()
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.12
  }
  function reset() {
    pointerX = 0
    pointerY = 0
    dirty = true
  }
  function onScroll() {
    if (options.reducedMotion || options.compact) return
    dirty = true
    const rect = host.getBoundingClientRect()
    scrollProgress = Math.max(0, Math.min(1, -rect.top / innerHeight))
  }
  function size() {
    dirty = true
    const w = host.clientWidth,
      h = host.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.position.z = camera.aspect < 0.9 ? 12 : 10
    camera.updateProjectionMatrix()
  }
  const resize = new ResizeObserver(size)
  resize.observe(host)
  size()
  const observe = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting
      dirty = true
      if (visible && assembly.progress() === 0) assembly.play()
    },
    { rootMargin: '80px' },
  )
  observe.observe(host)
  const render = () => {
    if (!visible || document.hidden || lost) return
    const settling =
      Math.abs(group.rotation.y - (-0.32 + pointerX + scrollProgress * 0.2)) +
        Math.abs(group.rotation.x - (-0.1 + pointerY)) >
      0.0001
    if (!dirty && !first && !assembly.isActive() && !settling) return
    dirty = false
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      -0.32 + pointerX + scrollProgress * 0.2,
      0.06,
    )
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      -0.1 + pointerY,
      0.06,
    )
    group.position.y = -scrollProgress * 0.22
    renderer.render(scene, camera)
    if (first) {
      first = false
      options.onReady()
    }
  }
  function onLost(event: Event) {
    event.preventDefault()
    lost = true
    options.onLost()
  }
  function onRestore() {
    lost = false
    dirty = true
    first = true
  }
  renderer.domElement.addEventListener('webglcontextlost', onLost)
  renderer.domElement.addEventListener('webglcontextrestored', onRestore)
  renderer.setAnimationLoop(render)
  host.addEventListener('pointermove', onPointer)
  host.addEventListener('pointerleave', reset)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    assembly.kill()
    resize.disconnect()
    observe.disconnect()
    renderer.setAnimationLoop(null)
    host.removeEventListener('pointermove', onPointer)
    host.removeEventListener('pointerleave', reset)
    window.removeEventListener('scroll', onScroll)
    renderer.domElement.removeEventListener('webglcontextlost', onLost)
    renderer.domElement.removeEventListener('webglcontextrestored', onRestore)
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]
        materials.forEach((material) => material.dispose())
      }
    })
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
