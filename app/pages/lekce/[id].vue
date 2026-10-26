<script setup lang="ts">
import { lessonById, lessonsOf, neighbours, tracks } from '~/data/lessons'
import { lessonContent } from '~/utils/lessonContent'
import { highlightBlocks } from '~/utils/highlight'

const route = useRoute()
const id = computed(() => String(route.params.id))
const lesson = computed(() => lessonById(id.value))

if (!lesson.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tahle lekce neexistuje.', fatal: true })
}

const content = computed(() => lessonContent(id.value))
const track = computed(() => tracks.find(t => t.id === lesson.value!.track)!)
const position = computed(() => {
  const list = lessonsOf(lesson.value!.track)
  return { n: list.findIndex(l => l.id === id.value) + 1, of: list.length }
})
const nav = computed(() => neighbours(id.value))

const progress = useProgress()
const justPassed = ref(false)
watch(id, () => { justPassed.value = false })

function onPassed() {
  progress.markDone(id.value)
  justPassed.value = true
}

useHead(() => ({ title: `${lesson.value?.title}: ${track.value.title} | Kurz TS → Vue → Nuxt` }))

const prose = ref<HTMLElement>()
watch([prose, content], async () => {
  await nextTick()
  if (prose.value) highlightBlocks(prose.value)
}, { immediate: true, flush: 'post' })
</script>

<template>
  <article v-if="lesson" :key="lesson.id" class="lesson" :class="lesson.kind === 'quiz' ? 'single' : 'split'">
    <header class="head">
      <p class="where">{{ track.title }}, lekce {{ position.n }} z {{ position.of }}</p>
      <h1>{{ lesson.title }}</h1>
      <p v-if="progress.isDone(lesson.id) && !justPassed" class="done-tag">Tuhle lekci už máš hotovou.</p>
    </header>

    <div class="prose" ref="prose" v-html="content.html" />

    <div class="work">
      <Workbench
        v-if="lesson.kind !== 'quiz'"
        :key="lesson.id"
        :lesson="lesson"
        :starter="content.starter"
        :solution="content.solution"
        @passed="onPassed"
      />
      <QuizBlock v-else :questions="lesson.questions" :lesson-id="lesson.id" @passed="onPassed" />

      <div v-if="justPassed" class="passed" role="status">
        <p>
          <strong>Lekce hotová.</strong>
          <template v-if="nav.next">Další na řadě: {{ nav.next.title }}.</template>
          <template v-else>Prošel jsi celý kurz. Teď je čas postavit něco vlastního.</template>
        </p>
        <NuxtLink v-if="nav.next" class="btn primary" :to="`/lekce/${nav.next.id}`">Pokračovat na další lekci</NuxtLink>
        <NuxtLink v-else class="btn primary" to="/">Zpět na přehled</NuxtLink>
      </div>
    </div>

    <nav class="pager" aria-label="Předchozí a další lekce">
      <NuxtLink v-if="nav.prev" :to="`/lekce/${nav.prev.id}`" class="prev">
        <small>Předchozí</small>{{ nav.prev.title }}
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="nav.next" :to="`/lekce/${nav.next.id}`" class="next">
        <small>Další</small>{{ nav.next.title }}
      </NuxtLink>
    </nav>
  </article>
</template>

<style scoped>
.lesson {
  display: grid;
  gap: 1.5rem 2.5rem;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'head' 'prose' 'work' 'pager';
}
.head { grid-area: head; }
.prose { grid-area: prose; min-width: 0; }
.work { grid-area: work; min-width: 0; display: grid; gap: 1rem; align-content: start; }
.pager { grid-area: pager; }

@media (min-width: 1180px) {
  .lesson.split {
    grid-template-columns: minmax(0, 36rem) minmax(0, 1fr);
    grid-template-areas: 'head head' 'prose work' 'pager pager';
  }
  .lesson.split .work {
    position: sticky;
    top: 4.6rem;
    align-self: start;
    max-height: calc(100vh - 5.6rem);
    overflow-y: auto;
  }
}
.lesson.single { max-width: 44rem; }

.where { margin: 0 0 0.25rem; color: var(--accent); font-weight: 600; font-size: 0.9375rem; }
h1 { font-size: clamp(2rem, 4vw, 2.9rem); font-weight: 800; margin: 0; }
.done-tag { margin: 0.5rem 0 0; color: var(--muted); font-size: 0.9375rem; }

.prose { max-width: 40rem; font-size: 1.0625rem; }
.prose :deep(p), .prose :deep(ul), .prose :deep(ol) { margin: 0 0 1em; }
.prose :deep(li) { margin-bottom: 0.3em; }
.prose :deep(h2) {
  font-size: 1.45rem;
  font-weight: 800;
  margin: 2rem 0 0.6rem;
  padding-top: 1.25rem;
  border-top: 4px solid var(--accent);
  width: fit-content;
}
.prose :deep(:not(pre) > code) {
  font-size: 0.875em;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 0.05em 0.35em;
  border-radius: 4px;
  overflow-wrap: anywhere;
}
.prose :deep(pre) {
  background: var(--code-bg);
  color: var(--code-fg);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 1.1em;
}
.prose :deep(strong) { font-weight: 600; }

.prose :deep(.hl-keyword) { color: var(--code-keyword); }
.prose :deep(.hl-string) { color: var(--code-string); }
.prose :deep(.hl-number) { color: var(--code-number); }
.prose :deep(.hl-type) { color: var(--code-type); }
.prose :deep(.hl-fn) { color: var(--code-fn); }
.prose :deep(.hl-tag) { color: var(--code-tag); }
.prose :deep(.hl-attr) { color: var(--code-attr); }
.prose :deep(.hl-comment) { color: var(--code-comment); font-style: italic; }

.passed {
  border: 2px solid var(--good);
  background: var(--good-soft);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1rem;
}
.passed p { margin: 0; }
.passed .btn.primary { --accent: var(--good); }

.pager {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--line);
  padding-top: 1.25rem;
  margin-top: 1rem;
}
.pager a {
  text-decoration: none;
  color: var(--ink);
  font-weight: 600;
  display: grid;
  max-width: 48%;
}
.pager a:hover { color: var(--accent); }
.pager small { color: var(--muted); font-weight: 400; font-size: 0.8125rem; }
.pager .next { text-align: right; margin-left: auto; }
</style>
