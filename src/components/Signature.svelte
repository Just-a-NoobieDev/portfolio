<script lang="ts">
  import { onMount } from 'svelte'
  import { prefersReducedMotion } from '../lib/motion'
  let { compact = false, dark = false }: { compact?: boolean; dark?: boolean } =
    $props()
  let host: HTMLDivElement
  let ready = $state(false)
  onMount(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    import('../lib/signature-scene')
      .then(({ createSignature }) => {
        if (disposed) return
        try {
          cleanup = createSignature(host, {
            compact,
            dark,
            reducedMotion: prefersReducedMotion(),
            onReady: () => {
              if (!disposed) ready = true
            },
            onLost: () => {
              if (!disposed) ready = false
            },
          })
        } catch {
          ready = false
        }
      })
      .catch(() => {
        ready = false
      })
    return () => {
      disposed = true
      cleanup?.()
    }
  })
</script>

<div
  class:compact
  class:dark
  class:ready
  class="signature"
  bind:this={host}
  role="img"
  aria-label="An interlocking graphite C and electric blue J sculpture"
>
  <div class="signature-still" aria-hidden="true">
    <span>C</span><span>J</span>
  </div>
  {#if !compact}<span class="signature-caption" aria-hidden="true"
      ><i></i> INTERFACE / API / DATA</span
    >{/if}
</div>
