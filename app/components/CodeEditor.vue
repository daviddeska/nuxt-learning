<script setup lang="ts">
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentOnInput, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { setDiagnostics, lintGutter } from '@codemirror/lint'
import { javascript } from '@codemirror/lang-javascript'
import { vue } from '@codemirror/lang-vue'
import { tags as t } from '@lezer/highlight'
import type { CodeDiagnostic } from '~/utils/tsRunner'

const props = defineProps<{
  language: 'ts' | 'vue'
  diagnostics?: CodeDiagnostic[]
  label: string
}>()

const model = defineModel<string>({ required: true })
const emit = defineEmits<{ run: [] }>()

const host = ref<HTMLDivElement>()
let view: EditorView | null = null
const lang = new Compartment()

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.definitionKeyword, t.operatorKeyword], color: 'var(--code-keyword)' },
  { tag: [t.string, t.special(t.string), t.attributeValue], color: 'var(--code-string)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--code-number)' },
  { tag: [t.typeName, t.className, t.namespace], color: 'var(--code-type)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--code-fn)' },
  { tag: [t.tagName, t.angleBracket], color: 'var(--code-tag)' },
  { tag: t.attributeName, color: 'var(--code-attr)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: t.propertyName, color: 'var(--code-prop)' },
])

const theme = EditorView.theme({
  '&': { color: 'var(--code-fg)', backgroundColor: 'var(--code-bg)', fontSize: '0.875rem', height: '100%' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--accent)', padding: '0.75rem 0' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'var(--code-gutter)', border: 'none', lineHeight: '1.6' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--code-active)' },
  '&.cm-focused': { outline: 'none' },
  '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--accent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--code-selection) !important' },
  '.cm-matchingBracket': { backgroundColor: 'var(--code-active)', outline: '1px solid var(--code-gutter)' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)' },
  '.cm-diagnostic-error': { borderLeftColor: 'var(--bad)' },
})

function languageExtension() {
  return props.language === 'vue' ? vue() : javascript({ typescript: true })
}

onMounted(() => {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        indentUnit.of('  '),
        EditorState.tabSize.of(2),
        lintGutter(),
        keymap.of([
          { key: 'Mod-Enter', run: () => { emit('run'); return true } },
          { key: 'Mod-s', run: () => { emit('run'); return true }, preventDefault: true },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        lang.of(languageExtension()),
        syntaxHighlighting(highlight),
        theme,
        EditorView.contentAttributes.of({ 'aria-label': props.label }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) model.value = u.state.doc.toString()
        }),
      ],
    }),
  })
  // po načtení webových písem přeměřit výšky řádků, aby čísla řádků seděla
  document.fonts?.ready.then(() => view?.requestMeasure())
  setTimeout(() => view?.requestMeasure(), 300)
})

watch(model, (value) => {
  if (view && value !== view.state.doc.toString())
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
})

watch(() => props.language, () => {
  view?.dispatch({ effects: lang.reconfigure(languageExtension()) })
})

watch(() => props.diagnostics, (list) => {
  if (!view) return
  const len = view.state.doc.length
  view.dispatch(setDiagnostics(view.state, (list ?? []).map(d => ({
    from: Math.min(d.from, len),
    to: Math.min(Math.max(d.to, d.from + 1), len),
    severity: 'error' as const,
    message: d.message,
  }))))
})

onBeforeUnmount(() => view?.destroy())
</script>

<template>
  <div ref="host" class="editor" />
</template>

<style scoped>
.editor {
  height: 100%;
  min-height: 18rem;
  overflow: hidden;
}
.editor :deep(.cm-editor) {
  height: 100%;
}
</style>
