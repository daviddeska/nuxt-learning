<script setup lang="ts">
import type { TestResult } from '~/utils/expect'
import type { CodeDiagnostic } from '~/utils/tsRunner'

const props = defineProps<{
  checks: TestResult[]
  diagnostics?: CodeDiagnostic[]
  error?: string
  logs?: string[]
}>()

const failed = computed(() => props.checks.filter(c => !c.ok).length)
const typeErrors = computed(() => props.diagnostics?.length ?? 0)
const allGood = computed(() => !props.error && failed.value === 0 && typeErrors.value === 0)

const summary = computed(() => {
  if (props.error) return 'Kód se nepodařilo spustit.'
  if (allGood.value) {
    const n = props.checks.length
    if (n === 1) return 'Hotovo. Kontrola prošla.'
    return n <= 4 ? `Hotovo. Všechny ${n} kontroly prošly.` : `Hotovo. Všech ${n} kontrol prošlo.`
  }
  const parts: string[] = []
  if (typeErrors.value) parts.push(`${typeErrors.value} ${plural(typeErrors.value, 'chyba typů', 'chyby typů', 'chyb typů')}`)
  if (failed.value) parts.push(`${failed.value} z ${props.checks.length} kontrol ${failed.value === 1 ? 'neprošla' : 'neprošlo'}`)
  return `${parts.join(', ')}.`
})

function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  if (n >= 2 && n <= 4) return few
  return many
}
</script>

<template>
  <section class="results" :class="allGood ? 'good' : 'bad'" aria-live="polite">
    <p class="summary">
      <span class="mark" aria-hidden="true">{{ allGood ? '✓' : '✗' }}</span>
      {{ summary }}
    </p>

    <p v-if="props.error" class="error">{{ props.error }}</p>

    <div v-if="typeErrors" class="block">
      <h3>Chyby, které našel TypeScript</h3>
      <ul class="diags">
        <li v-for="(d, i) in props.diagnostics" :key="i">
          <span class="where">ř. {{ d.line }}</span>
          <span>{{ d.message }}</span>
        </li>
      </ul>
    </div>

    <div v-if="props.checks.length" class="block">
      <h3>Kontroly</h3>
      <ul class="checks">
        <li v-for="c in props.checks" :key="c.name" :class="c.ok ? 'ok' : 'ko'">
          <span class="mark" aria-hidden="true">{{ c.ok ? '✓' : '✗' }}</span>
          <span>
            {{ c.name }}
            <span class="sr-only">{{ c.ok ? '(prošlo)' : '(neprošlo)' }}</span>
            <small v-if="c.message">{{ c.message }}</small>
          </span>
        </li>
      </ul>
    </div>

    <div v-if="props.logs?.length" class="block">
      <h3>Výstup console.log</h3>
      <pre class="logs">{{ props.logs.join('\n') }}</pre>
    </div>
  </section>
</template>

<style scoped>
.results {
  border-top: 1px solid var(--line);
  padding: 0.9rem 1rem 1rem;
  font-size: 0.9375rem;
}
.summary {
  margin: 0;
  font-weight: 600;
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}
.good .summary { color: var(--good); }
.bad .summary { color: var(--bad); }

.block { margin-top: 0.9rem; }
h3 {
  font: 600 0.8125rem var(--font-body);
  color: var(--muted);
  margin: 0 0 0.35rem;
  letter-spacing: 0;
}
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.35rem; }

.diags li {
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.45;
}
.where { color: var(--bad); }

.checks li { display: flex; gap: 0.5rem; line-height: 1.4; }
.checks .mark { flex: none; width: 1rem; font-weight: 700; }
.checks .ok .mark { color: var(--good); }
.checks .ko .mark { color: var(--bad); }
.checks small { display: block; color: var(--muted); font-size: 0.875rem; margin-top: 0.1rem; }

.error {
  background: var(--bad-soft);
  color: var(--ink);
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  margin: 0.6rem 0 0;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  white-space: pre-wrap;
}

.logs {
  margin: 0;
  background: var(--code-bg);
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  overflow-x: auto;
  max-height: 10rem;
}

.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
