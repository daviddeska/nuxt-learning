// Postup v kurzu: hotové lekce a rozepsaný kód. Ukládá se do localStorage v prohlížeči.

interface ProgressData {
  done: string[]
  code: Record<string, string>
}

const KEY = 'kurz-ts-vue-nuxt:v1'

function read(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressData>
      return { done: parsed.done ?? [], code: parsed.code ?? {} }
    }
  }
  catch {
    // localStorage nemusí být dostupné (soukromý režim apod.), kurz pak jede bez ukládání
  }
  return { done: [], code: {} }
}

export function useProgress() {
  const state = useState<ProgressData>('progress', read)

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state.value))
    }
    catch {
      // bez ukládání
    }
  }

  return {
    done: computed(() => state.value.done),
    isDone: (id: string) => state.value.done.includes(id),
    markDone(id: string) {
      if (!state.value.done.includes(id)) {
        state.value.done = [...state.value.done, id]
        save()
      }
    },
    savedCode: (id: string): string | undefined => state.value.code[id],
    saveCode(id: string, code: string) {
      state.value.code = { ...state.value.code, [id]: code }
      save()
    },
    forgetCode(id: string) {
      const { [id]: _, ...rest } = state.value.code
      state.value.code = rest
      save()
    },
    resetAll() {
      state.value = { done: [], code: {} }
      save()
    },
  }
}
