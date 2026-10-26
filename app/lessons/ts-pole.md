Pole zapisuješ jako `string[]` nebo ekvivalentně `Array<string>`. U `map`, `filter` a `reduce` nemusíš typy psát vůbec, TypeScript si je odvodí z pole i z návratové hodnoty callbacku:

```ts
const prices = [120, 80, 45]              // number[]
const labels = prices.map(p => `${p} Kč`)  // string[]
```

Jedna past: `filter` sám od sebe typ nezúží. Po `filter(x => x !== null)` je pole pořád `(string | null)[]`. Řešením je **typový predikát**, funkce s návratovým typem `x is string`:

```ts
const raw = ['a', null, 'b']
const clean = raw.filter((x): x is string => x !== null) // string[]
```

(Od TypeScriptu 5.5 umí kompilátor takový predikát u jednoduchých podmínek odvodit sám, ale zápis se vyplatí znát.)

**Tuple** je pole s pevnou délkou a typem na každé pozici, typicky když funkce vrací víc hodnot:

```ts
function minMax(nums: number[]): [number, number] {
  return [Math.min(...nums), Math.max(...nums)]
}
const [min, max] = minMax([3, 9, 1])
```

`readonly string[]` zakáže `push`, `splice` a další mutace. Hodí se u parametrů funkcí, které pole jen čtou.

## Úkol

Napiš funkci `openTitles`, která ze seznamu úkolů vrátí **názvy** těch nedokončených, seřazené podle priority (nejvyšší číslo první). Parametr otypuj jako `readonly Todo[]`. Funkce tak nesmí původní pole měnit. Pozor, `sort` řadí na místě. Řaď proto až výsledek `filter`, který je nové pole.

```ts starter
interface Todo {
  title: string
  done: boolean
  priority: number
}

function openTitles(todos) {

}

console.log(openTitles([
  { title: 'Napsat test', done: false, priority: 2 },
  { title: 'Opravit bug', done: false, priority: 5 },
  { title: 'Kafe', done: true, priority: 9 },
]))
```

```ts solution
interface Todo {
  title: string
  done: boolean
  priority: number
}

function openTitles(todos: readonly Todo[]): string[] {
  return todos
    .filter(t => !t.done)
    .sort((a, b) => b.priority - a.priority)
    .map(t => t.title)
}

console.log(openTitles([
  { title: 'Napsat test', done: false, priority: 2 },
  { title: 'Opravit bug', done: false, priority: 5 },
  { title: 'Kafe', done: true, priority: 9 },
]))
```
