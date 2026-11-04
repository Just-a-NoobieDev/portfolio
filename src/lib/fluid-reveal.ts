import { smooth } from './process-progress'

// Original scroll-scrubbed contour: a framed window yields to a liquid front.
// Coordinates are normalized so the same clip can reveal the DOM and WebGL.
export function fluidFramePath(value: number, width: number, height: number) {
  const p = Math.max(0, Math.min(1, value))
  const mobile = width <= 760
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t
  const left = lerp(mobile ? 0.06 : 0.47, -0.04, smooth(0, 0.87, p))
  const right = lerp(mobile ? 0.94 : 0.95, 1.04, smooth(0.12, 1, p))
  const top = lerp(mobile ? 0.42 : 0.16, -0.04, smooth(0.04, 0.94, p))
  const bottom = lerp(mobile ? 0.92 : 0.88, 1.04, smooth(0.1, 0.96, p))
  const w = right - left,
    h = bottom - top
  const rx = (24 / Math.max(1, width)) * (1 - p)
  const ry = (24 / Math.max(1, height)) * (1 - p)
  const swell = Math.pow(Math.sin(p * Math.PI), 1.3) * (mobile ? 0.065 : 0.12)
  const n = (x: number) => Number(x.toFixed(6))
  const point = (x: number, y: number) => `${n(x)} ${n(y)}`
  const middleX = left + w * 0.5,
    middleY = top + h * 0.55
  const crest = top - swell * 0.2,
    trough = bottom + swell * 0.25
  const front = left - swell * 0.95,
    back = right + swell * 0.1
  // Tangents agree at the corners and at each crest: no angular seams.
  return [
    `M${point(left + rx, top)}`,
    `C${point(left + w * 0.22, top)} ${point(left + w * 0.3, crest)} ${point(middleX, crest)}`,
    `C${point(left + w * 0.7, crest)} ${point(right - w * 0.2, top)} ${point(right - rx, top)}`,
    `Q${point(right, top)} ${point(right, top + ry)}`,
    `C${point(right, top + h * 0.23)} ${point(back, middleY - h * 0.18)} ${point(back, middleY)}`,
    `C${point(back, middleY + h * 0.18)} ${point(right, bottom - h * 0.2)} ${point(right, bottom - ry)}`,
    `Q${point(right, bottom)} ${point(right - rx, bottom)}`,
    `C${point(right - w * 0.2, bottom)} ${point(left + w * 0.7, trough)} ${point(middleX, trough)}`,
    `C${point(left + w * 0.3, trough)} ${point(left + w * 0.2, bottom)} ${point(left + rx, bottom)}`,
    `Q${point(left, bottom)} ${point(left, bottom - ry)}`,
    `C${point(left, bottom - h * 0.2)} ${point(front, middleY + h * 0.18)} ${point(front, middleY)}`,
    `C${point(front, middleY - h * 0.2)} ${point(left, top + h * 0.23)} ${point(left, top + ry)}`,
    `Q${point(left, top)} ${point(left + rx, top)} Z`,
  ].join(' ')
}
