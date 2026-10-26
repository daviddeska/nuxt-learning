// Malá sada asercí pro testy úloh. Chyba = neúspěšný test, text chyby se ukáže studentovi.

export class AssertionError extends Error {}

function show(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`
  if (value === undefined) return 'undefined'
  if (typeof value === 'function') return 'funkce'
  try {
    return JSON.stringify(value)
  }
  catch {
    return String(value)
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  if (ka.length !== kb.length) return false
  return ka.every(k => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
}

export function expect(actual: unknown) {
  return {
    toBe(expected: unknown, hint?: string) {
      if (!Object.is(actual, expected))
        throw new AssertionError(hint ?? `Čekal jsem ${show(expected)}, dostal jsem ${show(actual)}.`)
    },
    toEqual(expected: unknown, hint?: string) {
      if (!deepEqual(actual, expected))
        throw new AssertionError(hint ?? `Čekal jsem ${show(expected)}, dostal jsem ${show(actual)}.`)
    },
    toBeFunction(name: string) {
      if (typeof actual !== 'function')
        throw new AssertionError(`Nenašel jsem funkci ${name}. Zkontroluj, že ji máš nadeklarovanou a že se jmenuje přesně takhle.`)
    },
    toContain(part: string, hint?: string) {
      if (typeof actual !== 'string' || !actual.includes(part))
        throw new AssertionError(hint ?? `Čekal jsem text obsahující ${show(part)}, dostal jsem ${show(actual)}.`)
    },
    toMatch(re: RegExp, hint: string) {
      if (typeof actual !== 'string' || !re.test(actual))
        throw new AssertionError(hint)
    },
    toBeTruthy(hint: string) {
      if (!actual) throw new AssertionError(hint)
    },
  }
}

export interface TestResult {
  name: string
  ok: boolean
  message?: string
}

export async function runTest(name: string, fn: () => unknown, timeoutMs = 2000): Promise<TestResult> {
  try {
    await Promise.race([
      Promise.resolve().then(fn),
      new Promise((_, reject) => setTimeout(() => reject(new AssertionError('Test trval moc dlouho (víc než 2 s). Nečeká se někde na Promise, který se nikdy nevyřeší?')), timeoutMs)),
    ])
    return { name, ok: true }
  }
  catch (e) {
    const message = e instanceof AssertionError
      ? e.message
      : `Kód při testu spadl: ${e instanceof Error ? e.message : String(e)}`
    return { name, ok: false, message }
  }
}
