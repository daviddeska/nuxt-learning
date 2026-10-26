// Překlad jednosouborové komponenty (.vue) v prohlížeči a její připojení do stránky.
import * as Vue from 'vue'
import type { Component } from 'vue'
import { loadTypeScript } from './tsRunner'

export interface CompiledSfc {
  component: Component
  css: string
}

export class SfcError extends Error {}

let uid = 0

export async function compileSfc(source: string): Promise<CompiledSfc> {
  const [sfc, ts] = await Promise.all([import('vue/compiler-sfc'), loadTypeScript()])
  const { descriptor, errors } = sfc.parse(source, { filename: 'Ukol.vue' })
  if (errors.length)
    throw new SfcError(`Soubor .vue se nedá přečíst: ${errors.map(e => e.message).join('; ')}`)
  if (!descriptor.scriptSetup)
    throw new SfcError('Komponenta potřebuje blok <script setup lang="ts">.')
  if (!descriptor.template)
    throw new SfcError('Komponenta potřebuje blok <template>.')

  const id = `ukol-${++uid}`
  let script
  try {
    script = sfc.compileScript(descriptor, { id, inlineTemplate: true })
  }
  catch (e) {
    throw new SfcError(e instanceof Error ? e.message : String(e))
  }

  let js = ts.transpileModule(script.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: false },
    reportDiagnostics: false,
  }).outputText

  // import { ref as _ref, computed } from 'vue'  →  const { ref: _ref, computed } = __vue
  js = js.replace(/import\s*\{([^}]*)\}\s*from\s*['"]vue['"];?/g, (_, names: string) => {
    const parts = names.split(',').map(n => n.trim()).filter(Boolean).map(n => n.replace(/\s+as\s+/, ': '))
    return `const { ${parts.join(', ')} } = __vue;`
  })
  const otherImport = js.match(/^\s*import\s.+from\s*['"]([^'"]+)['"]/m)
  if (otherImport)
    throw new SfcError(`V tomhle hřišti jde importovat jen z 'vue' (našel jsem import z '${otherImport[1]}').`)
  js = js.replace(/export\s+default\s+/, '__exports.default = ')

  const exportsObj: { default?: Component } = {}
  try {
    // eslint-disable-next-line no-new-func
    new Function('__vue', '__exports', js)(Vue, exportsObj)
  }
  catch (e) {
    throw new SfcError(`Skript komponenty spadl: ${e instanceof Error ? e.message : String(e)}`)
  }
  if (!exportsObj.default) throw new SfcError('Komponentu se nepodařilo sestavit.')

  return { component: exportsObj.default, css: descriptor.styles.map(s => s.content).join('\n') }
}

export interface MountHandle {
  root: HTMLElement
  unmount: () => void
  errors: string[]
}

export function mountSfc(compiled: CompiledSfc, el: HTMLElement, props: Record<string, unknown> = {}): MountHandle {
  el.innerHTML = ''
  const style = document.createElement('style')
  style.textContent = compiled.css
  const host = document.createElement('div')
  el.append(style, host)
  const errors: string[] = []
  const app = Vue.createApp(compiled.component, props)
  app.config.errorHandler = (err) => {
    errors.push(err instanceof Error ? err.message : String(err))
  }
  app.config.warnHandler = (msg) => {
    if (/Failed to resolve component|Property .* was accessed during render/.test(msg)) errors.push(msg)
  }
  app.mount(host)
  return {
    root: host,
    errors,
    unmount: () => {
      app.unmount()
      el.innerHTML = ''
    },
  }
}

/** Pomocník, který testy dostanou: hledá prvky, kliká, píše a čeká na překreslení. */
export interface VueTestContext {
  root: HTMLElement
  find: (selector: string) => HTMLElement
  findAll: (selector: string) => HTMLElement[]
  exists: (selector: string) => boolean
  text: (selector: string) => string
  click: (selector: string) => Promise<void>
  type: (selector: string, value: string) => Promise<void>
  tick: () => Promise<void>
  wait: (ms: number) => Promise<void>
  emitted: Record<string, unknown[][]>
  /** Zdrojový kód komponenty, pro testy, které kontrolují zápis. */
  source: string
}

export function createContext(root: HTMLElement, emitted: Record<string, unknown[][]>, source: string): VueTestContext {
  const find = (selector: string) => {
    const el = root.querySelector<HTMLElement>(selector)
    if (!el) throw new Error(`V komponentě chybí prvek ${selector}.`)
    return el
  }
  const tick = async () => {
    await Vue.nextTick()
    await Vue.nextTick()
  }
  return {
    root,
    find,
    findAll: s => [...root.querySelectorAll<HTMLElement>(s)],
    exists: s => root.querySelector(s) !== null,
    text: s => find(s).textContent?.trim() ?? '',
    async click(s) {
      find(s).click()
      await tick()
    },
    async type(s, value) {
      const el = find(s) as HTMLInputElement
      el.value = value
      el.dispatchEvent(new Event('input', { bubbles: true }))
      await tick()
    },
    tick,
    wait: ms => new Promise(r => setTimeout(r, ms)),
    emitted,
    source,
  }
}

/** Z názvů událostí udělá posluchače `onXxx`, které si zapisují, co komponenta emitovala. */
export function emitSpies(names: string[] = []) {
  const emitted: Record<string, unknown[][]> = {}
  const props: Record<string, (...args: unknown[]) => void> = {}
  for (const name of names) {
    emitted[name] = []
    const key = `on${name[0]!.toUpperCase()}${name.slice(1).replace(/-(\w)/g, (_, c: string) => c.toUpperCase())}`
    props[key] = (...args: unknown[]) => emitted[name]!.push(args)
  }
  return { emitted, props }
}
