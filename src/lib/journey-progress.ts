const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}
// The view earns the full screen before the camera journey begins.
export function journeyProgress(value: number) {
  const progress = clamp(value)
  const travel = smooth(0.26, 0.88, progress)
  return {
    progress,
    focus: smooth(0.09, 0.24, progress),
    travel,
    catch: smooth(0, 0.08, progress),
    turn: smooth(0.24, 0.34, progress),
    greet: smooth(0.8, 0.92, progress),
    passage: smooth(0.6, 1, travel),
    introOpacity: 1 - smooth(0, 0.035, progress),
    lineOpacity: 1 - smooth(0, 0.025, progress),
    chapter: progress < 0.24 ? 0 : progress < 0.52 ? 1 : progress < 0.8 ? 2 : 3,
  }
}
