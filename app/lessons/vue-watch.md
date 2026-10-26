`computed` počítá hodnoty. Když ale potřebuješ na změnu **reagovat akcí** (uložit, zalogovat, zavolat API), použij **`watch`**:

```ts
import { ref, watch } from 'vue'

const query = ref('')

watch(query, (newValue, oldValue) => {
  console.log(`hledání: ${oldValue} → ${newValue}`)
})

// víc zdrojů naráz a okamžité spuštění
watch([page, sort], ([p, s]) => load(p, s), { immediate: true })
```

`watchEffect` sleduje automaticky všechno, co uvnitř přečteš. Je stručnější, ale méně explicitní, takže pro začátek je čitelnější `watch`.

**Lifecycle hooky** spustí kód v určitém okamžiku života komponenty:

```ts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // komponenta je v DOM: můžeš měřit prvky, napojit knihovny, načíst data
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  // úklid: co jsi v onMounted zapojil, tady odpoj
  window.removeEventListener('resize', onResize)
})
```

Pravidlo, které tě ušetří spousty chyb: co přidáš v `onMounted` (posluchače, intervaly, předplatná), odstraň v `onUnmounted`.

## Úkol

Převodník teplot s historií:

- `<input data-test="celsius" type="number">` napojený přes `v-model.number` na `celsius` (začíná na 20),
- `data-test="fahrenheit"` zobrazí převod `°F` zaokrouhlený na celé číslo, třeba `68 °F` (vzorec `c * 9 / 5 + 32`), jako `computed`,
- přes `watch` přidej při každé změně `celsius` do pole `history` záznam `20 → 25` (stará → nová hodnota) a drž jen **poslední 3** záznamy. Vykresli je do `<li data-test="history">`,
- v `onMounted` nastav `status` na `Připraveno`, zobrazený v `data-test="status"`.

```vue starter
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const celsius = ref(20)
const history = ref<string[]>([])
const status = ref('Načítám…')
</script>

<template>
  <div class="temp">
    <p data-test="status">{{ status }}</p>
    <label>°C <input data-test="celsius" type="number" /></label>
    <p data-test="fahrenheit">? °F</p>
    <ul>
      <!-- historie -->
    </ul>
  </div>
</template>

<style>
.temp { display: grid; gap: .5rem; }
.temp p { margin: 0; }
.temp input { width: 6rem; }
</style>
```

```vue solution
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const celsius = ref(20)
const history = ref<string[]>([])
const status = ref('Načítám…')

const fahrenheit = computed(() => Math.round(celsius.value * 9 / 5 + 32))

watch(celsius, (now, before) => {
  history.value = [...history.value, `${before} → ${now}`].slice(-3)
})

onMounted(() => {
  status.value = 'Připraveno'
})
</script>

<template>
  <div class="temp">
    <p data-test="status">{{ status }}</p>
    <label>°C <input v-model.number="celsius" data-test="celsius" type="number" /></label>
    <p data-test="fahrenheit">{{ fahrenheit }} °F</p>
    <ul>
      <li v-for="(entry, i) in history" :key="i" data-test="history">{{ entry }}</li>
    </ul>
  </div>
</template>

<style>
.temp { display: grid; gap: .5rem; }
.temp p { margin: 0; }
.temp input { width: 6rem; }
</style>
```
