// Kontrola typů a spuštění TypeScriptu přímo v prohlížeči.
// Kompilátor (typescript 5.9, poslední verze s JS API) a definice standardní knihovny
// se načítají líně, až když je student poprvé potřebuje.

type TS = typeof import('typescript')

export interface CodeDiagnostic {
  from: number // offset v kódu studenta
  to: number
  line: number
  column: number
  message: string
}

export interface TypeTest {
  name: string
  code: string
}

export interface CheckResult {
  diagnostics: CodeDiagnostic[]
  typeTests: { name: string, ok: boolean, message?: string }[]
}

const libLoaders = import.meta.glob<string>(
  [
    '../../node_modules/typescript/lib/lib.es5.d.ts',
    '../../node_modules/typescript/lib/lib.decorators*.d.ts',
    '../../node_modules/typescript/lib/lib.es201[5-9]*.d.ts',
    '../../node_modules/typescript/lib/lib.es2020*.d.ts',
    '!../../node_modules/typescript/lib/*.full.d.ts',
  ],
  { query: '?raw', import: 'default' },
)

const GLOBALS = `
declare const console: {
  log(...data: unknown[]): void
  info(...data: unknown[]): void
  warn(...data: unknown[]): void
  error(...data: unknown[]): void
}
declare function setTimeout(handler: () => void, timeout?: number): number
declare function clearTimeout(id: number | undefined): void
`

let tsPromise: Promise<TS> | null = null
let libs: Map<string, string> | null = null
const libSourceCache = new Map<string, import('typescript').SourceFile>()

export function loadTypeScript(): Promise<TS> {
  if (!tsPromise) {
    tsPromise = (async () => {
      const [mod, entries] = await Promise.all([
        import('typescript'),
        Promise.all(Object.entries(libLoaders).map(async ([path, load]) => [path.split('/').pop()!, await load()] as const)),
      ])
      libs = new Map(entries)
      libs.set('globals.d.ts', GLOBALS)
      return ((mod as unknown as { default?: TS }).default ?? mod) as TS
    })()
  }
  return tsPromise
}

const USER_FILE = 'ukol.ts'

function options(ts: TS): import('typescript').CompilerOptions {
  return {
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    lib: ['lib.es2020.d.ts'],
    types: [],
    noEmit: true,
    skipLibCheck: true,
    noUnusedLocals: false,
  }
}

/**
 * Zkontroluje typy v kódu studenta. Za kód připojí skryté typové testy
 * (typicky řádky s `// @ts-expect-error`) a chyby v nich přiřadí konkrétnímu testu.
 */
export async function checkTypes(code: string, typeTests: TypeTest[] = []): Promise<CheckResult> {
  const ts = await loadTypeScript()
  const segments: { name: string, start: number }[] = []
  let full = code
  for (const t of typeTests) {
    full += '\n\n'
    segments.push({ name: t.name, start: full.length })
    full += `{\n${t.code}\n}`
  }

  const opts = options(ts)
  const host: import('typescript').CompilerHost = {
    getSourceFile(fileName, languageVersion) {
      if (fileName === USER_FILE) return ts.createSourceFile(fileName, full, languageVersion, true)
      const text = libs!.get(fileName)
      if (text === undefined) return undefined
      let sf = libSourceCache.get(fileName)
      if (!sf) {
        sf = ts.createSourceFile(fileName, text, languageVersion, true)
        libSourceCache.set(fileName, sf)
      }
      return sf
    },
    getDefaultLibFileName: () => 'lib.es2020.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: name => name === USER_FILE || libs!.has(name),
    readFile: name => (name === USER_FILE ? full : libs!.get(name)),
    getCanonicalFileName: name => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  }

  const program = ts.createProgram([USER_FILE, 'globals.d.ts'], opts, host)
  const all = ts.getPreEmitDiagnostics(program).filter(d => d.file?.fileName === USER_FILE)

  const diagnostics: CodeDiagnostic[] = []
  const failures = new Map<string, string>()
  for (const d of all) {
    const start = d.start ?? 0
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n')
    if (start <= code.length) {
      const { line, character } = d.file!.getLineAndCharacterOfPosition(start)
      diagnostics.push({ from: start, to: Math.min(start + (d.length ?? 1), code.length), line: line + 1, column: character + 1, message })
    }
    else {
      const seg = [...segments].reverse().find(s => start >= s.start)
      if (seg && !failures.has(seg.name)) failures.set(seg.name, message)
    }
  }

  return {
    diagnostics,
    typeTests: typeTests.map(t => failures.has(t.name)
      ? { name: t.name, ok: false, message: explainTypeTest(failures.get(t.name)!) }
      : { name: t.name, ok: true }),
  }
}

function explainTypeTest(message: string): string {
  if (message.includes('Unused \'@ts-expect-error\''))
    return 'TypeScript tady měl nahlásit chybu, ale nenahlásil. Tvoje typy jsou zřejmě moc volné (třeba any nebo chybějící anotace).'
  return `TypeScript nahlásil: ${message}`
}

export interface RunOutput {
  api: Record<string, unknown>
  logs: string[]
}

/** Přeloží kód do JavaScriptu a spustí ho. Vrátí hodnoty pojmenované v `exposes`. */
export async function runCode(code: string, exposes: string[]): Promise<RunOutput> {
  const ts = await loadTypeScript()
  const js = ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    reportDiagnostics: false,
  }).outputText

  const logs: string[] = []
  const fmt = (args: unknown[]) => args.map(a => (typeof a === 'string' ? a : safeJson(a))).join(' ')
  const fakeConsole = {
    log: (...a: unknown[]) => logs.push(fmt(a)),
    info: (...a: unknown[]) => logs.push(fmt(a)),
    warn: (...a: unknown[]) => logs.push(`⚠ ${fmt(a)}`),
    error: (...a: unknown[]) => logs.push(`✖ ${fmt(a)}`),
  }
  const collect = exposes.map(n => `${JSON.stringify(n)}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(',\n')
  // eslint-disable-next-line no-new-func
  const fn = new Function('console', 'exports', 'module', `"use strict";\n${js}\n;return {\n${collect}\n};`)
  const exportsObj = {}
  const api = fn(fakeConsole, exportsObj, { exports: exportsObj }) as Record<string, unknown>
  return { api, logs }
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v) ?? String(v)
  }
  catch {
    return String(v)
  }
}
