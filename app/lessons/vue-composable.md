**Composable** je obyčejná funkce, která používá `ref`, `computed`, `watch` a podobně a vrací reaktivní stav. Takhle se ve Vue sdílí logika mezi komponentami, podobně jako custom hooky v Reactu, jen bez jejich pravidel o pořadí volání.

```ts
// composables/useToggle.ts
import { ref } from 'vue'

export function useToggle(initial = false) {
  const on = ref(initial)
  const toggle = () => { on.value = !on.value }
  return { on, toggle }
}
```

```vue
<script setup lang="ts">
const { on: menuOpen, toggle: toggleMenu } = useToggle()
</script>
```

Konvence: název začíná na `use` a funkce vrací **objekt s refy**, ne holé hodnoty. Když takový objekt destrukturuješ, refy zůstanou refy a reaktivita se zachová. Kdybys vrátil `on.value`, předal bys jen hodnotu z daného okamžiku, která se už nikdy nezmění.

V Nuxtu stačí soubor uložit do `composables/` (v Nuxtu 4 do `app/composables/`) a funkci můžeš použít v jakékoli komponentě **bez importu**. Nuxt má i vlastní vestavěné composables: `useFetch`, `useState`, `useRoute` a další.

Návratový typ composable si TypeScript odvodí sám. Výslovně ho popiš, až když funkce slouží jako veřejné API pro víc lidí.

## Úkol

V hřišti máš jen jeden soubor, takže composable napíšeš přímo do `<script setup>`. Princip je stejný.

Napiš `useCounter(options)` s volbami `{ min: number, max: number, start: number }`, která vrací `{ count, inc, dec, reset, atMin, atMax }`:

- `inc` a `dec` mění hodnotu o 1, ale nikdy nepřekročí `min` a `max`,
- `reset` vrátí `start`,
- `atMin` a `atMax` jsou `computed` booleany.

Pak ji použij: `useCounter({ min: 0, max: 3, start: 1 })`. Tlačítka `data-test="dec"` a `data-test="inc"` mají být `disabled` na hranicích, `data-test="value"` ukazuje číslo a `data-test="reset"` resetuje.

```vue starter
<script setup lang="ts">
import { ref, computed } from 'vue'

interface CounterOptions {
  min: number
  max: number
  start: number
}

// function useCounter(...) { ... }

</script>

<template>
  <div class="stepper">
    <button data-test="dec">−</button>
    <strong data-test="value">0</strong>
    <button data-test="inc">+</button>
    <button data-test="reset">Reset</button>
  </div>
</template>

<style>
.stepper { display: flex; gap: .5rem; align-items: center; }
.stepper strong { min-width: 2ch; text-align: center; }
</style>
```

```vue solution
<script setup lang="ts">
import { ref, computed } from 'vue'

interface CounterOptions {
  min: number
  max: number
  start: number
}

function useCounter({ min, max, start }: CounterOptions) {
  const count = ref(start)
  const atMin = computed(() => count.value <= min)
  const atMax = computed(() => count.value >= max)
  const inc = () => { if (!atMax.value) count.value++ }
  const dec = () => { if (!atMin.value) count.value-- }
  const reset = () => { count.value = start }
  return { count, inc, dec, reset, atMin, atMax }
}

const { count, inc, dec, reset, atMin, atMax } = useCounter({ min: 0, max: 3, start: 1 })
</script>

<template>
  <div class="stepper">
    <button data-test="dec" :disabled="atMin" @click="dec">−</button>
    <strong data-test="value">{{ count }}</strong>
    <button data-test="inc" :disabled="atMax" @click="inc">+</button>
    <button data-test="reset" @click="reset">Reset</button>
  </div>
</template>

<style>
.stepper { display: flex; gap: .5rem; align-items: center; }
.stepper strong { min-width: 2ch; text-align: center; }
</style>
```
