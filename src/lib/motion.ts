import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(ScrollTrigger, SplitText)

function motionAction(node: HTMLElement, setup: () => () => void) {
  const cleanup = setup()
  return { destroy: cleanup }
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

// A blue disk rises into the button and continues upward when the pointer leaves.
export function liquidButton(node: HTMLElement) {
  const fill = node.querySelector<HTMLElement>('.button-fill')
  if (!fill) return {}
  gsap.set(fill, { y: 0, yPercent: 100 })
  let tween: gsap.core.Tween | undefined
  const enter = () => {
    tween?.kill()
    tween = gsap.fromTo(
      fill,
      { y: 0, yPercent: 100 },
      { yPercent: 0, duration: 0.55, ease: 'power3.out' },
    )
  }
  const leave = () => {
    tween?.kill()
    tween = gsap.to(fill, {
      y: 0,
      yPercent: -100,
      duration: 0.5,
      ease: 'power3.inOut',
      onComplete: () => {
        gsap.set(fill, { y: 0, yPercent: 100 })
      },
    })
  }
  node.addEventListener('pointerenter', enter)
  node.addEventListener('pointerleave', leave)
  node.addEventListener('focus', enter)
  node.addEventListener('blur', leave)
  return {
    destroy() {
      tween?.kill()
      node.removeEventListener('pointerenter', enter)
      node.removeEventListener('pointerleave', leave)
      node.removeEventListener('focus', enter)
      node.removeEventListener('blur', leave)
    },
  }
}
