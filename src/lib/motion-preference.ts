export const MOTION_CHANGE = 'portfolio:motion-change'
export const REPLAY_SIGNATURE = 'portfolio:replay-signature'
const media = window.matchMedia('(prefers-reduced-motion: reduce)')
let choice: 'full' | 'reduced' | null = null
try {
  const saved = localStorage.getItem('cj-motion')
  if (saved === 'full' || saved === 'reduced') choice = saved
} catch {
  /* The preference also works without storage. */
}

export function prefersReducedMotion() {
  return choice ? choice === 'reduced' : media.matches
}
function apply() {
  document.documentElement.dataset.motion = prefersReducedMotion()
    ? 'reduced'
    : 'full'
  window.dispatchEvent(new CustomEvent(MOTION_CHANGE))
}
export function initializeMotion() {
  apply()
  const change = () => {
    if (choice === null) apply()
  }
  media.addEventListener('change', change)
  return () => media.removeEventListener('change', change)
}
export function setMotionEnabled(enabled: boolean) {
  choice = enabled ? 'full' : 'reduced'
  try {
    localStorage.setItem('cj-motion', choice)
  } catch {
    /* Optional persistence. */
  }
  apply()
}
