// Navigation requires a new downward gesture in the ending, not a resize,
// history restoration, a timer, or merely landing at the bottom of the page.
export class ScrollContinuation {
  private armedAt = -Infinity
  private triggered = false
  private previous = 0
  intent(direction: number, now: number, inEnding: boolean) {
    if (direction < 0) this.armedAt = -Infinity
    else if (direction > 0 && inEnding) {
      this.armedAt = now
      // At the document end another gesture cannot produce a scroll event.
      // It still counts as continuing after an intentional, visible ending.
      if (this.previous >= 0.998 && !this.triggered) {
        this.triggered = true
        return true
      }
    }
    return false
  }
  update(progress: number, now: number) {
    const crossedEnd = this.previous < 0.998 && progress >= 0.998
    this.previous = progress
    if (progress < 0.95) this.triggered = false
    if (!this.triggered && crossedEnd && now - this.armedAt < 1800) {
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
