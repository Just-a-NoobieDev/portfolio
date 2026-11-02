<script lang="ts">
  import { onMount } from 'svelte'
  let {
    compact = false,
    dark = false,
    immersive = false,
  }: { compact?: boolean; dark?: boolean; immersive?: boolean } = $props()
  let host: HTMLDivElement
  let ready = $state(false)
  onMount(() => {
    let disposed = false
    let cleanup: (() => void) | undefined
    async function start() {
      try {
        const { createSignature } = await import('../lib/signature-scene')
        if (disposed) return
        cleanup = createSignature(host, {
          compact,
          dark,
          immersive,
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
    }
    void start()
    return () => {
      disposed = true
      cleanup?.()
    }
  })
</script>

<div
  class:immersive
  class:compact
  class:dark
  class:ready
  class="signature"
  bind:this={host}
  role="img"
  aria-label={immersive
    ? 'A chrome ribbon opens into floating interface layers and a flowing blue network, then reconnects as you scroll'
    : 'An animated chrome ribbon surrounding an electric blue core'}
>
  <div class="signature-fallback" aria-hidden="true"><i></i><b></b></div>
</div>
