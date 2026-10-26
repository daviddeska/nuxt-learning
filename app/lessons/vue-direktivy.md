Direktivy jsou speciální atributy v šabloně, které začínají `v-`. Čtyři nejdůležitější:

```vue
<!-- v-if / v-else: prvek v DOM buď je, nebo není -->
<p v-if="items.length === 0">Seznam je prázdný.</p>
<p v-else>Položek: {{ items.length }}</p>

<!-- v-for: opakování; :key pomáhá Vue poznat, který prvek je který -->
<li v-for="item in items" :key="item.id">{{ item.title }}</li>

<!-- v-bind (zkratka :): hodnota atributu z výrazu -->
<li :class="{ done: item.done }" :title="item.title">

<!-- v-on (zkratka @): události -->
<button @click="remove(item.id)">Smazat</button>
```

`:key` u `v-for` dávej vždycky a používej stabilní identifikátor (`id`), ne index pole. Jinak se při mazání nebo řazení plete stav položek.

Pole objektů v `ref` je reaktivní do hloubky: `todos.value.push(...)` i `todo.done = true` vyvolají překreslení. Typ ref si můžeš zadat genericky, tak jak to znáš z lekce o generikách:

```ts
interface Todo { id: number, title: string, done: boolean }
const todos = ref<Todo[]>([])
```

Na odvozené hodnoty (třeba filtrovaný seznam) se používá `computed`, víc o něm v další lekci. Zatím si vystačíš s výrazem přímo v šabloně nebo s funkcí.

## Úkol

Seznam úkolů je připravený. Doplň:

1. vykreslení položek přes `v-for` do `<li data-test="item">`, s `:key`,
2. třídu `done` na `<li>` u hotových položek (přes `:class`),
3. kliknutí na položku přepne její `done`,
4. tlačítko `data-test="toggle"` přepíná, jestli se hotové úkoly zobrazují. Text tlačítka je `Skrýt hotové`, nebo `Ukázat hotové`.

```vue starter
<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  id: number
  title: string
  done: boolean
}

const todos = ref<Todo[]>([
  { id: 1, title: 'Projít lekci o TypeScriptu', done: true },
  { id: 2, title: 'Napsat první komponentu', done: false },
  { id: 3, title: 'Nasadit na Netlify', done: false },
])

const showDone = ref(true)
</script>

<template>
  <div>
    <button data-test="toggle">Skrýt hotové</button>
    <ul>
      <!-- sem položky -->
    </ul>
  </div>
</template>

<style>
li { cursor: pointer; padding: .25rem 0; }
li.done { text-decoration: line-through; opacity: .6; }
</style>
```

```vue solution
<script setup lang="ts">
import { ref } from 'vue'

interface Todo {
  id: number
  title: string
  done: boolean
}

const todos = ref<Todo[]>([
  { id: 1, title: 'Projít lekci o TypeScriptu', done: true },
  { id: 2, title: 'Napsat první komponentu', done: false },
  { id: 3, title: 'Nasadit na Netlify', done: false },
])

const showDone = ref(true)

function visible(): Todo[] {
  return showDone.value ? todos.value : todos.value.filter(t => !t.done)
}
</script>

<template>
  <div>
    <button data-test="toggle" @click="showDone = !showDone">
      {{ showDone ? 'Skrýt hotové' : 'Ukázat hotové' }}
    </button>
    <ul>
      <li
        v-for="todo in visible()"
        :key="todo.id"
        data-test="item"
        :class="{ done: todo.done }"
        @click="todo.done = !todo.done"
      >
        {{ todo.title }}
      </li>
    </ul>
  </div>
</template>

<style>
li { cursor: pointer; padding: .25rem 0; }
li.done { text-decoration: line-through; opacity: .6; }
</style>
```
