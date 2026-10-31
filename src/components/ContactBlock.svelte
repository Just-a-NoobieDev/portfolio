<script lang="ts">
  import { onDestroy } from 'svelte'
  import Signature from './Signature.svelte'
  import { profile } from '../lib/profile'
  import { magnetic, reveal } from '../lib/motion'
  let { full = false }: { full?: boolean } = $props()
  let copied = $state(false)
  let copyTimer: ReturnType<typeof setTimeout>
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      copied = true
      clearTimeout(copyTimer)
      copyTimer = setTimeout(() => (copied = false), 2400)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }
  onDestroy(() => clearTimeout(copyTimer))
</script>

<section class:full class="contact-block">
  <div class="contact-inner" use:reveal>
    <div class="section-eyebrow light">
      <span>{full ? '04 / CONTACT' : 'HAVE SOMETHING IN MIND?'}</span><span
        >LET’S MAKE IT HAPPEN ↙</span
      >
    </div>
    <div class="contact-title-row">
      <svelte:element
        this={full ? 'h1' : 'h2'}
        id={full ? 'page-title' : undefined}
        tabindex="-1"
        >Let’s build<br />something<br /><em>worth using.</em></svelte:element
      >
      <div class="contact-visual">
        <div class="contact-signature"><Signature compact dark /></div>
        <a use:magnetic href={`mailto:${profile.email}`} class="contact-orb"
          >Let’s talk <span>↗</span></a
        >
      </div>
    </div>
    <div class="email-row">
      <a href={`mailto:${profile.email}`}>{profile.email}</a><button
        onclick={copyEmail}
        aria-label="Copy email address"
        class="copy-email"
        ><span aria-live="polite">{copied ? 'Copied ✓' : 'Copy email ⧉'}</span
        ></button
      >
    </div>
    {#if full}<p class="contact-note">
        For a project, an opportunity, or a good conversation.<br />Tell me what
        you have in mind.
      </p>{/if}
    <div class="contact-bottom">
      <a class="wordmark" href="/"
        >CJ<span>© {new Date().getFullYear()}</span></a
      ><span class="footer-location">MADE WITH CARE, IN THE PHILIPPINES.</span>
      <div class="socials">
        <a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer">LinkedIn ↗</a
        >
      </div>
      <a href="#top" class="back-top" aria-label="Back to top">↑</a>
    </div>
  </div>
</section>
