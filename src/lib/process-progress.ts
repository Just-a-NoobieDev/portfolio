export const smooth = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}
export function processProgress(value: number) {
  const progress = Math.max(0, Math.min(1, value))
  return {
    progress,
    focus: smooth(0, 0.24, progress),
    plan: smooth(0.24, 0.43, progress),
    build: smooth(0.43, 0.7, progress),
    launch: smooth(0.72, 0.96, progress),
    introOpacity: 1 - smooth(0, 0.065, progress),
    lineOpacity: 1 - smooth(0, 0.05, progress),
    chapter:
      progress < 0.27 ? 0 : progress < 0.46 ? 1 : progress < 0.73 ? 2 : 3,
  }
}
