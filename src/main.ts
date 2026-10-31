import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initializeMotion } from './lib/motion-preference'
initializeMotion()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
