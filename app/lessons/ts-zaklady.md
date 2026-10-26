TypeScript je JavaScript, ke kterému můžeš připsat **typy**. Prohlížeč typy nikdy neuvidí: kompilátor je před spuštěním smaže. Jejich jediná práce je najít chybu dřív, než kód poběží.

```ts
let age: number = 31
age = 'třicet'          // ✖ Type 'string' is not assignable to type 'number'.

const city = 'Praha'    // typ si TypeScript odvodí sám: string
```

Anotace píšeš za dvojtečku. U proměnných je většinou nepotřebuješ, protože TypeScript typ **odvodí** z hodnoty. Kde se vyplatí vždy, jsou **parametry funkcí**. Bez nich TypeScript neví, co do funkce přijde, a v přísném režimu (`strict`) to označí jako chybu.

```ts
function add(a: number, b: number): number {
  return a + b
}

add(2, 3)      // 5
add('2', 3)    // ✖ Argument of type 'string' is not assignable…
```

Návratový typ (`: number` za závorkou) je nepovinný, odvodí se z `return`. Psát ho je ale dobrý zvyk u funkcí, které používá víc míst. Když se pak tělo funkce změní, chyba vyskočí přímo v ní, a ne až u všech volajících.

Základní typy: `string`, `number`, `boolean`, `null`, `undefined`. Pak dva speciální: `any` vypne kontrolu úplně (snaž se mu vyhýbat) a `unknown` znamená „nevím, co to je, a než s tím něco udělám, musím to ověřit“.

## Úkol

Napiš funkci `formatPrice`, která dostane částku (číslo) a měnu (text) a vrátí text ve tvaru `"249 Kč"`. Parametry i návratovou hodnotu otypuj.

Bonus, který testy taky ověří: volání s textem místo čísla, třeba `formatPrice('249', 'Kč')`, musí TypeScript odmítnout.

```ts starter
// Doplň typy parametrů a návratové hodnoty
function formatPrice(amount, currency) {

}

console.log(formatPrice(249, 'Kč'))
```

```ts solution
function formatPrice(amount: number, currency: string): string {
  return `${amount} ${currency}`
}

console.log(formatPrice(249, 'Kč'))
```
