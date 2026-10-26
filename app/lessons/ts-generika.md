Představ si funkci, která vrátí první prvek pole. S `any` přijdeš o veškerou informaci o typu:

```ts
function firstAny(items: any[]): any { return items[0] }
const x = firstAny([1, 2])   // any: TypeScript už neví, že je to číslo
```

**Generikum** je typový parametr. Funkce řekne: „pracuju s nějakým typem `T` a ten si odvodím z toho, co mi pošleš“:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}

const n = first([1, 2])        // number | undefined
const s = first(['a', 'b'])    // string | undefined
```

`T` se dá **omezit** klíčovým slovem `extends`. Funkce pak přijme jen typy, které podmínku splňují:

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
longest('ahoj', 'čau')     // ok, string má length
longest(10, 20)            // ✖ number nemá length
```

Často se kombinuje s `keyof`, který vrátí sjednocení názvů klíčů objektu:

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key])
}
pluck([{ id: 1, name: 'Eva' }], 'name')  // string[]
pluck([{ id: 1, name: 'Eva' }], 'mail')  // ✖ 'mail' není klíč
```

Generika uvidíš ve Vue všude: `ref<number>(0)`, `defineProps<{...}>()`, `useFetch<User[]>()`.

## Úkol

Napiš generickou funkci `groupBy`, která rozdělí pole do skupin podle klíče, který vrátí callback. Výsledek je objekt, kde klíčem je hodnota z callbacku a hodnotou pole prvků.

Typ výsledku má být `Record<K, T[]>`, kde `K extends string`. Díky tomu u `groupBy(lidi, p => p.mesto)` TypeScript ví, že ve skupině jsou zase lidé.

```ts starter
function groupBy(items, getKey) {

}

const people = [
  { name: 'Eva', city: 'Praha' },
  { name: 'Petr', city: 'Brno' },
  { name: 'Jana', city: 'Praha' },
]
console.log(groupBy(people, p => p.city))
```

```ts solution
function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>
  for (const item of items) {
    const key = getKey(item)
    if (!result[key]) result[key] = []
    result[key].push(item)
  }
  return result
}

const people = [
  { name: 'Eva', city: 'Praha' },
  { name: 'Petr', city: 'Brno' },
  { name: 'Jana', city: 'Praha' },
]
console.log(groupBy(people, p => p.city))
```
