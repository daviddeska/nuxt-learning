import { marked } from 'marked'

const raw = import.meta.glob<string>('../lessons/*.md', { query: '?raw', import: 'default', eager: true })

export interface LessonContent {
  html: string
  starter: string
  solution: string
}

const FENCE = /```(\w+)[ \t]+(starter|solution)\n([\s\S]*?)\n```/g

marked.use({
  gfm: true,
  renderer: {
    link({ href, text }) {
      const external = /^https?:/.test(href)
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`
    },
  },
})

const cache = new Map<string, LessonContent>()

export function lessonContent(id: string): LessonContent {
  const hit = cache.get(id)
  if (hit) return hit
  const source = raw[`../lessons/${id}.md`] ?? ''
  let starter = ''
  let solution = ''
  const prose = source.replace(FENCE, (_, _lang: string, role: string, code: string) => {
    if (role === 'starter') starter = code
    else solution = code
    return ''
  })
  const result = { html: marked.parse(prose.trim(), { async: false }), starter, solution }
  cache.set(id, result)
  return result
}
