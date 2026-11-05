import * as THREE from 'three'

// Map the shared orb's viewport position into the receiving scene at its
// destination depth. This keeps gaze correct across different camera offsets.
export function visibleOrbTarget(
  camera: THREE.PerspectiveCamera,
  bounds: { left: number; top: number; width: number; height: number },
  point: { x: number; y: number },
  destination: THREE.Vector3,
) {
  const rayPoint = new THREE.Vector3(
    ((point.x - bounds.left) / bounds.width) * 2 - 1,
    1 - ((point.y - bounds.top) / bounds.height) * 2,
    0.5,
  ).unproject(camera)
  const ray = new THREE.Ray(
    camera.position.clone(),
    rayPoint.sub(camera.position).normalize(),
  )
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    camera.getWorldDirection(new THREE.Vector3()),
    destination,
  )
  return ray.intersectPlane(plane, new THREE.Vector3()) ?? destination.clone()
}
