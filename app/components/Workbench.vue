<script setup lang="ts">
import type { TsLesson, VueLesson } from '~/data/lessons'
import { runTest, type TestResult } from '~/utils/expect'
import { checkTypes, runCode, loadTypeScript, type CodeDiagnostic } from '~/utils/tsRunner'
import { compileSfc, mountSfc, createContext, emitSpies, type MountHandle } from '~/utils/vueRunner'

const props = defineProps<{
  lesson: TsLesson | VueLesson
  starter: string
  solution: string
}>()
const emit = defineEmits<{ passed: [] }>()

const progress = useProgress()
const code = ref(progress.savedCode(props.lesson.id) ?? props.starter)

const running = ref(false)
const ran = ref(false)
const checks = ref<TestResult[]>([])
const diagnostics = ref<CodeDiagnostic[]>([])
const logs = ref<string[]>([])
const error = ref<string>()
const loading = ref(true)

const isVue = computed(() => props.lesson.kind === 'vue')

// Ukládání rozepsaného kódu
let saveTimer: ReturnType<typeof setTimeout> | undefined
watch(code, (value) => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (value === props.starter) progress.forgetCode(props.lesson.id)
    else progress.saveCode(props.lesson.id, value)
  }, 400)
  if (isVue.value) schedulePreview()
})

// ── Náhled Vue komponenty (aktualizuje se při psaní) ──
const previewEl = ref<HTMLDivElement>()
const previewError = ref<string>()
const previewEvents = ref<string[]>([])
let previewHandle: MountHandle | null = null
const previewModel = ref<unknown>()
let previewTimer: ReturnType<typeof setTimeout> | undefined

function schedulePreview() {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(renderPreview, 500)
}

async function renderPreview() {
  if (!previewEl.value || props.lesson.kind !== 'vue') return
  const lesson = props.lesson
  try {
    const compiled = await compileSfc(code.value)
    previewHandle?.unmount()
    const spies = emitSpies(lesson.emits)
    const listeners = Object.fromEntries(Object.entries(spies.props).map(([key, handler]) => [key, (...args: unknown[]) => {
      handler(...args)
      const name = key.slice(2).replace(/^./, c => c.toLowerCase())
      previewEvents.value = [...previewEvents.value.slice(-4), `${name}(${args.map(a => JSON.stringify(a)).join(', ')})`]
      // v náhledu se chováme jako rodič s v-model: novou hodnotu pošleme zpátky jako prop
      if (name === 'update:modelValue') {
        previewModel.value = args[0]
        setTimeout(renderPreview, 0)
      }
    }]))
    const model = previewModel.value === undefined ? {} : { modelValue: previewModel.value }
    previewHandle = mountSfc(compiled, previewEl.value, { ...lesson.props, ...model, ...listeners })
    previewError.value = previewHandle.errors[0]
  }
  catch (e) {
    previewError.value = e instanceof Error ? e.message : String(e)
  }
}

onMounted(async () => {
  await loadTypeScript()
  loading.value = false
  if (isVue.value) {
    await nextTick()
    renderPreview()
  }
})

onBeforeUnmount(() => {
  previewHandle?.unmount()
  clearTimeout(previewTimer)
  clearTimeout(saveTimer)
})

// ── Kontrola ──
async function run() {
  if (running.value) return
  running.value = true
  error.value = undefined
  logs.value = []
  diagnostics.value = []
  checks.value = []
  try {
    if (props.lesson.kind === 'ts') await runTs(props.lesson)
    else await runVue(props.lesson)
  }
  finally {
    running.value = false
    ran.value = true
  }
  const passed = !error.value && diagnostics.value.length === 0 && checks.value.every(c => c.ok)
  if (passed) emit('passed')
}

async function runTs(lesson: TsLesson) {
  const typed = await checkTypes(code.value, lesson.typeTests)
  diagnostics.value = typed.diagnostics

  let api: Record<string, unknown> = {}
  let output: string[] = []
  try {
    const result = await runCode(code.value, lesson.exposes)
    api = result.api
    output = result.logs
  }
  catch (e) {
    error.value = `Kód spadl při spuštění: ${e instanceof Error ? e.message : String(e)}`
  }

  const results: TestResult[] = []
  if (!error.value) {
    for (const t of lesson.tests) results.push(await runTest(t.name, () => t.run(api)))
  }
  // console.log z asynchronního kódu může dorazit o chvilku později
  await new Promise(r => setTimeout(r, 60))
  logs.value = [...output]
  checks.value = [...typed.typeTests, ...results]
}

async function runVue(lesson: VueLesson) {
  let compiled
  try {
    compiled = await compileSfc(code.value)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    return
  }
  renderPreview()

  const results: TestResult[] = []
  for (const t of lesson.tests) {
    const sandbox = document.createElement('div')
    sandbox.setAttribute('aria-hidden', 'true')
    sandbox.style.cssText = 'position:fixed;left:-10000px;top:0;width:600px;'
    document.body.append(sandbox)
    const spies = emitSpies(lesson.emits)
    let handle: MountHandle | null = null
    const result = await runTest(t.name, async () => {
      handle = mountSfc(compiled, sandbox, { ...lesson.props, ...spies.props })
      await nextTick()
      if (handle.errors.length) throw new Error(handle.errors[0])
      await t.run(createContext(handle.root, spies.emitted, code.value))
      if (handle.errors.length) throw new Error(handle.errors[0])
    })
    results.push(result)
    try {
      (handle as MountHandle | null)?.unmount()
    }
    catch { /* komponenta mohla spadnout už při připojení */ }
    sandbox.remove()
  }
  checks.value = results
}

function resetCode() {
  if (code.value !== props.starter && !confirm('Vrátit kód do původního stavu? Tvoje úpravy se smažou.')) return
  code.value = props.starter
  ran.value = false
}

const showingSolution = ref(false)
function showSolution() {
  if (!confirm('Opravdu ukázat řešení? Zkus to nejdřív sám, zasekávání je součást učení.')) return
  code.value = props.solution
  showingSolution.value = true
  ran.value = false
}

const isMac = ref(false)
onMounted(() => { isMac.value = /Mac|iPhone|iPad/.test(navigator.platform) })
</script>

<template>
  <div class="bench">
    <div class="bar">
      <span class="file">{{ isVue ? 'Ukol.vue' : 'ukol.ts' }}</span>
      <div class="actions">
        <button class="btn quiet" type="button" @click="resetCode">Vrátit zadání</button>
        <button class="btn quiet" type="button" @click="showSolution">Ukázat řešení</button>
      </div>
    </div>

    <ClientOnly>
      <CodeEditor
        v-model="code"
        :language="isVue ? 'vue' : 'ts'"
        :diagnostics="diagnostics"
        :label="isVue ? 'Editor komponenty Ukol.vue' : 'Editor souboru ukol.ts'"
        class="editor"
        @run="run"
      />
    </ClientOnly>

    <div class="run-row">
      <button class="btn primary" type="button" :disabled="running || loading" @click="run">
        {{ loading ? 'Načítám kompilátor…' : running ? 'Kontroluju…' : 'Zkontrolovat' }}
      </button>
      <span class="hint"><kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd> + <kbd>Enter</kbd></span>
    </div>

    <ResultsPanel
      v-if="ran"
      :checks="checks"
      :diagnostics="diagnostics"
      :error="error"
      :logs="logs"
    />

    <section v-if="isVue" class="preview">
      <h3>Náhled</h3>
      <p v-if="previewError" class="preview-error">{{ previewError }}</p>
      <div ref="previewEl" class="preview-stage" :class="{ stale: previewError }" />
      <p v-if="previewEvents.length" class="events">
        Emitováno: <code v-for="(ev, i) in previewEvents" :key="i">{{ ev }}</code>
      </p>
    </section>
  </div>
</template>

<style scoped>
.bench {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem 0.35rem 1rem;
  border-bottom: 1px solid var(--line);
  border-top: 4px solid var(--accent);
}
.file { font: 600 0.8125rem var(--font-mono); color: var(--muted); }
.actions { display: flex; flex-wrap: wrap; justify-content: flex-end; }
.actions .btn { font-size: 0.8125rem; padding-block: 0.45rem; }

.editor { height: clamp(18rem, 52vh, 34rem); }

.run-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--line);
}
.hint { color: var(--muted); font-size: 0.8125rem; }

.preview { border-top: 1px solid var(--line); padding: 0.9rem 1rem 1rem; }
.preview h3 { font: 600 0.8125rem var(--font-body); color: var(--muted); margin: 0 0 0.5rem; letter-spacing: 0; }
.preview-stage {
  padding: 1rem;
  border: 1px dashed var(--line);
  border-radius: 8px;
  min-height: 4rem;
  overflow-x: auto;
}
.preview-stage.stale { opacity: 0.45; }
.preview-stage :deep(button) { font: inherit; padding: 0.3rem 0.65rem; }
.preview-stage :deep(input), .preview-stage :deep(textarea) { font: inherit; padding: 0.3rem 0.5rem; }
.preview-error {
  margin: 0 0 0.5rem;
  color: var(--bad);
  font: 0.8125rem/1.45 var(--font-mono);
  white-space: pre-wrap;
}
.events { margin: 0.6rem 0 0; font-size: 0.8125rem; color: var(--muted); display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: baseline; }
.events code { background: var(--code-bg); padding: 0.1rem 0.35rem; border-radius: 4px; color: var(--ink); }
</style>
