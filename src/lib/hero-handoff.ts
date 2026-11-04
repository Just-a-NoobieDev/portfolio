import { smooth } from './process-progress'

export function heroHandoff(value: number) {
  const progress = Math.max(0, Math.min(1, value))
  return {
    progress,
    emerge: smooth(0, 0.4, progress),
    depart: smooth(0.62, 1, progress),
    reach: smooth(0.12, 0.4, progress) * (1 - smooth(0.78, 1, progress)),
    stand: smooth(0.12, 0.4, progress),
    surprise: smooth(0.13, 0.24, progress),
  }
}
