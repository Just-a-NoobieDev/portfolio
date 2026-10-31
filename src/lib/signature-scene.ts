import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'
import { REPLAY_SIGNATURE } from './motion-preference'
type Options = {
  compact: boolean
  immersive: boolean
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
  renderer.shadowMap.type = THREE.PCFShadowMap
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
  key.shadow.radius = 4
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
  const rotations = pieces.map((piece) => piece.rotation.clone())
  const arrival = { value: options.reducedMotion ? 1 : 0 }
  const assembly = gsap
    .timeline({ paused: true })
    .to(arrival, { value: 1, duration: 2.2, ease: 'power3.out' })
  const orbit = new THREE.Group()
  const rings: THREE.Mesh[] = []
  if (options.immersive) {
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.55 + i * 0.3, 0.012, 6, 96),
        new THREE.MeshStandardMaterial({
          color: i === 1 ? '#2448ff' : '#777f91',
          metalness: 0.8,
          roughness: 0.3,
          transparent: true,
          opacity: 0.65,
        }),
      )
      ring.rotation.set(Math.PI * (0.28 + i * 0.19), i * 0.8, 0.25)
      orbit.add(ring)
      rings.push(ring)
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const dot = new THREE.Mesh(
        new THREE.IcosahedronGeometry(i % 3 === 0 ? 0.09 : 0.04, 1),
        i % 3 === 0 ? blue : silver,
      )
      dot.position.set(
        Math.cos(angle) * 3,
        Math.sin(angle) * 2.4,
        Math.sin(angle * 2) * 0.7,
      )
      orbit.add(dot)
    }
    scene.add(orbit)
    camera.position.z = 12
  }
  let pointerX = 0,
    pointerY = 0,
    visible = true,
    lost = false,
    first = true,
    scrollProgress = 0,
    dirty = true
  let dragging = false,
    lastX = 0,
    lastY = 0,
    dragX = 0,
    dragY = 0,
    spinning = false,
    spinAngle = 0,
    lastFrame = 0
  const stage = host.closest<HTMLElement>('.kinetic-stage')
  function onPointer(event: PointerEvent) {
    if (options.reducedMotion || event.pointerType === 'touch') return
    dirty = true
    if (dragging) {
      dragY += (event.clientX - lastX) * 0.009
      dragX = THREE.MathUtils.clamp(
        dragX + (event.clientY - lastY) * 0.006,
        -0.5,
        0.5,
      )
      lastX = event.clientX
      lastY = event.clientY
    }
    const rect = host.getBoundingClientRect()
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.5
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22
  }
  function startDrag(event: PointerEvent) {
    if (
      options.reducedMotion ||
      event.pointerType === 'touch' ||
      (event.target as Element).closest('button')
    )
      return
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    host.setPointerCapture(event.pointerId)
    host.classList.add('dragging')
  }
  function stopDrag() {
    dragging = false
    host.classList.remove('dragging')
  }
  function spin(event: Event) {
    spinning = (event as CustomEvent<boolean>).detail
    dirty = true
  }
  function replay() {
    if (!options.reducedMotion) {
      assembly.restart()
      if (!visible) assembly.pause(0)
      dirty = true
    }
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
    scrollProgress = stage
      ? THREE.MathUtils.clamp(
          -stage.getBoundingClientRect().top /
            Math.max(1, stage.offsetHeight - innerHeight),
          0,
          1,
        )
      : THREE.MathUtils.clamp(-rect.top / innerHeight, 0, 1)
  }
  function size() {
    dirty = true
    const w = host.clientWidth,
      h = host.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.position.z = options.immersive
      ? camera.aspect < 0.9
        ? 15
        : 11.5
      : camera.aspect < 0.9
        ? 12
        : 10
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
  const render = (time: number) => {
    if (!visible || document.hidden || lost) return
    if (time - lastFrame < 1000 / 40 && !first) return
    const dt = Math.min((time - lastFrame) / 1000, 0.05)
    lastFrame = time
    if (options.reducedMotion && !dirty && !first) return
    dirty = false
    const seconds = time / 1000
    if (spinning && !options.reducedMotion) spinAngle += dt * 0.48
    const breath = options.reducedMotion ? 0 : Math.sin(seconds * 0.5) * 0.055
    const explode = options.immersive
      ? Math.sin(scrollProgress * Math.PI) * 1.8
      : scrollProgress * 0.55
    if (options.immersive)
      camera.position.z = (camera.aspect < 0.9 ? 15 : 11.5) + explode * 1.1
    const unassembled = 1 - arrival.value
    pieces.forEach((piece, i) => {
      const base = rest[i]
      const direction = i === 0 ? -1 : i === 1 ? 1 : i % 2 ? -0.8 : 0.8
      piece.position.copy(base)
      piece.position.x +=
        direction * (unassembled * 2 + explode * (i < 2 ? 0.75 : 1.1))
      piece.position.y +=
        unassembled * (i % 2 ? -0.6 : 0.6) +
        (i > 5 && !options.reducedMotion
          ? Math.sin(seconds * 0.75 + i) * 0.12
          : 0)
      piece.position.z +=
        unassembled * (i % 2 ? 0.8 : -0.8) + explode * (i % 2 ? 0.38 : -0.38)
      piece.rotation.copy(rotations[i])
      piece.rotation.y += unassembled * (i % 2 ? 0.5 : -0.5)
      if (i > 5 && !options.reducedMotion) piece.rotation.z += seconds * 0.13
    })
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      -0.32 +
        pointerX +
        dragY +
        spinAngle +
        breath +
        scrollProgress * (options.immersive ? 0.75 : 0.3),
      0.07,
    )
    group.rotation.x = THREE.MathUtils.lerp(
      group.rotation.x,
      -0.1 + pointerY + dragX,
      0.07,
    )
    group.position.y = options.immersive ? 0 : -scrollProgress * 0.3
    if (!options.reducedMotion)
      orbit.rotation.y = seconds * 0.08 + scrollProgress * 0.5
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
  host.addEventListener('pointerdown', startDrag)
  host.addEventListener('pointerup', stopDrag)
  host.addEventListener('lostpointercapture', stopDrag)
  host.addEventListener('signature:spin', spin)
  window.addEventListener(REPLAY_SIGNATURE, replay)
  host.addEventListener('pointermove', onPointer)
  host.addEventListener('pointerleave', reset)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    assembly.kill()
    resize.disconnect()
    observe.disconnect()
    renderer.setAnimationLoop(null)
    host.removeEventListener('pointerdown', startDrag)
    host.removeEventListener('pointerup', stopDrag)
    host.removeEventListener('lostpointercapture', stopDrag)
    host.removeEventListener('signature:spin', spin)
    window.removeEventListener(REPLAY_SIGNATURE, replay)
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
