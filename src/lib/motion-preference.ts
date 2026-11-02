// Full motion is the portfolio default on every visit, including returning visitors.
// No stored choice or device preference gates the creative experience.
export const REPLAY_SIGNATURE = 'portfolio:replay-signature'
export function initializeMotion() {
  document.documentElement.dataset.motion = 'full'
}
