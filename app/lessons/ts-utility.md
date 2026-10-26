TypeScript má vestavěné **utility typy**, které z existujícího typu vyrobí nový. Nemusíš tak tentýž tvar opisovat dvakrát:

```ts
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

type UserPatch = Partial<User>          // všechny vlastnosti nepovinné
type UserPreview = Pick<User, 'id' | 'name'>
type NewUser = Omit<User, 'id'>         // vše kromě id
type Roles = Record<User['role'], string[]>  // { admin: string[], user: string[] }
type FrozenUser = Readonly<User>
```

`User['role']` je **indexovaný přístup**: vytáhne typ jedné vlastnosti. `keyof User` vrátí `'id' | 'name' | 'email' | 'role'`.

Užitečná je i dvojice `typeof` + `as const`. Typ pak odvodíš z hodnoty, a ne obráceně:

```ts
const ROLES = ['admin', 'user', 'guest'] as const
type Role = typeof ROLES[number]   // 'admin' | 'user' | 'guest'
```

V praxi to znamená jeden zdroj pravdy. Změníš `User` a všechny odvozené typy se změní s ním.

## Úkol

Napiš funkci `updateUser(user, patch)`, která vrátí **nový** objekt uživatele se změnami z `patch`.

`patch` smí obsahovat libovolnou podmnožinu vlastností, ale **nikdy** `id`. Sestav jeho typ z utility typů (`Partial` a `Omit`), ne ručně. Testy ověří, že `updateUser(u, { id: 5 })` TypeScript odmítne.

```ts starter
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

function updateUser(user, patch) {

}

const eva: User = { id: 1, name: 'Eva', email: 'eva@example.cz', role: 'user' }
console.log(updateUser(eva, { role: 'admin' }))
```

```ts solution
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

type UserPatch = Partial<Omit<User, 'id'>>

function updateUser(user: User, patch: UserPatch): User {
  return { ...user, ...patch }
}

const eva: User = { id: 1, name: 'Eva', email: 'eva@example.cz', role: 'user' }
console.log(updateUser(eva, { role: 'admin' }))
```
