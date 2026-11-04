import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import ts from 'typescript'
const modules = new Map()
export async function moduleUrl(filename) {
  if (modules.has(filename)) return modules.get(filename)
  let source = ts.transpileModule(await readFile(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  for (const match of [...source.matchAll(/from ['"]([^'"]+)['"]/g)]) {
    const specifier = match[1]
    const url = specifier.startsWith('.')
      ? await moduleUrl(resolve(dirname(filename), specifier + '.ts'))
      : import.meta.resolve(specifier)
    source = source.replace(match[0], `from ${JSON.stringify(url)}`)
  }
  const url = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
  modules.set(filename, url)
  return url
}
