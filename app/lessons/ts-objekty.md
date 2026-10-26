Objekty popisuješ pomocí `interface` nebo `type`. Pro tvar objektu fungují skoro stejně. Zažitá konvence: `interface` na objekty, `type` na všechno ostatní (sjednocení, aliasy, odvozené typy).

```ts
interface User {
  id: number
  name: string
  email?: string          // ? = nepovinná vlastnost
  readonly createdAt: Date // po vytvoření ji nejde přepsat
}

type UserId = number       // alias
```

Nepovinná vlastnost má typ `string | undefined`. TypeScript tě proto nenechá s ní pracovat, dokud neověříš, že tam opravdu je:

```ts
function domain(user: User): string {
  return user.email.split('@')[1]   // ✖ 'user.email' is possibly 'undefined'.
}

function domainSafe(user: User): string {
  if (!user.email) return 'bez e-mailu'
  return user.email.split('@')[1] ?? ''  // tady už je email jistě string
}
```

Tomuhle se říká **zužování typu** (narrowing). Podmínka `if` TypeScriptu řekne, že dál už hodnota `undefined` být nemůže. Stejně fungují `typeof`, `in`, `instanceof` i operátor `?.`.

Typy jsou **strukturální**: na jménu nezáleží, kontroluje se jen tvar. Jakýkoli objekt s `id`, `name` a `createdAt` je `User`, i když vznikl úplně jinde.

## Úkol

1. Nadeklaruj `interface Product` s vlastnostmi `id` (číslo), `name` (text), `price` (číslo) a nepovinnou `discount` (číslo, sleva v procentech).
2. Napiš funkci `finalPrice(product: Product): number`, která vrátí cenu po slevě. Bez slevy vrátí původní cenu, výsledek zaokrouhli pomocí `Math.round`.

```ts starter
// 1) interface Product


// 2) cena po slevě
function finalPrice(product) {

}

console.log(finalPrice({ id: 1, name: 'Klávesnice', price: 1990, discount: 15 }))
```

```ts solution
interface Product {
  id: number
  name: string
  price: number
  discount?: number
}

function finalPrice(product: Product): number {
  if (product.discount === undefined) return product.price
  return Math.round(product.price * (1 - product.discount / 100))
}

console.log(finalPrice({ id: 1, name: 'Klávesnice', price: 1990, discount: 15 }))
```
