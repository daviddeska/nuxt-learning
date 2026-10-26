// Zvýraznění syntaxe v ukázkách kódu uvnitř textu lekce (stejné barvy jako editor).
import { highlightCode, tagHighlighter, tags as t } from '@lezer/highlight'
import { javascript } from '@codemirror/lang-javascript'
import { vue } from '@codemirror/lang-vue'

const highlighter = tagHighlighter([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.definitionKeyword, t.operatorKeyword], class: 'hl-keyword' },
  { tag: [t.string, t.special(t.string), t.attributeValue], class: 'hl-string' },
  { tag: [t.number, t.bool, t.null, t.atom], class: 'hl-number' },
  { tag: [t.typeName, t.className, t.namespace], class: 'hl-type' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], class: 'hl-fn' },
  { tag: [t.tagName, t.angleBracket], class: 'hl-tag' },
  { tag: t.attributeName, class: 'hl-attr' },
  { tag: [t.comment, t.lineComment, t.blockComment], class: 'hl-comment' },
])

const parsers = {
  ts: () => javascript({ typescript: true }).language.parser,
  vue: () => vue().language.parser,
}

export function highlightBlocks(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>('pre > code[class*="language-"]')) {
    if (el.dataset.hl) continue
    const lang = /language-(\w+)/.exec(el.className)?.[1]
    const parser = lang === 'vue' ? parsers.vue() : lang === 'ts' || lang === 'js' ? parsers.ts() : null
    if (!parser) continue
    const source = el.textContent ?? ''
    const frag = document.createDocumentFragment()
    highlightCode(source, parser.parse(source), highlighter, (text, cls) => {
      if (cls) {
        const span = document.createElement('span')
        span.className = cls
        span.textContent = text
        frag.append(span)
      }
      else {
        frag.append(text)
      }
    }, () => frag.append('\n'))
    el.replaceChildren(frag)
    el.dataset.hl = '1'
  }
}
