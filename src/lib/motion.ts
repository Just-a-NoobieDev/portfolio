import gsap from 'gsap'
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
export function reveal(node: HTMLElement, delay = 0) {
  if (prefersReducedMotion()) return
  const tween = gsap.fromTo(
    node,
    { y: 35, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.85,
      delay,
      ease: 'power3.out',
      paused: true,
    },
  )
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        tween.play()
        observer.disconnect()
      }
    },
    { threshold: 0.08 },
  )
  observer.observe(node)
  return {
    destroy() {
      observer.disconnect()
      tween.kill()
    },
  }
}
export function magnetic(node: HTMLElement) {
  if (prefersReducedMotion() || !matchMedia('(pointer: fine)').matches) return
  const x = gsap.quickTo(node, 'x', { duration: 0.45, ease: 'power3.out' })
  const y = gsap.quickTo(node, 'y', { duration: 0.45, ease: 'power3.out' })
  function move(event: PointerEvent) {
    const box = node.getBoundingClientRect()
    x((event.clientX - box.left - box.width / 2) * 0.15)
    y((event.clientY - box.top - box.height / 2) * 0.15)
  }
  function reset() {
    x(0)
    y(0)
  }
  node.addEventListener('pointermove', move)
  node.addEventListener('pointerleave', reset)
  return {
    destroy() {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', reset)
      x.tween.kill()
      y.tween.kill()
    },
  }
}
