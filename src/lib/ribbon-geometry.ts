import * as THREE from 'three'

// A flattened, twisting ribbon with a closed cross-section catches real light.
// Three independent arcs let the object physically open during the scroll story.
export function ribbonGeometry(
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
