# Kurz: TypeScript → Vue → Nuxt

Interaktivní kurz v češtině pro JavaScriptové vývojáře. Má 16 lekcí. U TypeScriptu a Vue píšeš kód přímo v prohlížeči a testy ho hned zkontrolují, včetně typů. Nuxt končí kvízy.

## Spuštění u sebe

```bash
npm install
npm run dev        # http://localhost:3000
```

Potřebuješ Node.js 20 nebo novější.

## Nasazení na Netlify

**Varianta A, přes GitHub (doporučená):**

1. Nahraj složku do nového repozitáře na GitHubu.
2. Na Netlify přidej nový projekt importem z Gitu a vyber repozitář.
3. Nastavení se načte ze souboru `netlify.toml` (build `npm run generate`, výstup `.output/public`). Stačí potvrdit.

Každý další `git push` se nasadí automaticky.

**Varianta B, bez Gitu:** spusť `npm install && npm run generate` a složku `.output/public` přetáhni na https://app.netlify.com/drop.

## Struktura

```
app/
├─ app.vue                 rámec aplikace (hlavička, postranní trasa)
├─ pages/index.vue         úvodní stránka
├─ pages/lekce/[id].vue    stránka lekce
├─ components/             editor (CodeMirror), pracovní plocha, výsledky, kvíz, trasa
├─ composables/useProgress.ts   postup uložený v localStorage
├─ data/lessons.ts         seznam lekcí, testy a kvízové otázky
├─ lessons/*.md            texty lekcí; bloky ```ts starter / ```ts solution jsou zadání a řešení
└─ utils/
   ├─ tsRunner.ts          kontrola typů a spuštění TS v prohlížeči
   ├─ vueRunner.ts         překlad a připojení .vue komponent v prohlížeči
   └─ expect.ts            jednoduché aserce pro testy
```

## Jak přidat lekci

1. Vytvoř `app/lessons/moje-lekce.md` s textem a s bloky ```` ```ts starter ```` a ```` ```ts solution ```` (u Vue ```` ```vue starter ````).
2. Přidej záznam do `app/data/lessons.ts` s testy. Typové testy jsou kousky kódu, které se připojí za kód studenta. Řádek `// @ts-expect-error` ověří, že TypeScript daný řádek odmítne.

Kompilátor v prohlížeči je TypeScript 5.9 (poslední verze s JavaScriptovým API). Jazyk je stejný jako v TypeScriptu 7.
