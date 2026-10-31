import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion, MOTION_CHANGE } from './motion-preference'
export { prefersReducedMotion } from './motion-preference'
gsap.registerPlugin(ScrollTrigger, SplitText)

function motionAction(node: HTMLElement, setup: () => () => void) {
  let cleanup: (() => void) | undefined
  function configure() {
    cleanup?.()
    cleanup = undefined
    if (!prefersReducedMotion()) cleanup = setup()
  }
  configure()
  window.addEventListener(MOTION_CHANGE, configure)
  return {
    destroy() {
      cleanup?.()
      window.removeEventListener(MOTION_CHANGE, configure)
    },
  }
}

export function reveal(node: HTMLElement, delay = 0) {
  return motionAction(node, () => {
    const tween = gsap.fromTo(
      node,
      { y: 60, opacity: 0, rotate: 1.2 },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 1.05,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: node, start: 'top 94%', once: true },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(node, { clearProps: 'transform,opacity' })
    }
  })
}

export function wordReveal(node: HTMLElement) {
  return motionAction(node, () => {
    const split = new SplitText(node, {
      type: 'words',
      wordsClass: 'reveal-word',
      aria: 'none',
    })
    const tween = gsap.fromTo(
      split.words,
      { opacity: 0.18, y: 18 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 0.6,
        },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
  })
}

export function parallaxImage(node: HTMLElement) {
  return motionAction(node, () => {
    const image = node.querySelector('img')
    if (!image) return () => {}
    const tween = gsap.fromTo(
      image,
      { yPercent: 9, rotate: -2, scale: 1.03 },
      {
        yPercent: -9,
        rotate: 1,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: node,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      gsap.set(image, { clearProps: 'transform' })
    }
  })
}

export function magnetic(node: HTMLElement) {
  return motionAction(node, () => {
    if (!matchMedia('(pointer: fine)').matches) return () => {}
    const x = gsap.quickTo(node, 'x', { duration: 0.5, ease: 'power3.out' })
    const y = gsap.quickTo(node, 'y', { duration: 0.5, ease: 'power3.out' })
    function move(event: PointerEvent) {
      const box = node.getBoundingClientRect()
      x((event.clientX - box.left - box.width / 2) * 0.28)
      y((event.clientY - box.top - box.height / 2) * 0.28)
    }
    function reset() {
      x(0)
      y(0)
    }
    node.addEventListener('pointermove', move)
    node.addEventListener('pointerleave', reset)
    return () => {
      node.removeEventListener('pointermove', move)
      node.removeEventListener('pointerleave', reset)
      x.tween.kill()
      y.tween.kill()
      gsap.set(node, { clearProps: 'transform' })
    }
  })
}
