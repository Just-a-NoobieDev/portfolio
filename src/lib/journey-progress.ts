const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}
// Each action has room to read, and every phase reverses with the scroll.
export function journeyProgress(value: number) {
  const progress = clamp(value)
  return {
    progress,
    reach: smooth(0.005, 0.07, progress),
    catch: smooth(0.015, 0.105, progress),
    build: smooth(0.14, 0.72, progress),
    focus: smooth(0.12, 0.25, progress),
    turn: smooth(0.27, 0.34, progress),
    travel: smooth(0.35, 0.79, progress),
    release: smooth(0.8, 0.89, progress),
    greet: smooth(0.91, 0.98, progress),
    passage: smooth(0.67, 0.89, progress),
    introOpacity: 1 - smooth(0.06, 0.115, progress),
    lineOpacity: 1 - smooth(0.07, 0.115, progress),
    chapter:
      progress < 0.27 ? 0 : progress < 0.55 ? 1 : progress < 0.91 ? 2 : 3,
  }
}
