Nuxt je framework nad Vue. Komponenty, `ref`, `computed` i všechno ostatní zůstává stejné. Nuxt přidává hlavně **konvence**: kam co patří a co se z toho samo vygeneruje.

Struktura projektu v Nuxtu 4:

```
muj-projekt/
├─ app/
│  ├─ app.vue            ← kořen aplikace
│  ├─ pages/             ← stránky = routy
│  ├─ components/        ← komponenty, automaticky dostupné
│  ├─ composables/       ← use…() funkce, automaticky dostupné
│  ├─ layouts/           ← rámce stránek (hlavička, patička…)
│  └─ middleware/        ← kód, který běží před přechodem na stránku
├─ server/
│  └─ api/               ← backendové endpointy
├─ public/               ← statické soubory (favicon, obrázky)
└─ nuxt.config.ts
```

**Routing podle souborů.** Každý soubor v `app/pages/` je jedna stránka. Hranaté závorky znamenají dynamický parametr:

```
app/pages/index.vue          →  /
app/pages/o-nas.vue          →  /o-nas
app/pages/blog/index.vue     →  /blog
app/pages/blog/[slug].vue    →  /blog/cokoli
```

Parametr si ve stránce přečteš přes `useRoute()`. Odkazy píšeš komponentou `<NuxtLink>`, která přepne stránku bez znovunačtení a odkazy viditelné na obrazovce stáhne dopředu:

```vue
<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)
</script>

<template>
  <NuxtLink to="/blog">Zpět na blog</NuxtLink>
</template>
```

**Auto-importy.** Všimni si, že chybí `import { computed } from 'vue'`. Nuxt automaticky importuje Vue API, svoje composables, všechno z `app/composables/` a `app/utils/` a všechny komponenty z `app/components/`. Typy si generuje do složky `.nuxt/`, takže TypeScript o všem ví.

Tahle aplikace je mimochodem postavená přesně takhle. Na konci kurzu se můžeš podívat do jejího zdrojového kódu.

## Kvíz
