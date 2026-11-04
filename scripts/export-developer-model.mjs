import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { moduleUrl } from './model-source.mjs'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

// Export the same original geometry used by the hero. Blank screen materials
// let other viewers edit the displays without needing browser canvas textures.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// Node provides Blob, while Three's exporter expects the browser FileReader API.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result
      this.onloadend?.()
    })
  }
}
const { createDeveloperDesk } = await import(
  await moduleUrl(resolve(root, 'src/lib/developer-desk.ts'))
)
const { group } = createDeveloperDesk({ screens: false })
group.userData = {
  title: 'Carl Developer Workstation',
  author: 'Carl James Roxas',
  description:
    'Original stylized code-modeled workstation based on supplied personal references. Separate editable character, chair, desk, laptop and monitor. Screens intentionally blank.',
}
const binary = await new GLTFExporter().parseAsync(group, {
  binary: true,
  onlyVisible: true,
})
const output = resolve(root, 'public/models/Carl-Developer-Workstation.glb')
await writeFile(output, Buffer.from(binary))
const header = new DataView(binary)
if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2)
  throw new Error('Invalid GLB header')
const jsonLength = header.getUint32(12, true)
const gltf = JSON.parse(
  new TextDecoder().decode(new Uint8Array(binary, 20, jsonLength)),
)
const names = gltf.nodes.map((node) => node.name).filter(Boolean)
for (const expected of [
  'Carl_character',
  'Mesh_office_chair',
  'Ivory_desk',
  'Laptop',
  'Second_monitor',
  'Monitor_screen',
  'Laptop_screen',
]) {
  if (!names.includes(expected))
    throw new Error(`Missing editable part: ${expected}`)
}
if (gltf.buffers.some((buffer) => buffer.uri))
  throw new Error('Expected a self-contained binary model')
console.log(
  JSON.stringify({
    output,
    bytes: binary.byteLength,
    meshes: gltf.meshes.length,
    editablePartsVerified: true,
  }),
)
