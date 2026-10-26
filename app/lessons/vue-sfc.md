Ve Vue je komponenta jeden soubor `.vue` se třemi bloky: logika, šablona a styly.

```vue
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('světe')
</script>

<template>
  <h1>Ahoj, {{ name }}!</h1>
</template>

<style scoped>
h1 { color: teal; }
</style>
```

`<script setup>` je moderní zápis (Composition API). Všechno, co v něm nadeklaruješ, je rovnou k dispozici v šabloně. `lang="ts"` zapne TypeScript.

**`ref`** vytvoří reaktivní hodnotu. V JavaScriptu k ní přistupuješ přes `.value`, v šabloně se `.value` doplní samo:

```ts
const count = ref(0)      // Ref<number>, typ se odvodí z hodnoty
count.value++             // změna → Vue překreslí vše, co count používá
```

Dvojité složené závorky `{{ }}` vloží do šablony výsledek výrazu. Událost navážeš přes `@click` (zkratka za `v-on:click`):

```vue
<button @click="count++">+1</button>
<p>{{ count * 2 }}</p>
```

Vůči čistému JS je ten rozdíl hlavně v tom, že **neupravuješ DOM ručně**. Měníš data a Vue se postará, aby stránka odpovídala.

## Úkol

Udělej počítadlo kliknutí:

- tlačítko `data-test="plus"` přičte 1,
- tlačítko `data-test="reset"` vynuluje,
- odstavec `data-test="count"` ukazuje text `Kliknuto: 3×` (s aktuálním číslem).

Výsledek si můžeš proklikat v náhledu pod editorem.

```vue starter
<script setup lang="ts">
import { ref } from 'vue'

// reaktivní počítadlo
</script>

<template>
  <div class="counter">
    <p data-test="count">Kliknuto: 0×</p>
    <button data-test="plus">+1</button>
    <button data-test="reset">Vynulovat</button>
  </div>
</template>

<style>
.counter { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.counter p { margin: 0; min-width: 8rem; }
</style>
```

```vue solution
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="counter">
    <p data-test="count">Kliknuto: {{ count }}×</p>
    <button data-test="plus" @click="count++">+1</button>
    <button data-test="reset" @click="count = 0">Vynulovat</button>
  </div>
</template>

<style>
.counter { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.counter p { margin: 0; min-width: 8rem; }
</style>
```
