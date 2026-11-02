// Pure, reversible scroll choreography. No time-based triggers or one-way states.
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (start: number, end: number, p: number) => {
  const t = clamp((p - start) / (end - start))
  return t * t * (3 - 2 * t)
}
export function sceneStory(progress: number) {
  const p = clamp(progress)
  return {
    progress: p,
    chapter: Math.min(3, Math.floor(p * 4)),
    open: smooth(0.04, 0.34, p) * (1 - smooth(0.78, 1, p)),
    layers: smooth(0.12, 0.34, p) * (1 - smooth(0.56, 0.76, p)),
    network: smooth(0.38, 0.6, p) * (1 - smooth(0.84, 1, p)),
    resolve: smooth(0.76, 1, p),
    travel: smooth(0, 1, p),
  }
}
