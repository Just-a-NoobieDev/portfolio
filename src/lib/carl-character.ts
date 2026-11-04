import * as THREE from 'three'
import { heroHandoff } from './hero-handoff'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Hand-built, stylized reconstruction guided by Carl's supplied portrait.
export function createCarlCharacter() {
  const group = new THREE.Group()
  group.name = 'Carl_and_office_chair'
  group.position.x = -0.45
  const mat = (color: string, roughness = 0.7) =>
    new THREE.MeshStandardMaterial({ color, roughness })
  const skin = mat('#c9926c', 0.55),
    innerEar = mat('#b6785b'),
    navy = mat('#263a63'),
    stitch = mat('#405474')
  const cream = mat('#eee7da'),
    charcoal = mat('#3b3c42'),
    black = mat('#202329'),
    hair = mat('#181b20')
  const white = mat('#f3f0e9'),
    silver = new THREE.MeshStandardMaterial({
      color: '#8d929b',
      roughness: 0.3,
      metalness: 0.7,
    })
  function ball(
    parent: THREE.Object3D,
    size: number[],
    at: number[],
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20), material)
    mesh.scale.set(size[0]!, size[1]!, size[2]!)
    mesh.position.set(at[0]!, at[1]!, at[2]!)
    parent.add(mesh)
    return mesh
  }
  function box(
    parent: THREE.Object3D,
    size: number[],
    at: number[],
    material: THREE.Material,
    radius = 0.04,
  ) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(size[0]!, size[1]!, size[2]!, 2, radius),
      material,
    )
    mesh.position.set(at[0]!, at[1]!, at[2]!)
    parent.add(mesh)
    return mesh
  }
  function tube(
    parent: THREE.Object3D,
    points: number[][],
    radius: number,
    material: THREE.Material,
  ) {
    const path = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0]!, p[1]!, p[2]!)),
    )
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(path, 16, radius, 8, false),
      material,
    )
    parent.add(mesh)
    return mesh
  }
  function limb(
    parent: THREE.Object3D,
    a: number[],
    b: number[],
    radius: number,
    material: THREE.Material,
  ) {
    const start = new THREE.Vector3(a[0]!, a[1]!, a[2]!),
      end = new THREE.Vector3(b[0]!, b[1]!, b[2]!)
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(
        radius,
        Math.max(0.01, start.distanceTo(end) - radius * 2),
        6,
        16,
      ),
      material,
    )
    mesh.position.copy(start).lerp(end, 0.5)
    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    )
    parent.add(mesh)
    return mesh
  }
  const chair = new THREE.Group()
  chair.name = 'Mesh_office_chair'
  group.add(chair)
  box(chair, [1.13, 0.15, 0.93], [0, -0.52, -0.62], black, 0.065)
  box(chair, [1.12, 1.15, 0.13], [0, 0.06, -1.06], black, 0.06)
  box(chair, [0.95, 0.98, 0.05], [0, 0.07, -0.97], mat('#41464d'), 0.05)
  for (let i = 0; i < 19; i++)
    box(
      chair,
      [0.012, 0.92, 0.013],
      [-0.43 + i * 0.048, 0.08, -0.938],
      black,
      0.003,
    )
  for (let i = 0; i < 10; i++)
    box(
      chair,
      [0.91, 0.009, 0.014],
      [0, -0.32 + i * 0.09, -0.929],
      black,
      0.003,
    )
  limb(chair, [0, -0.6, -0.6], [0, -1.52, -0.6], 0.07, silver)
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5,
      end = [Math.cos(a) * 0.67, -1.53, -0.6 + Math.sin(a) * 0.67]
    limb(chair, [0, -1.37, -0.6], end, 0.035, black)
    ball(chair, [0.095, 0.095, 0.075], end, black)
  }
  for (const sign of [-1, 1]) {
    tube(
      chair,
      [
        [sign * 0.53, -0.5, -0.75],
        [sign * 0.64, -0.2, -0.5],
        [sign * 0.64, -0.12, -0.12],
      ],
      0.035,
      black,
    )
    box(chair, [0.2, 0.075, 0.64], [sign * 0.64, -0.08, -0.35], black)
  }
  const person = new THREE.Group()
  person.name = 'Carl_character'
  group.add(person)
  // A continuous tailored torso, with a flush tee panel instead of stacked blobs.
  const torsoGeometry = new THREE.BufferGeometry()
  const torsoPositions: number[] = [],
    torsoIndices: number[] = []
  const profile = [
    [-0.46, 0.34, 0.24],
    [-0.34, 0.39, 0.26],
    [0.1, 0.43, 0.27],
    [0.5, 0.43, 0.26],
    [0.7, 0.35, 0.23],
    [0.82, 0.2, 0.16],
  ]
  const sides = 40
  for (const [y, rx, rz] of profile)
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2
      torsoPositions.push(Math.sin(a) * rx!, y!, -0.6 + Math.cos(a) * rz!)
    }
  for (let i = 0; i < profile.length - 1; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j,
        b = a + sides + 1
      const offset = torsoIndices.length
      torsoIndices.push(a, a + 1, b, a + 1, b + 1, b)
      const angle = ((j + 0.5) / sides) * Math.PI * 2
      torsoGeometry.addGroup(offset, 6, Math.cos(angle) > 0.9 ? 1 : 0)
    }
  torsoGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(torsoPositions, 3),
  )
  torsoGeometry.setIndex(torsoIndices)
  torsoGeometry.computeVertexNormals()
  const torso = new THREE.Mesh(torsoGeometry, [navy, cream])
  torso.name = 'Continuous_overshirt_and_tee'
  person.add(torso)
  for (const sign of [-1, 1]) {
    const collarGeometry = new THREE.BufferGeometry()
    collarGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [
          sign * 0.075,
          0.825,
          -0.447,
          sign * 0.19,
          0.805,
          -0.515,
          sign * 0.28,
          0.685,
          -0.46,
          sign * 0.145,
          0.615,
          -0.365,
        ],
        3,
      ),
    )
    collarGeometry.setIndex(sign < 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3])
    collarGeometry.computeVertexNormals()
    const collarMaterial = navy.clone()
    collarMaterial.side = THREE.DoubleSide
    const collar = new THREE.Mesh(collarGeometry, collarMaterial)
    collar.name = 'Thin_folded_shirt_collar'
    person.add(collar)
  }
  tube(
    person,
    [
      [-0.37, 0.51, -0.408],
      [-0.27, 0.5, -0.414],
      [-0.17, 0.51, -0.408],
    ],
    0.004,
    stitch,
  )
  for (let i = 0; i < 4; i++)
    ball(person, [0.018, 0.018, 0.012], [0.18, 0.54 - i * 0.23, -0.401], silver)
  box(person, [0.74, 0.32, 0.56], [0, -0.46, -0.56], charcoal, 0.1)
  limb(person, [0, 0.74, -0.57], [0, 1, -0.52], 0.14, skin)
  const head = new THREE.Group()
  head.name = 'Carl_face_and_hair'
  const neckPivot = new THREE.Group()
  neckPivot.name = 'Natural_neck_pivot'
  neckPivot.position.set(0, 0.9, -0.52)
  neckPivot.rotation.set(0.1, 0, 0)
  head.position.set(0, 0.36, 0.04)
  neckPivot.add(head)
  person.add(neckPivot)
  // Keep the clean miniature face; detailed likeness needs a sculpted source model.
  ball(head, [0.35, 0.43, 0.32], [0, 0, 0], skin)
  ball(head, [0.37, 0.27, 0.33], [0, 0.25, -0.05], hair)
  ball(head, [0.28, 0.105, 0.19], [-0.07, 0.4, 0.055], hair).rotation.z = -0.16
  for (const x of [-0.34, 0.34])
    ball(head, [0.065, 0.11, 0.065], [x, -0.02, 0], skin)
  const faceZ = (x: number, y: number) =>
    0.32 * Math.sqrt(Math.max(0, 1 - (x / 0.35) ** 2 - (y / 0.43) ** 2))
  const conform = (
    mesh: THREE.Mesh,
    centerX = 0,
    centerY = 0,
    lift = 0.003,
  ) => {
    const positions = mesh.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) + centerX,
        y = positions.getY(i) + centerY
      positions.setXYZ(i, x, y, faceZ(x, y) + lift)
    }
    positions.needsUpdate = true
    mesh.geometry.computeVertexNormals()
    return mesh
  }
  const patch = (
    x: number,
    y: number,
    rx: number,
    ry: number,
    color: string,
    opacity = 1,
    lift = 0.003,
  ) => {
    const geometry = new THREE.BufferGeometry()
    const vertices: number[] = [],
      indices: number[] = []
    const rings = 10,
      sides = 48
    for (let ring = 0; ring <= rings; ring++)
      for (let side = 0; side <= sides; side++) {
        const a = (side / sides) * Math.PI * 2
        const px = x + (Math.cos(a) * rx * ring) / rings
        const py = y + (Math.sin(a) * ry * ring) / rings
        vertices.push(px, py, faceZ(px, py) + lift)
      }
    for (let ring = 0; ring < rings; ring++)
      for (let side = 0; side < sides; side++) {
        const a = ring * (sides + 1) + side,
          b = a + sides + 1
        indices.push(a, b, b + 1, a, b + 1, a + 1)
      }
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    )
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    )
    mesh.userData.facePatch = { x, y, rx, ry, lift }
    head.add(mesh)
    return mesh
  }
  const eyes: THREE.Mesh[] = [],
    eyeWhites: THREE.Mesh[] = [],
    brows: THREE.Mesh[] = []
  for (const x of [-0.12, 0.12]) {
    eyeWhites.push(patch(x, 0.025, 0.046, 0.059, '#f4eee5', 0))
    const pupil = patch(x, 0.025, 0.024, 0.034, '#202329', 1, 0.006)
    pupil.renderOrder = 2
    eyes.push(pupil)
    const brow = tube(
      head,
      [
        [x - 0.045, 0.125, 0],
        [x, 0.137, 0],
        [x + 0.045, 0.125, 0],
      ],
      0.009,
      hair,
    )
    conform(brow)
    brows.push(brow)
  }
  ball(head, [0.043, 0.06, 0.045], [0, -0.045, 0.309], skin)
  const smile = tube(
    head,
    [
      [-0.075, -0.163, 0],
      [0, -0.183, 0],
      [0.075, -0.163, 0],
    ],
    0.009,
    new THREE.MeshStandardMaterial({
      color: '#895744',
      roughness: 0.7,
      transparent: true,
      depthWrite: false,
    }),
  )
  conform(smile)
  const shockedMouth = patch(0, -0.21, 0.077, 0.096, '#21191d', 0)
  shockedMouth.name = 'Surface_fitted_surprised_mouth'
  const tongue = patch(0, -0.27, 0.042, 0.02, '#b87377', 0, 0.005)
  const hands: THREE.Group[] = []
  const reachAnchor = new THREE.Object3D()
  reachAnchor.name = 'Orb_handoff_above_open_hand'
  reachAnchor.position.set(0, 0.25, 0.025)
  const carryAnchor = new THREE.Object3D()
  carryAnchor.name = 'Journey_orb_in_left_palm'
  carryAnchor.position.set(0, 0.23, 0.025)
  const arms: {
    sign: number
    upper: THREE.Mesh
    lower: THREE.Mesh
    cuff: THREE.Mesh
    hand: THREE.Group
    shoulder: THREE.Vector3
    elbow: THREE.Vector3
    wrist: THREE.Vector3
    upperLength: number
    lowerLength: number
    cuffLength: number
  }[] = []
  const point = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  const segment = (
    mesh: THREE.Mesh,
    a: THREE.Vector3,
    b: THREE.Vector3,
    length: number,
  ) => {
    const delta = b.clone().sub(a)
    mesh.position.copy(a).lerp(b, 0.5)
    mesh.quaternion.setFromUnitVectors(
      point(0, 1, 0),
      delta.clone().normalize(),
    )
    mesh.scale.y = delta.length() / length
  }
  const legs: {
    trousers: THREE.Mesh
    ankle: THREE.Mesh
    foot: THREE.Group
    sign: number
    upperLength: number
    lowerLength: number
    ankleLength: number
  }[] = []
  for (const sign of [-1, 1]) {
    const upper = limb(
      person,
      [sign * 0.36, 0.62, -0.56],
      [sign * 0.57, 0.14, -0.13],
      0.145,
      navy,
    )
    const lower = limb(
      person,
      [sign * 0.57, 0.14, -0.13],
      [sign * 0.22, 0.215, 0.48],
      0.095,
      skin,
    )
    const cuff = limb(
      person,
      [sign * 0.565, 0.15, -0.12],
      [sign * 0.54, 0.145, -0.025],
      0.113,
      navy,
    )
    cuff.name = 'Rolled_sleeve'
    const hand = new THREE.Group()
    hand.name = sign < 0 ? 'Left_typing_hand' : 'Right_typing_hand'
    hand.position.set(sign * 0.22, 0.215, 0.48)
    person.add(hand)
    hands.push(hand)
    if (sign > 0) hand.add(reachAnchor)
    else hand.add(carryAnchor)
    const shoulder = point(sign * 0.36, 0.62, -0.56),
      elbow = point(sign * 0.57, 0.14, -0.13),
      wrist = point(sign * 0.22, 0.215, 0.48)
    arms.push({
      sign,
      upper,
      lower,
      cuff,
      hand,
      shoulder,
      elbow,
      wrist,
      upperLength: shoulder.distanceTo(elbow),
      lowerLength: elbow.distanceTo(wrist),
      cuffLength: point(sign * 0.565, 0.15, -0.12).distanceTo(
        point(sign * 0.54, 0.145, -0.025),
      ),
    })
    ball(hand, [0.12, 0.052, 0.14], [0, 0, 0], skin)
    for (let i = 0; i < 4; i++) {
      const x = -0.072 + i * 0.045,
        length = [0.13, 0.17, 0.18, 0.145][i]!
      tube(
        hand,
        [
          [x, 0, 0.065],
          [x, -0.003, 0.13],
          [x, -0.028, length + 0.06],
        ],
        0.018,
        skin,
      )
    }
    tube(
      hand,
      [
        [sign * 0.09, 0, 0],
        [sign * 0.15, -0.02, 0.065],
        [sign * 0.15, -0.035, 0.11],
      ],
      0.025,
      skin,
    )
    const trousersGeometry = new THREE.BufferGeometry()
    const trouserRings = 25,
      trouserSides = 16
    const trousersIndex: number[] = []
    trousersGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        new Float32Array(trouserRings * (trouserSides + 1) * 3),
        3,
      ),
    )
    for (let ring = 0; ring < trouserRings - 1; ring++)
      for (let side = 0; side < trouserSides; side++) {
        const a = ring * (trouserSides + 1) + side,
          b = a + trouserSides + 1
        trousersIndex.push(a, b, a + 1, a + 1, b, b + 1)
      }
    trousersGeometry.setIndex(trousersIndex)
    const trousers = new THREE.Mesh(trousersGeometry, charcoal)
    trousers.name =
      sign < 0 ? 'Left_continuous_trouser_leg' : 'Right_continuous_trouser_leg'
    person.add(trousers)
    const ankle = limb(
      person,
      [sign * 0.27, -1.34, 0.2],
      [sign * 0.27, -1.46, 0.23],
      0.08,
      skin,
    )
    const foot = new THREE.Group()
    foot.name = sign < 0 ? 'Left_shoe' : 'Right_shoe'
    person.add(foot)
    box(foot, [0.32, 0.16, 0.6], [sign * 0.27, -1.5, 0.36], white, 0.06)
    box(
      foot,
      [0.33, 0.055, 0.61],
      [sign * 0.27, -1.575, 0.36],
      mat('#d5d4d0'),
      0.025,
    )
    for (let i = 0; i < 4; i++)
      tube(
        foot,
        [
          [sign * 0.27 - 0.09, -1.405, 0.22 + i * 0.055],
          [sign * 0.27, -1.39, 0.23 + i * 0.055],
          [sign * 0.27 + 0.09, -1.405, 0.22 + i * 0.055],
        ],
        0.009,
        white,
      )
    legs.push({
      trousers,
      ankle,
      foot,
      sign,
      upperLength: point(sign * 0.22, -0.4, -0.5).distanceTo(
        point(sign * 0.26, -0.65, 0.23),
      ),
      lowerLength: point(sign * 0.26, -0.65, 0.23).distanceTo(
        point(sign * 0.27, -1.35, 0.2),
      ),
      ankleLength: point(sign * 0.27, -1.34, 0.2).distanceTo(
        point(sign * 0.27, -1.46, 0.23),
      ),
    })
  }
  return {
    group,
    reachAnchor,
    carryAnchor,
    animateJourney(
      time: number,
      walk: number,
      catching: number,
      waving: number,
    ): void {
      this.animate(time, 0.5)
      chair.visible = false
      ;(smile.material as THREE.MeshStandardMaterial).opacity = 1
      ;(shockedMouth.material as THREE.MeshBasicMaterial).opacity = 0
      ;(tongue.material as THREE.MeshBasicMaterial).opacity = 0
      brows.forEach((brow) => brow.position.set(0, 0, 0))
      eyeWhites.forEach((eye) => {
        ;(eye.material as THREE.MeshBasicMaterial).opacity = 0.8
      })
      for (const leg of legs) {
        const stride = Math.sin(time * 6 + (leg.sign < 0 ? 0 : Math.PI)) * walk
        const lift = Math.max(0, stride) * 0.12
        const vertices = leg.trousers.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute
        for (let i = 0; i < vertices.count; i++) {
          const weight = Math.floor(i / 17) / 24
          vertices.setZ(i, vertices.getZ(i) + stride * 0.2 * weight)
          vertices.setY(i, vertices.getY(i) + lift * weight)
        }
        vertices.needsUpdate = true
        leg.trousers.geometry.computeVertexNormals()
        leg.foot.position.z += stride * 0.2
        leg.foot.position.y += lift
        leg.ankle.position.z += stride * 0.2
        leg.ankle.position.y += lift
      }
      for (const arm of arms) {
        const isCarry = arm.sign < 0
        const elbow = isCarry
          ? point(-0.55, 0.25 + catching * 0.2, -0.22)
          : point(0.55, 0.06, -0.48).lerp(point(0.67, 0.76, -0.48), waving)
        const wrist = isCarry
          ? point(-0.65, 0.72, 0.35).lerp(point(-0.4, 0.48, 0.2), catching)
          : point(0.42, -0.26, -0.32).lerp(point(0.5, 1.26, -0.34), waving)
        if (!isCarry) wrist.z += Math.sin(time * 6) * walk * 0.12
        segment(arm.upper, arm.shoulder, elbow, arm.upperLength)
        segment(arm.lower, elbow, wrist, arm.lowerLength)
        segment(
          arm.cuff,
          elbow.clone().lerp(wrist, 0.02),
          elbow.clone().lerp(wrist, 0.17),
          arm.cuffLength,
        )
        arm.hand.position.copy(wrist)
        arm.hand.rotation.set(
          isCarry ? -0.3 : -1.3 * waving,
          0,
          isCarry ? 0.12 : Math.sin(time * 5.5) * 0.35 * waving,
        )
      }
    },
    setTypingTargets(left: THREE.Vector3, right: THREE.Vector3) {
      arms[0]!.wrist.copy(left)
      arms[1]!.wrist.copy(right)
    },
    lookAtOrb(target: THREE.Vector3, delta: number) {
      person.updateWorldMatrix(true, false)
      const local = person
        .worldToLocal(target.clone())
        .sub(neckPivot.position)
        .sub(new THREE.Vector3(0, 0.36, 0.04))
      const yaw = THREE.MathUtils.clamp(
        Math.atan2(local.x, local.z),
        -0.32,
        0.32,
      )
      const pitch = THREE.MathUtils.clamp(
        -Math.atan2(local.y, Math.hypot(local.x, local.z)),
        -0.18,
        0.22,
      )
      neckPivot.rotation.y = THREE.MathUtils.damp(
        neckPivot.rotation.y,
        yaw,
        7,
        delta,
      )
      neckPivot.rotation.x = THREE.MathUtils.damp(
        neckPivot.rotation.x,
        pitch,
        7,
        delta,
      )
      head.updateWorldMatrix(true, false)
      const gaze = head.worldToLocal(target.clone())
      const dx = THREE.MathUtils.clamp(
        Math.atan2(gaze.x, gaze.z) * 0.035,
        -0.016,
        0.016,
      )
      const dy = THREE.MathUtils.clamp(
        Math.atan2(gaze.y, Math.hypot(gaze.x, gaze.z)) * 0.035,
        -0.018,
        0.018,
      )
      for (const eye of eyes) {
        const { x, y, rx, ry, lift } = eye.userData.facePatch
        const vertices = eye.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute
        for (let ring = 0; ring <= 10; ring++)
          for (let side = 0; side <= 48; side++) {
            const a = (side / 48) * Math.PI * 2
            const px = x + dx + (Math.cos(a) * rx * ring) / 10
            const py = y + dy + (Math.sin(a) * ry * ring) / 10
            vertices.setXYZ(ring * 49 + side, px, py, faceZ(px, py) + lift)
          }
        vertices.needsUpdate = true
      }
    },
    animate(time: number, release = 0) {
      const { reach, stand, surprise } = heroHandoff(release)
      // Small, independent idle gestures keep the coding pose alive.
      const idle = 1 - surprise
      torso.scale.y = 1 + Math.sin(time * 1.7) * 0.006 * idle
      neckPivot.rotation.z = Math.sin(time * 0.55) * 0.012 * idle
      const blinking = time % 4.8 > 4.65 && idle > 0.5
      eyes.forEach((eye) => {
        eye.visible = !blinking
      })
      person.position.set(0, stand * 0.44, -stand * 0.1)
      chair.position.z = -stand * 0.3
      for (const leg of legs) {
        const { sign } = leg
        const footShift =
          Math.sin(time * 1.25 + sign * 1.6) * 0.035 * (1 - stand)
        const hip = point(sign * 0.22, -0.4, -0.5)
        const knee = point(
          sign * 0.26,
          THREE.MathUtils.lerp(-0.65, -0.64, stand) - person.position.y,
          THREE.MathUtils.lerp(0.23, -0.37, stand) -
            person.position.z +
            footShift * 0.3,
        )
        const ankle = point(
          sign * 0.27,
          -1.35 - person.position.y,
          THREE.MathUtils.lerp(0.2, -0.35, stand) -
            person.position.z +
            footShift,
        )
        const curve = new THREE.CatmullRomCurve3([
          hip,
          hip.clone().lerp(knee, 0.5),
          knee,
          knee.clone().lerp(ankle, 0.5),
          ankle,
        ])
        const vertices = leg.trousers.geometry.getAttribute(
          'position',
        ) as THREE.BufferAttribute
        const rings = 25,
          sides = 16
        for (let ring = 0; ring < rings; ring++) {
          const u = ring / (rings - 1),
            center = curve.getPoint(u),
            tangent = curve.getTangent(u)
          const across = point(1, 0, 0)
            .addScaledVector(tangent, -tangent.x)
            .normalize()
          const depth = across.clone().cross(tangent).normalize()
          const radius = THREE.MathUtils.lerp(0.19, 0.118, u)
          for (let side = 0; side <= sides; side++) {
            const a = (side / sides) * Math.PI * 2
            const vertex = center
              .clone()
              .addScaledVector(across, Math.cos(a) * radius)
              .addScaledVector(depth, Math.sin(a) * radius)
            vertices.setXYZ(
              ring * (sides + 1) + side,
              vertex.x,
              vertex.y,
              vertex.z,
            )
          }
        }
        vertices.needsUpdate = true
        leg.trousers.geometry.computeVertexNormals()
        leg.trousers.geometry.computeBoundingSphere()
        segment(
          leg.ankle,
          point(
            sign * 0.27,
            -1.34 - person.position.y,
            THREE.MathUtils.lerp(0.2, -0.35, stand) -
              person.position.z +
              footShift,
          ),
          point(
            sign * 0.27,
            -1.46 - person.position.y,
            THREE.MathUtils.lerp(0.23, -0.32, stand) -
              person.position.z +
              footShift,
          ),
          leg.ankleLength,
        )
        leg.foot.position.set(
          0,
          -person.position.y,
          -person.position.z - stand * 0.55 + footShift,
        )
      }

      eyeWhites.forEach((eye) => {
        ;(eye.material as THREE.MeshStandardMaterial).opacity = surprise
      })
      brows.forEach((brow) => {
        // Move up and back along the head's curvature, not away from the skin.
        brow.position.y = surprise * 0.065
        brow.position.z = -surprise * 0.018
      })
      ;(smile.material as THREE.MeshStandardMaterial).opacity = 1 - surprise
      ;(shockedMouth.material as THREE.MeshBasicMaterial).opacity = surprise
      ;(tongue.material as THREE.MeshBasicMaterial).opacity = surprise
      for (const arm of arms) {
        const action = arm.sign > 0 ? reach : 0
        // Keep the supporting hand on the real keyboard while the torso rises.
        const wrist = arm.wrist
          .clone()
          .sub(person.position)
          .lerp(point(0.78, 0.95, 0.3), action)
        wrist.y +=
          Math.sin(time * 7 + (arm.sign < 0 ? 0 : 2)) * 0.008 * (1 - reach)
        const axis = wrist.clone().sub(arm.shoulder),
          distance = Math.min(
            axis.length(),
            arm.upperLength + arm.lowerLength - 0.001,
          )
        axis.normalize()
        const along =
          (arm.upperLength ** 2 - arm.lowerLength ** 2 + distance ** 2) /
          (2 * distance)
        const bend = point(arm.sign, -0.55, -0.2)
          .addScaledVector(axis, -point(arm.sign, -0.55, -0.2).dot(axis))
          .normalize()
        const solved = arm.shoulder
          .clone()
          .addScaledVector(axis, along)
          .addScaledVector(
            bend,
            Math.sqrt(Math.max(0, arm.upperLength ** 2 - along ** 2)),
          )
        const elbow = solved
        segment(arm.upper, arm.shoulder, elbow, arm.upperLength)
        segment(arm.lower, elbow, wrist, arm.lowerLength)
        segment(
          arm.cuff,
          elbow.clone().lerp(wrist, 0.02),
          elbow.clone().lerp(wrist, 0.17),
          arm.cuffLength,
        )
        arm.hand.position.copy(wrist)
        arm.hand.rotation.set(
          -0.35 * action + Math.sin(time * 7) * 0.025 * (1 - reach),
          0,
          -0.12 * action,
        )
        arm.hand.scale.x = 1 + action * 0.08
      }
      person.scale.y = 1 + Math.sin(time * 1.8) * 0.002
    },
  }
}
