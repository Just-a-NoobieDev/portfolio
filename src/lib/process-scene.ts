import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { heroHandoff } from './hero-handoff'
import { createProcessWindow } from './process-window'
import { createFinishedExperience } from './finished-experience'
import { createDeveloperDesk } from './developer-desk'
import { processProgress, smooth } from './process-progress'
import { orbContinuity } from './orb-continuity'

export function createProcessExperience(
  host: HTMLElement,
  layer: HTMLElement,
  story: HTMLElement,
  onReady: () => void,
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.setClearColor(0, 0)
  renderer.autoClear = false
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)
  const processWindow = createProcessWindow(renderer)
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.z = 10
  const processCamera = camera.clone()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  room.dispose()
  const heroScene = new THREE.Scene(),
    orbScene = new THREE.Scene(),
    processScene = new THREE.Scene()
  for (const scene of [heroScene, orbScene, processScene]) {
    scene.environment = environment.texture
    const key = new THREE.DirectionalLight('#ffffff', 3)
    key.position.set(-4, 6, 7)
    const rim = new THREE.DirectionalLight('#6a88ff', 2.2)
    rim.position.set(5, 1, -4)
    scene.add(key, rim, new THREE.AmbientLight('#e5ebff', 1))
  }
  const chrome = new THREE.MeshPhysicalMaterial({
    color: '#aab5ce',
    metalness: 1,
    roughness: 0.19,
    clearcoat: 1,
  })
  const blue = new THREE.MeshPhysicalMaterial({
    color: '#153eff',
    metalness: 0.25,
    roughness: 0.19,
    clearcoat: 1,
    emissive: '#0822cb',
    emissiveIntensity: 0.18,
  })
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: '#f4f6ff',
    metalness: 0.15,
    roughness: 0.25,
    clearcoat: 1,
  })
  const traceMaterial = new THREE.LineBasicMaterial({
    color: '#3158f1',
    transparent: true,
    opacity: 0.55,
  })
  const developer = createDeveloperDesk()
  const hero = developer.group
  heroScene.add(hero)
  // This group remains the same instance from the hero to the launch handoff.
  const orb = new THREE.Group()
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.64, 40, 28), blue))
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.017, 8, 100),
    chrome,
  )
  halo.rotation.set(0.7, 0.4, 0.3)
  orb.add(halo)
  orbScene.add(orb)
  orbContinuity.orb = orb
  orbContinuity.home = orbScene
  orbContinuity.inClosing = false

  const world = new THREE.Group()
  processScene.add(world)
  const blueprint = new THREE.Group()
  world.add(blueprint)
  const grid = new THREE.GridHelper(9, 24, '#5576ed', '#b2c2ec')
  grid.position.y = -1.75
  blueprint.add(grid)
  const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(7.6, 5.7),
    new THREE.MeshBasicMaterial({
      color: '#e4ebff',
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  plan.rotation.x = -Math.PI / 2
  plan.position.y = -1.77
  blueprint.add(plan)

  // Physical layers: experience, logic, and data. Each has a distinct structure.
  const machine = new THREE.Group()
  world.add(machine)
  const finished = createFinishedExperience()
  const decks: THREE.Group[] = []
  const deckDetails: THREE.Group[] = []
  const deckTargets = [-1.15, 0, 1.15]
  const labelTextures: THREE.CanvasTexture[] = []
  function label(text: string, color = '#2845a0') {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 128
    const context = canvas.getContext('2d')!
    context.fillStyle = '#f7f8ff'
    context.beginPath()
    context.roundRect(3, 3, 634, 122, 25)
    context.fill()
    context.strokeStyle = '#c1cdef'
    context.lineWidth = 2
    context.stroke()
    context.fillStyle = color
    context.font = '500 36px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, 320, 66)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    labelTextures.push(texture)
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      }),
    )
    sprite.scale.set(1.85, 0.37, 1)
    return sprite
  }
  for (let i = 0; i < 3; i++) {
    const deck = new THREE.Group()
    // These very same panels become the finished enclosure; no replacement mesh.
    deck.add(finished.layers[i]!)
    const details = new THREE.Group()
    deck.add(details)
    deckDetails.push(details)
    const chip = new THREE.Mesh(
      new RoundedBoxGeometry(
        i === 1 ? 1.1 : 0.85,
        0.22,
        i === 1 ? 1.1 : 0.85,
        2,
        0.035,
      ),
      blue,
    )
    chip.position.y = 0.23
    details.add(chip)
    for (let j = 0; j < 12; j++) {
      const angle = (j * Math.PI) / 6
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(0.035, 0.05, 0.24),
        chrome,
      )
      pin.position.set(Math.cos(angle) * 0.76, 0.15, Math.sin(angle) * 0.76)
      pin.rotation.y = -angle + Math.PI / 2
      details.add(pin)
    }
    for (const sign of [-1, 1]) {
      const channel = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.025, 0.025),
        blue,
      )
      channel.position.set(sign * 1.22, 0.12, 0.4 * (i - 1))
      details.add(channel)
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), blue)
      node.position.set(sign * 1.65, 0.15, 0.4 * (i - 1))
      details.add(node)
    }
    const caption = label(['DATA', 'APPLICATION LOGIC', 'EXPERIENCE'][i]!)
    caption.position.set(2.65, 0.1, 0)
    details.add(caption)
    machine.add(deck)
    decks.push(deck)
  }
  const supports: THREE.Mesh[] = []
  for (const x of [-1.5, 1.5])
    for (const z of [-0.95, 0.95]) {
      const support = new THREE.Mesh(
        new THREE.CylinderGeometry(0.027, 0.027, 2.3, 8),
        chrome,
      )
      support.position.set(x, 0, z)
      machine.add(support)
      supports.push(support)
    }
  const scan = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.014, 6, 120),
    new THREE.MeshBasicMaterial({
      color: '#325dff',
      transparent: true,
      opacity: 0.75,
    }),
  )
  scan.rotation.x = Math.PI / 2
  machine.add(scan)
  const technicalMaterials: { material: THREE.Material; opacity: number }[] = []
  const fadingMaterials = new Map<THREE.Material, THREE.Material>()
  // Clones let the construction fade without fading the shared orb.
  for (const root of [...deckDetails, ...supports, scan, blueprint])
    root.traverse((object) => {
      if (!(
        object instanceof THREE.Mesh ||
        object instanceof THREE.Line ||
        object instanceof THREE.Sprite
      ))
        return
      const fade = (source: THREE.Material) => {
        if (fadingMaterials.has(source)) return fadingMaterials.get(source)!
        const material = source.clone()
        material.transparent = true
        fadingMaterials.set(source, material)
        technicalMaterials.push({ material, opacity: source.opacity })
        return material
      }
      object.material = Array.isArray(object.material)
        ? object.material.map(fade)
        : fade(object.material)
    })

  const questionNodes: THREE.Mesh[] = []
  const tangled: THREE.Line[] = []
  const ideas = new THREE.Group()
  world.add(ideas)
  for (let i = 0; i < 18; i++) {
    const node = new THREE.Mesh(
      new THREE.IcosahedronGeometry(i % 4 === 0 ? 0.13 : 0.06, 2),
      i % 4 === 0 ? blue : chrome,
    )
    ideas.add(node)
    questionNodes.push(node)
  }
  for (let i = 0; i < 5; i++) {
    const curve = new THREE.CatmullRomCurve3(
      Array.from({ length: 24 }, (_, j) => {
        const u = (j / 23) * Math.PI * 2
        return new THREE.Vector3(
          Math.sin(u + i) * (2 + i * 0.15),
          Math.cos(u * 1.5 + i) * 1.8,
          Math.sin(u * 2 + i) * 1.4,
        )
      }),
    )
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
      traceMaterial.clone(),
    )
    ideas.add(line)
    tangled.push(line)
  }
  const questions = ['YOUR GOALS', 'YOUR PEOPLE', 'THE CONSTRAINTS']
  for (let i = 0; i < 3; i++) {
    const caption = label(questions[i]!)
    caption.position.set((i - 1) * 2.2, 2.2 - (i % 2) * 4.3, 0)
    ideas.add(caption)
  }
  const paths: THREE.CatmullRomCurve3[] = [],
    tubes: THREE.Mesh[] = [],
    packets: THREE.Mesh[] = []
  for (let i = 0; i < 3; i++) {
    const y = deckTargets[i]!
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, y, 0.7),
      new THREE.Vector3(-1.65, y + 0.16, 0),
      new THREE.Vector3(0, y + 0.42, 0),
      new THREE.Vector3(1.65, y + 0.16, 0),
      new THREE.Vector3(3.4, y + 0.4, -1),
    ])
    paths.push(path)
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(path, 60, 0.017, 6, false),
      new THREE.MeshBasicMaterial({
        color: '#4067ff',
        transparent: true,
        opacity: 0.6,
      }),
    )
    world.add(tube)
    tubes.push(tube)
    for (let j = 0; j < 3; j++) {
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 8),
        blue,
      )
      world.add(packet)
      packets.push(packet)
    }
  }

  const heroAnchor = story.querySelector<HTMLElement>('[data-process-orb]')!
  const heroSection = heroAnchor.closest('section')!
  const heroRunway = heroSection.parentElement!
  let heroPinTop = 0,
    pinDistance = 1,
    layoutFrame = 0
  const flow = story.querySelector<HTMLElement>('.page-line-flow')!
  const section = story.querySelector<HTMLElement>('#process')!
  const sticky = section.querySelector<HTMLElement>('.process-sticky')!
  const frameHost = section.querySelector<HTMLElement>('.process-frame')!
  const closing = story.querySelector<HTMLElement>('#connection')!
  const stroke = flow.querySelector<SVGPathElement>('.scroll-thread path')!
  const flightSvg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  )
  flightSvg.classList.add('hero-flight-thread')
  flightSvg.setAttribute('aria-hidden', 'true')
  const flightStroke = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path',
  )
  flightSvg.appendChild(flightStroke)
  story.appendChild(flightSvg)
  let launchLocal: THREE.Vector3 | undefined

  let width = 1,
    height = 1,
    viewportTop = 0,
    animation = 0,
    last = 0,
    disposed = false,
    visible = true,
    ready = false
  const pointer = new THREE.Vector2(),
    easedPointer = new THREE.Vector2()
  const pointerMove = (event: PointerEvent) =>
    pointer.set(event.clientX / width - 0.5, event.clientY / height - 0.5)
  let dragging = false,
    dragX = 0,
    dragY = 0
  const rotation = { yaw: 0.35, pitch: 0.16 }
  const easedRotation = { ...rotation }
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return
    dragging = true
    dragX = event.clientX
    dragY = event.clientY
    heroAnchor.setPointerCapture(event.pointerId)
    heroAnchor.classList.add('is-dragging')
  }
  const drag = (event: PointerEvent) => {
    if (!dragging) return
    rotation.yaw = THREE.MathUtils.clamp(
      rotation.yaw + (event.clientX - dragX) * 0.005,
      0.15,
      0.75,
    )
    rotation.pitch = THREE.MathUtils.clamp(
      rotation.pitch + (event.clientY - dragY) * 0.004,
      0.06,
      0.28,
    )
    dragX = event.clientX
    dragY = event.clientY
  }
  const up = () => {
    dragging = false
    heroAnchor.classList.remove('is-dragging')
  }
  const key = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      rotation.yaw = THREE.MathUtils.clamp(
        rotation.yaw + (event.key === 'ArrowRight' ? 0.15 : -0.15),
        0.15,
        0.75,
      )
    } else if (event.key === 'Home') {
      event.preventDefault()
      rotation.yaw = 0.35
      rotation.pitch = 0.16
    }
  }
  heroAnchor.addEventListener('pointerdown', down)
  heroAnchor.addEventListener('pointermove', drag)
  heroAnchor.addEventListener('pointerup', up)
  heroAnchor.addEventListener('pointercancel', up)
  heroAnchor.addEventListener('lostpointercapture', up)
  heroAnchor.addEventListener('keydown', key)
  const productControl = section.querySelector<HTMLElement>(
    '[data-product-rotate]',
  )!
  const explore = { yaw: 0, pitch: 0, easedYaw: 0, easedPitch: 0, side: 0 }
  let productDragging = false,
    productX = 0,
    productY = 0
  const productDown = (event: PointerEvent) => {
    if (event.button !== 0) return
    productDragging = true
    productX = event.clientX
    productY = event.clientY
    productControl.setPointerCapture(event.pointerId)
    productControl.classList.add('is-dragging')
  }
  const productMove = (event: PointerEvent) => {
    if (!productDragging) return
    explore.yaw = THREE.MathUtils.clamp(
      explore.yaw + (event.clientX - productX) * 0.007,
      -Math.PI * 2,
      Math.PI * 2,
    )
    explore.pitch = THREE.MathUtils.clamp(
      explore.pitch + (event.clientY - productY) * 0.004,
      -0.45,
      0.45,
    )
    productX = event.clientX
    productY = event.clientY
    productControl.setAttribute(
      'aria-valuenow',
      String(Math.round((explore.yaw * 180) / Math.PI)),
    )
  }
  const productUp = () => {
    productDragging = false
    productControl.classList.remove('is-dragging')
  }
  const productKey = (event: KeyboardEvent) => {
    if (['ArrowLeft', 'ArrowRight', 'Home'].includes(event.key)) {
      event.preventDefault()
      explore.yaw =
        event.key === 'Home'
          ? 0
          : THREE.MathUtils.clamp(
              explore.yaw + (event.key === 'ArrowRight' ? 0.15 : -0.15),
              -Math.PI * 2,
              Math.PI * 2,
            )
      if (event.key === 'Home') explore.pitch = 0
      productControl.setAttribute(
        'aria-valuenow',
        String(Math.round((explore.yaw * 180) / Math.PI)),
      )
    }
  }
  productControl.addEventListener('pointerdown', productDown)
  productControl.addEventListener('pointermove', productMove)
  productControl.addEventListener('pointerup', productUp)
  productControl.addEventListener('pointercancel', productUp)
  productControl.addEventListener('lostpointercapture', productUp)
  productControl.addEventListener('keydown', productKey)
  const measure = () => {
    width = host.clientWidth
    height = host.clientHeight
    renderer.setSize(width, height, false)
    processWindow.resize(width, height)
    const heroHeight = heroSection.offsetHeight
    heroPinTop = Math.min(0, height - heroHeight)
    pinDistance = height * 0.95
    const previous = heroRunway.style.getPropertyValue('--hero-height')
    heroRunway.style.setProperty('--hero-height', `${heroHeight}px`)
    heroRunway.style.setProperty('--hero-pin-top', `${heroPinTop}px`)
    if (previous !== `${heroHeight}px`) {
      cancelAnimationFrame(layoutFrame)
      layoutFrame = requestAnimationFrame(() =>
        window.dispatchEvent(new Event('hero-layout')),
      )
    }
    for (const cam of [camera, processCamera]) {
      cam.aspect = width / height
      cam.updateProjectionMatrix()
    }
    layer.style.height = `${closing.getBoundingClientRect().bottom - story.getBoundingClientRect().top}px`
  }
  const resize = new ResizeObserver(measure)
  resize.observe(host)
  resize.observe(heroSection)
  resize.observe(section)
  resize.observe(closing)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
  })
  intersection.observe(layer)
  window.addEventListener('pointermove', pointerMove, { passive: true })
  const unit = () =>
    (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10) / height
  const screen = (x: number, y: number) =>
    new THREE.Vector3(
      (x - width / 2) * unit(),
      (height / 2 - (y - viewportTop)) * unit(),
      0,
    )
  let easedRelease: number | undefined
  const render = (now: number) => {
    if (disposed) return
    animation = requestAnimationFrame(render)
    if (!visible || document.hidden || now - last < 1000 / 60) return
    layer.dataset.orbOwner = orbContinuity.inClosing ? 'closing' : 'flow'
    if (orbContinuity.inClosing) {
      renderer.clear()
      return
    }
    const delta = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = now / 1000
    const p = Number(section.style.getPropertyValue('--process-progress')) || 0
    const motion = processProgress(p)
    const rect = sticky.getBoundingClientRect()
    const afterProcess = section.getBoundingClientRect().bottom <= height + 1
    const inFrame = p > 0 && !afterProcess
    const parent = inFrame ? frameHost : host
    if (renderer.domElement.parentElement !== parent)
      parent.appendChild(renderer.domElement)
    viewportTop = inFrame ? 0 : host.getBoundingClientRect().top
    const sceneTop = inFrame ? 0 : rect.top
    const mobile = width <= 760
    easedPointer.lerp(pointer, 0.04)
    renderer.setScissorTest(false)
    renderer.clear()
    const anchor = heroAnchor.getBoundingClientRect()
    const heroScale =
      (Math.min(anchor.width, anchor.height) * unit()) /
      (width <= 760 ? 4.7 : 4.2)
    hero.position.copy(
      screen(
        anchor.left + anchor.width / 2 - (width <= 760 ? 0 : width * 0.04),
        anchor.top + anchor.height / 2 - (width <= 760 ? 0 : height * 0.06),
      ),
    )
    hero.scale.setScalar(heroScale)
    easedRotation.yaw = THREE.MathUtils.lerp(
      easedRotation.yaw,
      rotation.yaw,
      0.085,
    )
    easedRotation.pitch = THREE.MathUtils.lerp(
      easedRotation.pitch,
      rotation.pitch,
      0.085,
    )
    hero.rotation.set(
      easedRotation.pitch + easedPointer.y * 0.025,
      easedRotation.yaw + easedPointer.x * 0.035,
      0,
    )
    heroAnchor.setAttribute(
      'aria-valuenow',
      String(
        Math.round(
          ((((THREE.MathUtils.radToDeg(easedRotation.yaw) + 180) % 360) + 360) %
            360) -
            180,
        ),
      ),
    )
    const release = THREE.MathUtils.clamp(
      (heroPinTop - heroRunway.getBoundingClientRect().top) / pinDistance,
      0,
      1,
    )
    easedRelease =
      easedRelease === undefined
        ? release
        : THREE.MathUtils.damp(easedRelease, release, 10, delta)
    developer.animate(t, easedRelease)
    hero.updateMatrixWorld(true)

    const length =
      Number(stroke.getAttribute('stroke-dasharray')?.split(' ')[0]) || 0
    const offset = Number(stroke.getAttribute('stroke-dashoffset'))
    const point = stroke.getPointAtLength(
      Math.max(
        0,
        Math.min(length, length - (Number.isFinite(offset) ? offset : length)),
      ),
    )
    const flowRect = flow.getBoundingClientRect()
    const tip = screen(point.x + flowRect.left, point.y + flowRect.top)
    // The actual preview orb leaves the monitor, then joins the measured SVG tip.
    const origin = developer.orbOrigin.getWorldPosition(new THREE.Vector3())
    const handoff = heroHandoff(easedRelease)
    const palm = developer.orbHandoff.getWorldPosition(new THREE.Vector3())
    const arrival = palm.clone()
    arrival.y = Math.max(origin.y, palm.y)
    orb.position.copy(origin).lerp(arrival, handoff.emerge)
    orb.position.y += Math.sin(handoff.emerge * Math.PI) * heroScale * 0.14
    // The drawn flight and the orb use the same cubic, including its exact prefix.
    flightSvg.style.visibility =
      handoff.depart > 0 && flowRect.top > -height ? 'visible' : 'hidden'
    if (handoff.depart <= 0) launchLocal = undefined
    if (handoff.depart > 0) {
      if (!launchLocal) launchLocal = hero.worldToLocal(palm.clone())
      const flightStart = hero.localToWorld(launchLocal.clone())
      const project = (value: THREE.Vector3) => {
        const p = value.clone().project(camera)
        return new THREE.Vector2(
          ((p.x + 1) * width) / 2,
          ((1 - p.y) * height) / 2 + viewportTop,
        )
      }
      const from = project(flightStart)
      const beginning = stroke.getPointAtLength(0)
      const finish = new THREE.Vector2(
        beginning.x + flowRect.left,
        beginning.y + flowRect.top,
      )
      const outsideX = width - (mobile ? 18 : 30)
      const exit = new THREE.Vector2(outsideX, from.y + height * 0.12)
      const curves = [
        [
          from,
          new THREE.Vector2(from.x + width * 0.14, from.y - 24),
          new THREE.Vector2(outsideX, from.y - 24),
          exit,
        ],
        [
          exit,
          new THREE.Vector2(outsideX, exit.y + height * 0.22),
          new THREE.Vector2(finish.x + width * 0.14, finish.y),
          finish,
        ],
      ]
      const q = handoff.depart > 0.999 ? 1 : handoff.depart
      const storyTop = story.getBoundingClientRect().top
      let path = `M${from.x} ${from.y - storyTop}`
      let drawnTip = from.clone()
      for (let i = 0; i < curves.length; i++) {
        const local = THREE.MathUtils.clamp(
          (q - (i === 0 ? 0 : 0.42)) / (i === 0 ? 0.42 : 0.58),
          0,
          1,
        )
        if (local === 0) break
        const [p0, p1, p2, p3] = curves[i]!
        const first = p0!.clone().lerp(p1!, local),
          second = p1!.clone().lerp(p2!, local),
          third = p2!.clone().lerp(p3!, local)
        const control = first.clone().lerp(second, local),
          next = second.clone().lerp(third, local)
        drawnTip = control.clone().lerp(next, local)
        path += ` C${first.x} ${first.y - storyTop} ${control.x} ${control.y - storyTop} ${drawnTip.x} ${drawnTip.y - storyTop}`
      }
      orb.position.copy(q === 1 ? tip : screen(drawnTip.x, drawnTip.y))
      flightStroke.setAttribute('d', path)
    }
    developer.lookAtOrb(orb.position, delta, smooth(0.13, 0.24, easedRelease))
    if (anchor.bottom > 0) renderer.render(heroScene, camera)
    layer.dataset.heroRelease = release.toFixed(3)
    layer.dataset.heroDepart = handoff.depart.toFixed(3)
    const projectedHand = palm.clone().project(camera)
    layer.dataset.handX = String(
      Math.round(((projectedHand.x + 1) * width) / 2),
    )
    layer.dataset.handY = String(
      Math.round(((1 - projectedHand.y) * height) / 2 + viewportTop),
    )
    const pathSize = ((mobile ? 11 : 15) * unit()) / 0.64
    orb.scale.setScalar(
      THREE.MathUtils.lerp(
        THREE.MathUtils.lerp(
          heroScale * 0.29,
          heroScale * 0.32,
          handoff.emerge,
        ),
        pathSize,
        handoff.depart,
      ),
    )
    halo.rotation.y = t * 0.35
    halo.rotation.z = t * 0.14

    if (rect.top < height && section.getBoundingClientRect().bottom > 0) {
      const focus = motion.focus
      const left = (mobile ? 0.06 : 0.47) * (1 - focus) * width
      const right = (mobile ? 0.06 : 0.05) * (1 - focus) * width
      const top = (mobile ? 0.42 : 0.16) * (1 - focus) * height
      const bottom = (mobile ? 0.08 : 0.12) * (1 - focus) * height
      const scale =
        (mobile
          ? (width * unit()) / 7.8
          : Math.min(0.9, (width * unit()) / 13)) *
        (0.72 + focus * 0.28) *
        (1 + smooth(0.7, 0.93, p) * 0.15)
      world.scale.setScalar(scale)
      const completion = smooth(0.7, 0.93, p)
      const tilt = smooth(0.24, 0.46, p)
      const orbitAngle = smooth(0.44, 0.85, p) * 0.35
      processCamera.position.set(
        Math.sin(orbitAngle) * 8,
        tilt * (3.5 - completion * 2.3),
        10 - tilt * 1.5,
      )
      processCamera.lookAt(0, 0, 0)
      processCamera.updateMatrixWorld()
      const positionInProcessCamera = (x: number, y: number) => {
        const point = new THREE.Vector3(
          (x / width) * 2 - 1,
          1 - ((y - viewportTop) / height) * 2,
          0.5,
        ).unproject(processCamera)
        return point
          .sub(processCamera.position)
          .normalize()
          .multiplyScalar(10)
          .add(processCamera.position)
      }
      world.position.copy(
        positionInProcessCamera(
          (left + width - right) / 2 + (mobile ? 0 : width * 0.11) * focus,
          sceneTop + (top + height - bottom) / 2 + (mobile ? 70 : 45) * focus,
        ),
      )
      const constructionOpacity = 1 - smooth(0.7, 0.83, p)
      finished.setProgress(completion)
      finished.setView(section.dataset.productView || 'overview')
      const systemView = section.dataset.productSide === 'system' ? 1 : 0
      explore.side = THREE.MathUtils.damp(explore.side, systemView, 6, delta)
      explore.easedYaw = THREE.MathUtils.damp(
        explore.easedYaw,
        explore.yaw,
        9,
        delta,
      )
      explore.easedPitch = THREE.MathUtils.damp(
        explore.easedPitch,
        explore.pitch,
        9,
        delta,
      )
      machine.rotation.y = completion * (explore.easedYaw + explore.side * 0.75)
      machine.rotation.x = completion * explore.easedPitch
      machine.rotation.z = -completion * 0.015
      for (const item of technicalMaterials)
        item.material.opacity = item.opacity * constructionOpacity
      const ideaOpacity = 1 - motion.plan
      ideas.visible = ideaOpacity > 0.01
      ideas.scale.setScalar(0.1 + ideaOpacity * 0.9)
      for (let i = 0; i < questionNodes.length; i++) {
        const angle = i * 2.399 + t * 0.06
        const radius = 1.5 + (i % 4) * 0.42
        questionNodes[i]!.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle * 1.3) * 1.7,
          Math.sin(angle) * 1.2,
        )
      }
      for (const line of tangled)
        (line.material as THREE.LineBasicMaterial).opacity = ideaOpacity * 0.4
      blueprint.visible = motion.plan > 0.01 && constructionOpacity > 0.001
      blueprint.scale.setScalar(0.6 + motion.plan * 0.4)
      machine.visible = motion.plan > 0.01
      machine.scale.setScalar(0.15 + motion.plan * 0.85)
      for (let i = 0; i < decks.length; i++) {
        const deck = decks[i]!
        deck.position.set(
          (1 - motion.build) * (i - 1) * 2.2,
          THREE.MathUtils.lerp(
            -1.5 + (deckTargets[i]! + 1.5) * motion.build,
            0.1,
            completion,
          ),
          (1 - motion.build) * (i - 1) * 0.6 +
            completion * (i - 1) * (0.28 + explore.side * 0.9),
        )
        deck.rotation.y = (1 - motion.build) * (i - 1) * 0.35
        deck.rotation.x = (completion * Math.PI) / 2
        deck.scale.set(1, 0.04 + motion.build * 0.96, 1)
        const detail = deckDetails[i]!
        detail.position.y = -completion * 0.22
        detail.scale.setScalar(Math.max(0.001, 1 - smooth(0, 0.65, completion)))
        detail.visible = completion < 0.65
      }
      for (const support of supports) {
        support.scale.y = motion.build * (1 - completion)
        support.visible = completion < 0.95
      }
      scan.visible = motion.launch > 0 && motion.launch < 0.95
      scan.position.y = -1.5 + motion.launch * 3.2
      for (let i = 0; i < tubes.length; i++) {
        tubes[i]!.visible = motion.build > 0.45
        ;(tubes[i]!.material as THREE.MeshBasicMaterial).opacity =
          motion.build * 0.5 * constructionOpacity
      }
      for (let i = 0; i < packets.length; i++) {
        packets[i]!.visible = motion.launch > 0.15 && constructionOpacity > 0.1
        packets[i]!.position.copy(
          paths[Math.floor(i / 3)]!.getPoint((t * 0.14 + (i % 3) / 3) % 1),
        )
      }
      // A single rendered surface grows out from the line-contact point.
      processWindow.render(
        processScene,
        processCamera,
        focus,
        sceneTop - viewportTop,
      )
      if (inFrame) {
        const entry = screen(
          width * (mobile ? 0.1 : 0.51),
          height * (mobile ? 0.42 : 0.16),
        )
        const routePoint = paths[0]!.getPoint(
          0.22 + motion.plan * 0.2 + motion.build * 0.25,
        )
        routePoint.y += motion.build * 2.3
        const destination = world.localToWorld(routePoint)
        destination.lerp(
          world.localToWorld(new THREE.Vector3(2.4, 2.6, 0.6)),
          completion,
        )
        orb.position.copy(entry).lerp(destination, focus)
        orb.scale.setScalar(THREE.MathUtils.lerp(pathSize, scale * 0.45, focus))
        if (p > 0.92) {
          orb.position.lerp(
            positionInProcessCamera(width * 0.78, height * 0.6),
            smooth(0.92, 1, p),
          )
          orb.scale.setScalar(
            THREE.MathUtils.lerp(scale * 0.45, pathSize, smooth(0.92, 1, p)),
          )
        }
      }
    }
    const closingHandoff = orbContinuity.closing
    if (
      !inFrame &&
      closingHandoff &&
      closing.getBoundingClientRect().top <= 1
    ) {
      const target = screen(closingHandoff.x, closingHandoff.y)
      orb.position.lerp(target, closingHandoff.blend)
      orb.scale.setScalar(
        THREE.MathUtils.lerp(
          pathSize,
          (closingHandoff.radius * unit()) / 0.64,
          closingHandoff.blend,
        ),
      )
    }
    if (release > 0 || inFrame) renderer.clearDepth()
    renderer.render(orbScene, inFrame ? processCamera : camera)
    const projectedOrb = orb
      .getWorldPosition(new THREE.Vector3())
      .project(inFrame ? processCamera : camera)
    layer.dataset.orbX = String(Math.round(((projectedOrb.x + 1) / 2) * width))
    layer.dataset.orbY = String(
      Math.round(
        ((1 - projectedOrb.y) / 2) * height +
          (inFrame ? rect.top : viewportTop),
      ),
    )
    if (!ready) {
      ready = true
      onReady()
    }
  }
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    story.classList.remove('process-ready')
  })
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    ready = false
  })
  animation = requestAnimationFrame(render)
  return () => {
    disposed = true
    if (orbContinuity.orb === orb) {
      orbScene.add(orb)
      orbContinuity.orb = undefined
      orbContinuity.home = undefined
      orbContinuity.closing = undefined
      orbContinuity.inClosing = false
    }
    cancelAnimationFrame(animation)
    cancelAnimationFrame(layoutFrame)
    resize.disconnect()
    intersection.disconnect()
    window.removeEventListener('pointermove', pointerMove)
    heroAnchor.removeEventListener('pointerdown', down)
    heroAnchor.removeEventListener('pointermove', drag)
    heroAnchor.removeEventListener('pointerup', up)
    heroAnchor.removeEventListener('pointercancel', up)
    heroAnchor.removeEventListener('lostpointercapture', up)
    heroAnchor.removeEventListener('keydown', key)
    productControl.removeEventListener('pointerdown', productDown)
    productControl.removeEventListener('pointermove', productMove)
    productControl.removeEventListener('pointerup', productUp)
    productControl.removeEventListener('pointercancel', productUp)
    productControl.removeEventListener('lostpointercapture', productUp)
    productControl.removeEventListener('keydown', productKey)
    developer.dispose()
    processWindow.dispose()
    finished.dispose()
    flightSvg.remove()
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>()
    for (const scene of [heroScene, orbScene, processScene])
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Sprite
        ) {
          if ('geometry' in object)
            geometries.add(object.geometry as THREE.BufferGeometry)
          for (const material of Array.isArray(object.material)
            ? object.material
            : [object.material])
            materials.add(material)
        }
      })
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    for (const texture of labelTextures) texture.dispose()
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
