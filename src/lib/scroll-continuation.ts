// Navigation requires a new downward gesture in the ending, not a resize,
// history restoration, a timer, or merely landing at the bottom of the page.
export class ScrollContinuation {
  private distance = 0
  private triggered = false
  constructor(private requiredDistance = 600) {}
  get progress() {
    return Math.min(1, Math.max(0, this.distance / this.requiredDistance))
  }
  reset() {
    this.distance = 0
    this.triggered = false
  }
  feed(distance: number, atEnd: boolean) {
    if (!atEnd) {
      this.reset()
      return false
    }
    if (this.triggered) return false
    this.distance = Math.max(
      0,
      Math.min(this.requiredDistance, this.distance + distance),
    )
    if (this.progress >= 1) {
      this.triggered = true
      return true
    }
    return false
  }
}
export const nextChapters: Record<
  string,
  { href: string; title: string; detail: string; number: string }
> = {
  '/': {
    href: '/work',
    title: 'Work',
    detail: 'See the thinking in action.',
    number: '02',
  },
  '/work': {
    href: '/about',
    title: 'About',
    detail: 'Meet the person behind the code.',
    number: '03',
  },
  '/about': {
    href: '/contact',
    title: 'Contact',
    detail: 'Start a conversation. Build something together.',
    number: '04',
  },
  '/contact': {
    href: '/',
    title: 'Home',
    detail: 'Back to where the ideas begin.',
    number: '01',
  },
}
export function nextChapter(path: string) {
  return nextChapters[path] ?? nextChapters['/']!
}
