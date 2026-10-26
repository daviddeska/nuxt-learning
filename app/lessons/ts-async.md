Asynchronní funkce v TypeScriptu vrací `Promise<T>`, kde `T` je typ hodnoty, kterou dostaneš po `await`:

```ts
async function getAge(): Promise<number> {
  return 31            // async funkci stačí vrátit číslo, zabalí se samo
}

const age = await getAge()   // number
```

U volání API je potřeba dávat pozor. `response.json()` vrací `Promise<any>`, takže TypeScript nic nezkontroluje a typ si jen **slibuješ**:

```ts
interface User { id: number, name: string }

async function loadUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<User>
}
```

Paralelní volání spojíš přes `Promise.all`. TypeScript zachová typy po jednotlivých pozicích:

```ts
const [user, posts] = await Promise.all([loadUser(1), loadPosts(1)])
//      ^ User  ^ Post[]
```

Chyby v `catch` mají typ `unknown`, protože hodit se dá cokoli. Před použitím je zúžíš:

```ts
try { ... }
catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
}
```

## Úkol

Napiš `loadNames(ids, fetchUser)`. Pro všechna `ids` **paralelně** zavolá `fetchUser` a vrátí pole jmen ve stejném pořadí. Uživatele, u kterých `fetchUser` selže, přeskoč.

Nápověda: `Promise.allSettled` vrací pro každý slib objekt `{ status: 'fulfilled', value }` nebo `{ status: 'rejected', reason }`. Je to rozlišené sjednocení z lekce 3.

```ts starter
interface User {
  id: number
  name: string
}

async function loadNames(ids: number[], fetchUser: (id: number) => Promise<User>) {

}

// zkušební „API“
const fakeFetch = async (id: number): Promise<User> => {
  if (id === 2) throw new Error('Nenalezeno')
  return { id, name: `Uživatel ${id}` }
}
loadNames([1, 2, 3], fakeFetch).then(names => console.log(names))
```

```ts solution
interface User {
  id: number
  name: string
}

async function loadNames(ids: number[], fetchUser: (id: number) => Promise<User>): Promise<string[]> {
  const results = await Promise.allSettled(ids.map(id => fetchUser(id)))
  return results
    .filter((r): r is PromiseFulfilledResult<User> => r.status === 'fulfilled')
    .map(r => r.value.name)
}

// zkušební „API“
const fakeFetch = async (id: number): Promise<User> => {
  if (id === 2) throw new Error('Nenalezeno')
  return { id, name: `Uživatel ${id}` }
}
loadNames([1, 2, 3], fakeFetch).then(names => console.log(names))
```
