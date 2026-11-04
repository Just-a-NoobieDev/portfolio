import type { Group, Object3D } from 'three'

// One object changes render owners at the closing scene, after its projected
// position and size have matched. This is reversible when scrolling backward.
export const orbContinuity: {
  orb?: Group
  home?: Object3D
  inClosing: boolean
  closing?: { x: number; y: number; radius: number; blend: number }
} = { inClosing: false }
