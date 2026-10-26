Nuxt umí vykreslit stránku na serveru (SSR). Uživatel tak dostane hotové HTML i s daty a vyhledávače vidí obsah. Proto se data nenačítají přes `fetch` v `onMounted`, ale přes composables, které fungují na serveru i v prohlížeči a výsledek nestahují dvakrát.

**`useFetch`** je nejčastější volba:

```vue
<script setup lang="ts">
interface Post { id: number, title: string }

const { data: posts, status, error, refresh } = await useFetch<Post[]>('/api/posts')
</script>

<template>
  <p v-if="status === 'pending'">Načítám…</p>
  <p v-else-if="error">Chyba: {{ error.message }}</p>
  <ul v-else>
    <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>
```

`data` je ref. Když URL obsahuje reaktivní hodnotu, třeba `` () => `/api/posts/${id.value}` ``, `useFetch` stáhne data znovu při každé její změně.

**`useAsyncData`** použiješ, když data nejdou z jedné URL (SDK, víc volání naráz). **`$fetch`** je obyčejné volání bez cache. Hodí se do obsluhy událostí, třeba při odeslání formuláře:

```ts
async function save() {
  await $fetch('/api/posts', { method: 'POST', body: { title: title.value } })
  await refresh()
}
```

**Serverové API.** Soubor ve `server/api/` je endpoint. Název souboru určuje cestu, přípona metodu:

```ts
// server/api/posts.get.ts  →  GET /api/posts
export default defineEventHandler(async () => {
  return [{ id: 1, title: 'Ahoj Nuxte' }]
})

// server/api/posts/[id].get.ts  →  GET /api/posts/42
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  return { id }
})
```

Když endpoint vrací otypovaná data, `useFetch('/api/posts')` typ převezme **automaticky**. Server a klient tak sdílí typy bez ručního psaní.

## Kvíz
