Znak `|` znamená „buď, anebo“. Takovému typu se říká **union** (sjednocení):

```ts
type Status = 'draft' | 'published' | 'archived'   // jen tyhle tři texty
let id: string | number
```

Nejužitečnější varianta je **rozlišené sjednocení** (discriminated union). Každá varianta má společnou vlastnost s jinou pevnou hodnotou, obvykle `kind` nebo `type`. Podle ní pak TypeScript pozná, se kterou variantou zrovna pracuješ:

```ts
type Result =
  | { kind: 'ok', data: string }
  | { kind: 'error', message: string }

function show(r: Result) {
  if (r.kind === 'ok') {
    return r.data        // TypeScript ví, že tu existuje jen data
  }
  return r.message       // a tady jen message
}
```

Ve `switch` přes všechny varianty se hodí trik s typem `never`. Pokud později přidáš novou variantu a zapomeneš ji obsloužit, TypeScript nahlásí chybu:

```ts
default: {
  const unreachable: never = r
  throw new Error(`Neznámá varianta: ${unreachable}`)
}
```

Takhle se v aplikacích typicky modelují stavy načítání (`loading | success | error`), akce nebo různé druhy notifikací.

## Úkol

Typ `Shape` už je připravený. Doplň funkci `area`, která spočítá obsah:

- kruh: `Math.PI * r * r`
- obdélník: `w * h`
- trojúhelník: `(base * height) / 2`

Použij `switch` přes `shape.kind` a větev `default` s kontrolou přes `never`.

```ts starter
type Shape =
  | { kind: 'circle', r: number }
  | { kind: 'rect', w: number, h: number }
  | { kind: 'triangle', base: number, height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    // doplň větve
  }
}

console.log(area({ kind: 'rect', w: 3, h: 4 }))
```

```ts solution
type Shape =
  | { kind: 'circle', r: number }
  | { kind: 'rect', w: number, h: number }
  | { kind: 'triangle', base: number, height: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.r * shape.r
    case 'rect':
      return shape.w * shape.h
    case 'triangle':
      return (shape.base * shape.height) / 2
    default: {
      const unreachable: never = shape
      throw new Error(`Neznámý tvar: ${JSON.stringify(unreachable)}`)
    }
  }
}

console.log(area({ kind: 'rect', w: 3, h: 4 }))
```
