<script setup lang="ts">
import type { QuizQuestion } from '~/data/lessons'

const props = defineProps<{ questions: QuizQuestion[], lessonId: string }>()
const emit = defineEmits<{ passed: [] }>()

const picked = ref<(number | undefined)[]>([])
const checked = ref(false)

watch(() => props.lessonId, () => {
  picked.value = []
  checked.value = false
}, { immediate: true })

const allAnswered = computed(() => props.questions.every((_, i) => picked.value[i] !== undefined))
const correct = computed(() => props.questions.filter((q, i) => picked.value[i] === q.answer).length)

function check() {
  checked.value = true
  if (correct.value === props.questions.length) emit('passed')
}

function pick(qi: number, oi: number) {
  const next = [...picked.value]
  next[qi] = oi
  picked.value = next
  checked.value = false
}
</script>

<template>
  <div class="quiz">
    <fieldset v-for="(q, qi) in props.questions" :key="qi" class="question">
      <legend>{{ qi + 1 }}. {{ q.q }}</legend>
      <label
        v-for="(opt, oi) in q.options"
        :key="oi"
        class="option"
        :class="{
          right: checked && picked[qi] === oi && oi === q.answer,
          wrong: checked && picked[qi] === oi && oi !== q.answer,
        }"
      >
        <input type="radio" :name="`${props.lessonId}-q${qi}`" :checked="picked[qi] === oi" @change="pick(qi, oi)">
        <span>{{ opt }}</span>
      </label>
      <p v-if="checked && picked[qi] !== undefined" class="why" :class="picked[qi] === q.answer ? 'right' : 'wrong'">
        <strong>{{ picked[qi] === q.answer ? 'Správně.' : 'Ještě ne.' }}</strong>&#32;<span>{{ picked[qi] === q.answer ? q.why : 'Zkus jinou možnost.' }}</span>
      </p>
    </fieldset>

    <div class="row">
      <button class="btn primary" type="button" :disabled="!allAnswered" @click="check">Vyhodnotit</button>
      <span v-if="checked" class="score" aria-live="polite">
        {{ correct }} z {{ props.questions.length }} správně
      </span>
      <span v-else-if="!allAnswered" class="score">Odpověz na všechny otázky.</span>
    </div>
  </div>
</template>

<style scoped>
.quiz { display: grid; gap: 1.25rem; }
.question {
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 10px;
  padding: 1rem 1.1rem 1.1rem;
  margin: 0;
}
legend {
  float: left;
  width: 100%;
  padding: 0;
  margin-bottom: 0.4rem;
  font-weight: 600;
  line-height: 1.4;
}
legend + .option { clear: both; }
.option {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  padding: 0.45rem 0.6rem;
  margin-top: 0.3rem;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  line-height: 1.4;
}
.option:hover { background: var(--bg); }
.option input { margin-top: 0.2rem; accent-color: var(--accent); }
.option.right { border-color: var(--good); background: var(--good-soft); }
.option.wrong { border-color: var(--bad); background: var(--bad-soft); }
.why { margin: 0.6rem 0 0; font-size: 0.9375rem; }
.why.right strong { color: var(--good); }
.why.wrong strong { color: var(--bad); }
.row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.score { color: var(--muted); font-size: 0.9375rem; }
</style>
