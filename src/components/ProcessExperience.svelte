<script lang="ts">
  import { onMount } from 'svelte'
  let layer: HTMLDivElement
  let canvasHost: HTMLDivElement
  onMount(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    const story = layer.closest<HTMLElement>('.home-experience')!
    void import('../lib/process-scene')
      .then(({ createProcessExperience }) => {
        if (disposed) return
        try {
          cleanup = createProcessExperience(canvasHost, layer, story, () =>
            story.classList.add('process-ready'),
          )
        } catch {
          story.classList.remove('process-ready')
        }
      })
      .catch(() => story.classList.remove('process-ready'))
    return () => {
      disposed = true
      cleanup?.()
      story.classList.remove('process-ready')
    }
  })
</script>

<div class="process-canvas-layer" bind:this={layer} aria-hidden="true">
  <div class="process-canvas-viewport" bind:this={canvasHost}></div>
</div>
