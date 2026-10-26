**`v-model`** propojí formulářové pole s ref oběma směry. Když píšeš, mění se hodnota, a když změníš hodnotu, změní se pole:

```vue
<input v-model="name" />
<input v-model.number="age" type="number" />   <!-- .number převede na číslo -->
<input v-model.trim="email" />                  <!-- .trim ořízne mezery -->
<input type="checkbox" v-model="agree" />
```

**`computed`** je hodnota odvozená z jiných reaktivních hodnot. Přepočítá se, jen když se změní něco, na čem závisí, a výsledek si pamatuje:

```ts
import { ref, computed } from 'vue'

const first = ref('Eva')
const last = ref('Nováková')
const full = computed(() => `${first.value} ${last.value}`)  // ComputedRef<string>
```

Kdy `computed` a kdy funkci? Když jde o hodnotu, kterou zobrazuješ, použij `computed`. Funkci nech na akce (kliknutí, odeslání). Vlastní stav, který jde odvodit z jiného stavu, nedrž v dalším `ref`. Dvě kopie téže informace se dřív nebo později rozjedou.

TypeScript typ `computed` odvodí z návratové hodnoty. Když ho chceš zadat výslovně, napiš `computed<string>(() => ...)`.

## Úkol

Formulář pro krátký vzkaz:

- `<input data-test="name">` a `<textarea data-test="message">` napoj přes `v-model`,
- `data-test="preview"` ukazuje `Vzkaz od NAME` (jméno oříznuté o mezery), a když je jméno prázdné, tak `Vzkaz od anonyma`,
- `data-test="counter"` ukazuje kolik znaků zbývá, ve tvaru `120 / 140`, kde 120 je zbytek a 140 maximum,
- tlačítko `data-test="send"` je `disabled`, když je zpráva prázdná, nebo delší než 140 znaků.

Na odvozené hodnoty použij `computed`.

```vue starter
<script setup lang="ts">
import { ref, computed } from 'vue'

const MAX = 140
</script>

<template>
  <form class="note" @submit.prevent>
    <input data-test="name" placeholder="Tvoje jméno" />
    <textarea data-test="message" rows="3" placeholder="Vzkaz"></textarea>
    <p data-test="preview">Vzkaz od anonyma</p>
    <p data-test="counter">140 / 140</p>
    <button data-test="send">Odeslat</button>
  </form>
</template>

<style>
.note { display: grid; gap: .5rem; max-width: 22rem; }
.note p { margin: 0; }
</style>
```

```vue solution
<script setup lang="ts">
import { ref, computed } from 'vue'

const MAX = 140
const name = ref('')
const message = ref('')

const author = computed(() => name.value.trim() || 'anonyma')
const remaining = computed(() => MAX - message.value.length)
const canSend = computed(() => message.value.length > 0 && remaining.value >= 0)
</script>

<template>
  <form class="note" @submit.prevent>
    <input v-model="name" data-test="name" placeholder="Tvoje jméno" />
    <textarea v-model="message" data-test="message" rows="3" placeholder="Vzkaz"></textarea>
    <p data-test="preview">Vzkaz od {{ author }}</p>
    <p data-test="counter">{{ remaining }} / {{ MAX }}</p>
    <button data-test="send" :disabled="!canSend">Odeslat</button>
  </form>
</template>

<style>
.note { display: grid; gap: .5rem; max-width: 22rem; }
.note p { margin: 0; }
</style>
```
