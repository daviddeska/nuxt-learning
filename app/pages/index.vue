<script setup lang="ts">
import { lessons, tracks, lessonsOf } from '~/data/lessons'

const progress = useProgress()
const nextLesson = computed(() => lessons.find(l => !progress.isDone(l.id)))
const doneCount = computed(() => lessons.filter(l => progress.isDone(l.id)).length)
const started = computed(() => doneCount.value > 0)

function reset() {
  if (confirm('Smazat celý postup a všechen rozepsaný kód?')) progress.resetAll()
}
</script>

<template>
  <div class="home">
    <section class="hero">
      <h1>Z JavaScriptu<br>na Vue a&nbsp;Nuxt</h1>
      <p class="lede">
        {{ lessons.length }} krátkých lekcí. Ke každé je úloha, kterou píšeš přímo tady v prohlížeči, a testy ti hned řeknou, jestli funguje.
        JavaScript už umíš, takže začneme typy a pokračujeme přes Vue k Nuxtu.
      </p>

      <ol class="route" aria-label="Postup kurzem">
        <li
          v-for="l in lessons"
          :key="l.id"
          :class="{ done: progress.isDone(l.id), next: nextLesson?.id === l.id }"
          :style="{ '--c': `var(--${l.track})` }"
        >
          <NuxtLink :to="`/lekce/${l.id}`" :title="l.title">
            <span class="sr-only">{{ l.title }}{{ progress.isDone(l.id) ? ' (hotovo)' : '' }}</span>
          </NuxtLink>
        </li>
      </ol>

      <div class="cta">
        <NuxtLink v-if="nextLesson" class="btn primary" :to="`/lekce/${nextLesson.id}`">
          {{ started ? `Pokračovat: ${nextLesson.title}` : 'Začít první lekcí' }}
        </NuxtLink>
        <p v-else class="all-done">Máš hotových všech {{ lessons.length }} lekcí. Gratuluju!</p>
        <span v-if="started" class="tally">{{ doneCount }} z {{ lessons.length }} hotovo</span>
      </div>
    </section>

    <section class="tracks">
      <div v-for="(t, i) in tracks" :key="t.id" class="track" :style="{ '--c': `var(--${t.id})` }">
        <h2><span class="num">{{ i + 1 }}</span>{{ t.title }}</h2>
        <p>{{ t.blurb }} {{ lessonsOf(t.id).length }} {{ lessonsOf(t.id).length >= 5 ? 'lekcí' : 'lekce' }}.</p>
      </div>
    </section>

    <section class="how">
      <h2>Jak to funguje</h2>
      <p>
        Lekce o TypeScriptu kontrolují dvě věci: že kód dělá, co má, a že má správné typy. Kompilátor TypeScriptu běží přímo v prohlížeči,
        stejně jako překladač Vue komponent, takže nic neinstaluješ. Ve Vue lekcích vidíš komponentu v živém náhledu.
        Nuxt potřebuje Node.js a server, a ty se do prohlížeče nevejdou. Proto jeho lekce končí kvízem a odkazem, kde si ho vyzkoušíš naostro.
      </p>
      <p>
        Postup i rozepsaný kód se ukládají jen v tomhle prohlížeči.
        <button v-if="started" class="link" type="button" @click="reset">Smazat postup</button>
      </p>
    </section>
  </div>
</template>

<style scoped>
.home { max-width: 60rem; }

.hero { padding: clamp(1rem, 4vw, 3rem) 0 2.5rem; }
h1 {
  font-size: clamp(2.6rem, 7vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 0.98;
  margin: 0 0 1.25rem;
}
.lede { font-size: 1.15rem; max-width: 36rem; margin: 0 0 2.25rem; color: var(--muted); }

/* Trasa kurzu: jedna barevná linka, zastávka = lekce */
.route {
  list-style: none;
  margin: 0 0 2rem;
  padding: 0;
  display: flex;
  max-width: 44rem;
}
.route li {
  flex: 1;
  position: relative;
  height: 1.5rem;
  display: flex;
  align-items: center;
}
.route li::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  background: var(--c);
}
.route li:first-child::before { left: 50%; border-radius: 3px 0 0 3px; }
.route li:last-child::before { right: 50%; }
.route a {
  position: relative;
  margin: 0 auto;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 50%;
  background: var(--bg);
  border: 3px solid var(--c);
  display: block;
}
.route li.done a { background: var(--c); }
.route li.next a {
  width: 1.5rem;
  height: 1.5rem;
  box-shadow: 0 0 0 4px var(--bg), 0 0 0 6px var(--c);
}
.route a:hover { transform: scale(1.2); }

.cta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.cta .btn { font-size: 1.05rem; padding: 0.85rem 1.25rem; }
.tally { color: var(--muted); }
.all-done { margin: 0; font-weight: 600; }

.tracks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  border-top: 1px solid var(--line);
}
.track h2 {
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--c);
}
.num {
  font: 700 0.9rem var(--font-body);
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 50%;
  border: 3px solid var(--c);
  display: inline-grid;
  place-items: center;
  color: var(--ink);
}
.track p { margin: 0 0 0.75rem; color: var(--muted); }
.track ul { margin: 0; padding-left: 1.1rem; }
.track li { margin-bottom: 0.25rem; }
.track a { color: var(--ink); text-underline-offset: 3px; text-decoration-color: var(--line); }
.track a:hover { text-decoration-color: var(--c); }

.how { border-top: 1px solid var(--line); padding-top: 2rem; max-width: 40rem; }
.how h2 { font-size: 1.35rem; font-weight: 800; margin: 0 0 0.6rem; }
.how p { margin: 0 0 1em; }
.link {
  font: inherit;
  background: none;
  border: 0;
  padding: 0;
  color: var(--bad);
  text-decoration: underline;
  cursor: pointer;
}
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

@media (prefers-reduced-motion: no-preference) {
  .route a { transition: transform 0.15s; }
}
</style>
