**Layouty** jsou rámce kolem stránek. Výchozí je `app/layouts/default.vue` a stránka vloží svůj obsah do `<slot />`:

```vue
<!-- app/layouts/default.vue -->
<template>
  <header>…</header>
  <main><slot /></main>
</template>
```

Jiný layout si stránka vybere přes `definePageMeta({ layout: 'admin' })`. V `app.vue` pak stačí `<NuxtLayout><NuxtPage /></NuxtLayout>`.

**Middleware** běží před přechodem na stránku. Typicky hlídá přihlášení:

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useState<User | null>('user')
  if (!user.value) return navigateTo('/prihlaseni')
})
```

**`useState`** je sdílený stav napříč komponentami s klíčem (tady `'user'`). Přežije i přenos ze serveru do prohlížeče. Na menší aplikace stačí místo velké knihovny. Na složitější stav se používá Pinia.

**SEO** nastavíš přímo ve stránce: `useSeoMeta({ title: 'Blog', description: '…' })`.

## Nasazení na Netlify

Máš dvě možnosti:

- **`nuxt generate`** vyrobí statické soubory do `.output/public`. Netlify je jen servíruje, bez serveru, rychle a zdarma. Hodí se na weby, blogy, dokumentaci i tenhle kurz. Serverové API ale v produkci nefunguje.
- **`nuxt build`** postaví plnou aplikaci se serverem. Nuxt pozná, že běží na Netlify, a serverovou část nasadí jako Netlify Functions. Potřebuješ ji, když používáš `server/api`, přihlášení nebo data generovaná za běhu.

Postup je v obou případech stejný: nahraješ kód na GitHub, na Netlify přidáš nový projekt importem z Gitu, vybereš repozitář a potvrdíš build příkaz. Každý další `git push` se pak nasadí sám.

## Kam dál

Nejlepší další krok je postavit něco vlastního. Založ projekt příkazem `npm create nuxt@latest muj-projekt`, nebo si ho vyzkoušej rovnou v prohlížeči na [nuxt.new](https://nuxt.new). Nápady: osobní stránka s blogem, sledování výdajů se `server/api`, nebo vlastní verze tohohle kurzu. Dokumentace je na [nuxt.com/docs](https://nuxt.com/docs) a [vuejs.org](https://vuejs.org).

## Kvíz
