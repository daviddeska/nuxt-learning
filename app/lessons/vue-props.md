Komponenty spolu mluví dvěma směry. Rodič posílá dolů **props**, potomek posílá nahoru **události** (emits). S TypeScriptem je obojí popsané typem:

```vue
<script setup lang="ts">
const props = defineProps<{
  title: string
  count?: number          // nepovinný prop
}>()

const emit = defineEmits<{
  select: [id: number]    // událost select s jedním argumentem
  close: []               // událost bez argumentů
}>()

function choose() {
  emit('select', 42)      // emit('select', 'x') by TypeScript odmítl
}
</script>
```

Rodič pak komponentu používá takhle:

```vue
<ProductCard title="Klávesnice" :count="3" @select="onSelect" />
```

Výchozí hodnoty nepovinných props zadáš přímo při destrukturování (Vue 3.5+):

```ts
const { title, count = 1 } = defineProps<{ title: string, count?: number }>()
```

Props jsou **jen pro čtení**. Když potomek potřebuje hodnotu změnit, pošle událost a změnu udělá rodič. Díky tomu má každý kus stavu jednoho vlastníka a víš, kde ho hledat.

## Úkol

Komponenta hodnocení hvězdičkami. Testy ji připojí s props `label: 'Kvalita'`, `max: 5` a `modelValue: 2`.

- `data-test="label"` zobrazí `label`,
- vykresli `max` tlačítek `data-test="star"` (`v-for` jde i přes číslo: `v-for="n in max"`),
- tlačítka do hodnoty `modelValue` včetně dostanou třídu `on` a text `★`, ostatní text `☆`,
- kliknutí na n-tou hvězdu emituje `update:modelValue` s číslem `n`.

Protože se prop jmenuje `modelValue` a událost `update:modelValue`, rodič pak může použít `v-model` přímo na komponentě: `<StarRating v-model="rating" />`.

```vue starter
<script setup lang="ts">
// defineProps a defineEmits se neimportují, jsou k dispozici samy

</script>

<template>
  <div class="rating">
    <span data-test="label">Popisek</span>
    <!-- hvězdy -->
  </div>
</template>

<style>
.rating { display: flex; align-items: center; gap: .25rem; }
.rating span { margin-right: .5rem; }
.rating button { font-size: 1.4rem; background: none; border: 0; cursor: pointer; color: inherit; padding: 0 .1rem; }
.rating button.on { color: #d99a00; }
</style>
```

```vue solution
<script setup lang="ts">
const props = defineProps<{
  label: string
  max: number
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <div class="rating">
    <span data-test="label">{{ props.label }}</span>
    <button
      v-for="n in props.max"
      :key="n"
      data-test="star"
      :class="{ on: n <= props.modelValue }"
      @click="emit('update:modelValue', n)"
    >
      {{ n <= props.modelValue ? '★' : '☆' }}
    </button>
  </div>
</template>

<style>
.rating { display: flex; align-items: center; gap: .25rem; }
.rating span { margin-right: .5rem; }
.rating button { font-size: 1.4rem; background: none; border: 0; cursor: pointer; color: inherit; padding: 0 .1rem; }
.rating button.on { color: #d99a00; }
</style>
```
