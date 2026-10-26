import { expect } from '~/utils/expect'
import type { TypeTest } from '~/utils/tsRunner'
import type { VueTestContext } from '~/utils/vueRunner'

export type TrackId = 'ts' | 'vue' | 'nuxt'

export interface Track {
  id: TrackId
  title: string
  blurb: string
}

export const tracks: Track[] = [
  { id: 'ts', title: 'TypeScript', blurb: 'Typy nad JavaScriptem, který už znáš.' },
  { id: 'vue', title: 'Vue 3', blurb: 'Komponenty, reaktivita a šablony. Rovnou s TypeScriptem.' },
  { id: 'nuxt', title: 'Nuxt', blurb: 'Routing, data, server a nasazení.' },
]

interface TestCase<C> {
  name: string
  run: (ctx: C) => unknown
}

interface LessonBase {
  id: string
  track: TrackId
  title: string
}

export interface TsLesson extends LessonBase {
  kind: 'ts'
  /** Jména funkcí, které testy z kódu studenta vytáhnou. */
  exposes: string[]
  typeTests?: TypeTest[]
  tests: TestCase<Record<string, any>>[]
}

export interface VueLesson extends LessonBase {
  kind: 'vue'
  props?: Record<string, unknown>
  emits?: string[]
  tests: TestCase<VueTestContext>[]
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
  why: string
}

export interface QuizLesson extends LessonBase {
  kind: 'quiz'
  questions: QuizQuestion[]
}

export type Lesson = TsLesson | VueLesson | QuizLesson

const fn = (api: Record<string, any>, name: string) => {
  expect(api[name]).toBeFunction(name)
  return api[name] as (...args: any[]) => any
}

export const lessons: Lesson[] = [
  // ───────────── TypeScript ─────────────
  {
    id: 'ts-zaklady',
    track: 'ts',
    title: 'Základní typy a funkce',
    kind: 'ts',
    exposes: ['formatPrice'],
    typeTests: [
      { name: 'formatPrice odmítne text místo čísla', code: `// @ts-expect-error\nformatPrice('249', 'Kč')` },
      { name: 'formatPrice vrací string', code: `const s: string = formatPrice(1, 'Kč')\n// @ts-expect-error\nconst n: number = formatPrice(1, 'Kč')` },
    ],
    tests: [
      { name: 'formatPrice(249, "Kč") vrátí "249 Kč"', run: api => expect(fn(api, 'formatPrice')(249, 'Kč')).toBe('249 Kč') },
      { name: 'funguje i pro jinou měnu', run: api => expect(fn(api, 'formatPrice')(12, '€')).toBe('12 €') },
    ],
  },
  {
    id: 'ts-objekty',
    track: 'ts',
    title: 'Objekty a interface',
    kind: 'ts',
    exposes: ['finalPrice'],
    typeTests: [
      { name: 'Product má povinné id, name a price', code: `// @ts-expect-error\nconst p: Product = { id: 1, name: 'X' }` },
      { name: 'discount je nepovinný', code: `const p: Product = { id: 1, name: 'X', price: 10 }` },
      { name: 'id musí být číslo', code: `// @ts-expect-error\nconst p: Product = { id: '1', name: 'X', price: 10 }` },
      { name: 'finalPrice přijímá Product', code: `// @ts-expect-error\nfinalPrice({ name: 'X' })` },
    ],
    tests: [
      { name: 'bez slevy vrátí původní cenu', run: api => expect(fn(api, 'finalPrice')({ id: 1, name: 'A', price: 500 })).toBe(500) },
      { name: 'sleva 15 % z 1990 je 1692', run: api => expect(fn(api, 'finalPrice')({ id: 1, name: 'A', price: 1990, discount: 15 })).toBe(1692) },
      { name: 'sleva 0 % nic nezmění', run: api => expect(fn(api, 'finalPrice')({ id: 1, name: 'A', price: 99, discount: 0 })).toBe(99) },
    ],
  },
  {
    id: 'ts-union',
    track: 'ts',
    title: 'Union a zužování typů',
    kind: 'ts',
    exposes: ['area'],
    typeTests: [
      { name: 'area přijme jen platný tvar', code: `// @ts-expect-error\narea({ kind: 'square', side: 2 })` },
    ],
    tests: [
      { name: 'obdélník 3 × 4 = 12', run: api => expect(fn(api, 'area')({ kind: 'rect', w: 3, h: 4 })).toBe(12) },
      { name: 'kruh r = 1 je π', run: api => expect(fn(api, 'area')({ kind: 'circle', r: 1 })).toBe(Math.PI) },
      { name: 'trojúhelník 6 × 4 = 12', run: api => expect(fn(api, 'area')({ kind: 'triangle', base: 6, height: 4 })).toBe(12) },
    ],
  },
  {
    id: 'ts-pole',
    track: 'ts',
    title: 'Pole, tuple a readonly',
    kind: 'ts',
    exposes: ['openTitles'],
    typeTests: [
      { name: 'openTitles vrací string[]', code: `const r: string[] = openTitles([])\n// @ts-expect-error\nconst n: number[] = openTitles([])` },
      { name: 'parametr je otypovaný jako pole Todo', code: `// @ts-expect-error\nopenTitles([{ title: 'x' }])` },
    ],
    tests: [
      {
        name: 'vrátí nedokončené seřazené podle priority',
        run: api => expect(fn(api, 'openTitles')([
          { title: 'A', done: false, priority: 1 },
          { title: 'B', done: true, priority: 9 },
          { title: 'C', done: false, priority: 5 },
        ])).toEqual(['C', 'A']),
      },
      {
        name: 'nemění původní pole',
        run: (api) => {
          const todos = [
            { title: 'A', done: false, priority: 1 },
            { title: 'B', done: false, priority: 3 },
          ]
          fn(api, 'openTitles')(todos)
          expect(todos.map(t => t.title)).toEqual(['A', 'B'], 'Původní pole se změnilo. sort() řadí na místě, řaď až kopii.')
        },
      },
      { name: 'prázdný seznam → prázdné pole', run: api => expect(fn(api, 'openTitles')([])).toEqual([]) },
    ],
  },
  {
    id: 'ts-generika',
    track: 'ts',
    title: 'Generika',
    kind: 'ts',
    exposes: ['groupBy'],
    typeTests: [
      {
        name: 'skupiny si drží typ prvků',
        code: `const g = groupBy([{ n: 1, c: 'a' }], x => x.c)\nconst first: { n: number, c: string } | undefined = g.a?.[0]\n// @ts-expect-error\nconst wrong: string | undefined = g.a?.[0]`,
      },
      { name: 'klíč musí být string', code: `// @ts-expect-error\ngroupBy([1, 2, 3], x => x)` },
    ],
    tests: [
      {
        name: 'rozdělí lidi podle města',
        run: api => expect(fn(api, 'groupBy')(
          [{ name: 'Eva', city: 'Praha' }, { name: 'Petr', city: 'Brno' }, { name: 'Jana', city: 'Praha' }],
          (p: { city: string }) => p.city,
        )).toEqual({
          Praha: [{ name: 'Eva', city: 'Praha' }, { name: 'Jana', city: 'Praha' }],
          Brno: [{ name: 'Petr', city: 'Brno' }],
        }),
      },
      { name: 'prázdné pole → prázdný objekt', run: api => expect(fn(api, 'groupBy')([], () => 'x')).toEqual({}) },
    ],
  },
  {
    id: 'ts-utility',
    track: 'ts',
    title: 'Utility typy',
    kind: 'ts',
    exposes: ['updateUser'],
    typeTests: [
      { name: 'patch nesmí obsahovat id', code: `const u: User = { id: 1, name: 'a', email: 'a@b.c', role: 'user' }\n// @ts-expect-error\nupdateUser(u, { id: 5 })` },
      { name: 'patch smí být částečný', code: `const u: User = { id: 1, name: 'a', email: 'a@b.c', role: 'user' }\nupdateUser(u, { name: 'b' })\nupdateUser(u, {})` },
      { name: 'patch kontroluje typy hodnot', code: `const u: User = { id: 1, name: 'a', email: 'a@b.c', role: 'user' }\n// @ts-expect-error\nupdateUser(u, { role: 'boss' })` },
      { name: 'vrací User', code: `const u: User = { id: 1, name: 'a', email: 'a@b.c', role: 'user' }\nconst r: User = updateUser(u, {})` },
    ],
    tests: [
      {
        name: 'vrátí uživatele se změnou',
        run: api => expect(fn(api, 'updateUser')({ id: 1, name: 'Eva', email: 'e@x.cz', role: 'user' }, { role: 'admin' }))
          .toEqual({ id: 1, name: 'Eva', email: 'e@x.cz', role: 'admin' }),
      },
      {
        name: 'nemění původní objekt',
        run: (api) => {
          const u = { id: 1, name: 'Eva', email: 'e@x.cz', role: 'user' }
          fn(api, 'updateUser')(u, { name: 'Jana' })
          expect(u.name).toBe('Eva', 'Původní objekt se změnil. Vytvoř nový, třeba přes { ...user, ...patch }.')
        },
      },
    ],
  },
  {
    id: 'ts-async',
    track: 'ts',
    title: 'Async a Promise<T>',
    kind: 'ts',
    exposes: ['loadNames'],
    typeTests: [
      { name: 'vrací Promise<string[]>', code: `const p: Promise<string[]> = loadNames([], async id => ({ id, name: '' }))\n// @ts-expect-error\nconst q: Promise<number[]> = loadNames([], async id => ({ id, name: '' }))` },
    ],
    tests: [
      {
        name: 'vrátí jména ve správném pořadí',
        run: async (api) => {
          const slow = (id: number) => new Promise(r => setTimeout(() => r({ id, name: `U${id}` }), 40 - id * 10))
          expect(await fn(api, 'loadNames')([1, 2, 3], slow)).toEqual(['U1', 'U2', 'U3'])
        },
      },
      {
        name: 'přeskočí uživatele, u kterých volání selže',
        run: async (api) => {
          const f = async (id: number) => {
            if (id === 2) throw new Error('nenalezeno')
            return { id, name: `U${id}` }
          }
          expect(await fn(api, 'loadNames')([1, 2, 3], f)).toEqual(['U1', 'U3'])
        },
      },
      {
        name: 'volání běží paralelně',
        run: async (api) => {
          let running = 0
          let peak = 0
          const f = async (id: number) => {
            running++
            peak = Math.max(peak, running)
            await new Promise(r => setTimeout(r, 20))
            running--
            return { id, name: String(id) }
          }
          await fn(api, 'loadNames')([1, 2, 3], f)
          expect(peak).toBe(3, 'Volání běží jedno po druhém. Spusť je všechna najednou a počkej na ně přes Promise.all nebo Promise.allSettled.')
        },
      },
    ],
  },

  // ───────────── Vue ─────────────
  {
    id: 'vue-sfc',
    track: 'vue',
    title: 'Komponenta a reaktivita',
    kind: 'vue',
    tests: [
      { name: 'na začátku ukazuje 0', run: c => expect(c.text('[data-test=count]')).toBe('Kliknuto: 0×') },
      {
        name: 'tlačítko +1 přičítá',
        run: async (c) => {
          await c.click('[data-test=plus]')
          await c.click('[data-test=plus]')
          await c.click('[data-test=plus]')
          expect(c.text('[data-test=count]')).toBe('Kliknuto: 3×')
        },
      },
      {
        name: 'Vynulovat vrátí 0',
        run: async (c) => {
          await c.click('[data-test=plus]')
          await c.click('[data-test=reset]')
          expect(c.text('[data-test=count]')).toBe('Kliknuto: 0×')
        },
      },
    ],
  },
  {
    id: 'vue-direktivy',
    track: 'vue',
    title: 'v-for, v-if, :class a @click',
    kind: 'vue',
    tests: [
      { name: 'vykreslí všechny 3 položky', run: c => expect(c.findAll('[data-test=item]').length).toBe(3) },
      { name: 'hotová položka má třídu done', run: c => expect(c.findAll('[data-test=item]').map(li => li.classList.contains('done'))).toEqual([true, false, false]) },
      {
        name: 'kliknutí přepne hotovo',
        run: async (c) => {
          c.findAll('[data-test=item]')[1]!.click()
          await c.tick()
          expect(c.findAll('[data-test=item]')[1]!.classList.contains('done')).toBe(true, 'Po kliknutí na druhou položku nemá třídu done.')
        },
      },
      {
        name: 'Skrýt hotové schová hotové položky',
        run: async (c) => {
          expect(c.text('[data-test=toggle]')).toBe('Skrýt hotové')
          await c.click('[data-test=toggle]')
          expect(c.findAll('[data-test=item]').length).toBe(2, 'Po kliknutí na „Skrýt hotové“ mají zůstat 2 položky.')
          expect(c.text('[data-test=toggle]')).toBe('Ukázat hotové')
          await c.click('[data-test=toggle]')
          expect(c.findAll('[data-test=item]').length).toBe(3)
        },
      },
    ],
  },
  {
    id: 'vue-vmodel',
    track: 'vue',
    title: 'v-model a computed',
    kind: 'vue',
    tests: [
      { name: 'bez jména je to vzkaz od anonyma', run: c => expect(c.text('[data-test=preview]')).toBe('Vzkaz od anonyma') },
      {
        name: 'jméno se propíše a ořízne',
        run: async (c) => {
          await c.type('[data-test=name]', '  Eva  ')
          expect(c.text('[data-test=preview]')).toBe('Vzkaz od Eva')
        },
      },
      {
        name: 'počítadlo znaků',
        run: async (c) => {
          expect(c.text('[data-test=counter]')).toBe('140 / 140')
          await c.type('[data-test=message]', 'Ahoj!')
          expect(c.text('[data-test=counter]')).toBe('135 / 140')
        },
      },
      {
        name: 'Odeslat je zakázané u prázdné a příliš dlouhé zprávy',
        run: async (c) => {
          const btn = () => c.find('[data-test=send]') as HTMLButtonElement
          expect(btn().disabled).toBe(true, 'U prázdné zprávy má být tlačítko disabled.')
          await c.type('[data-test=message]', 'Ahoj')
          expect(btn().disabled).toBe(false, 'Se zprávou má jít odeslat.')
          await c.type('[data-test=message]', 'x'.repeat(141))
          expect(btn().disabled).toBe(true, 'Zpráva delší než 140 znaků nesmí jít odeslat.')
        },
      },
    ],
  },
  {
    id: 'vue-props',
    track: 'vue',
    title: 'Props a emits s typy',
    kind: 'vue',
    props: { label: 'Kvalita', max: 5, modelValue: 2 },
    emits: ['update:modelValue'],
    tests: [
      { name: 'zobrazí popisek z props', run: c => expect(c.text('[data-test=label]')).toBe('Kvalita') },
      { name: 'vykreslí max hvězd', run: c => expect(c.findAll('[data-test=star]').length).toBe(5) },
      {
        name: 'prvních modelValue hvězd svítí',
        run: (c) => {
          const stars = c.findAll('[data-test=star]')
          expect(stars.map(s => s.classList.contains('on'))).toEqual([true, true, false, false, false])
          expect(stars.map(s => s.textContent?.trim())).toEqual(['★', '★', '☆', '☆', '☆'])
        },
      },
      {
        name: 'kliknutí emituje update:modelValue',
        run: async (c) => {
          c.findAll('[data-test=star]')[3]!.click()
          await c.tick()
          expect(c.emitted['update:modelValue']).toEqual([[4]], 'Kliknutí na 4. hvězdu má emitovat update:modelValue s hodnotou 4.')
        },
      },
    ],
  },
  {
    id: 'vue-watch',
    track: 'vue',
    title: 'watch a lifecycle',
    kind: 'vue',
    tests: [
      { name: 'onMounted nastaví stav', run: c => expect(c.text('[data-test=status]')).toBe('Připraveno') },
      { name: '20 °C je 68 °F', run: c => expect(c.text('[data-test=fahrenheit]')).toBe('68 °F') },
      {
        name: 'převod reaguje na vstup',
        run: async (c) => {
          await c.type('[data-test=celsius]', '37')
          expect(c.text('[data-test=fahrenheit]')).toBe('99 °F')
        },
      },
      {
        name: 'historie drží poslední 3 změny',
        run: async (c) => {
          for (const v of ['21', '22', '23', '24']) await c.type('[data-test=celsius]', v)
          expect(c.findAll('[data-test=history]').map(li => li.textContent?.trim())).toEqual(['21 → 22', '22 → 23', '23 → 24'])
        },
      },
    ],
  },
  {
    id: 'vue-composable',
    track: 'vue',
    title: 'Composables',
    kind: 'vue',
    tests: [
      { name: 'začíná na hodnotě start (1)', run: c => expect(c.text('[data-test=value]')).toBe('1') },
      {
        name: 'nepřekročí max a tlačítko + se zakáže',
        run: async (c) => {
          for (let i = 0; i < 5; i++) await c.click('[data-test=inc]')
          expect(c.text('[data-test=value]')).toBe('3')
          expect((c.find('[data-test=inc]') as HTMLButtonElement).disabled).toBe(true, 'Na maximu má být + disabled.')
        },
      },
      {
        name: 'neklesne pod min a tlačítko − se zakáže',
        run: async (c) => {
          for (let i = 0; i < 5; i++) await c.click('[data-test=dec]')
          expect(c.text('[data-test=value]')).toBe('0')
          expect((c.find('[data-test=dec]') as HTMLButtonElement).disabled).toBe(true, 'Na minimu má být − disabled.')
        },
      },
      {
        name: 'reset vrátí start',
        run: async (c) => {
          await c.click('[data-test=inc]')
          await c.click('[data-test=reset]')
          expect(c.text('[data-test=value]')).toBe('1')
        },
      },
      {
        name: 'logika je v composable useCounter',
        run: (c) => {
          expect(c.source).toMatch(/function\s+useCounter|const\s+useCounter\s*=/, 'Nenašel jsem funkci useCounter.')
          expect(c.source).toMatch(/useCounter\(\s*\{/, 'useCounter je potřeba zavolat s objektem voleb.')
        },
      },
    ],
  },

  // ───────────── Nuxt ─────────────
  {
    id: 'nuxt-struktura',
    track: 'nuxt',
    title: 'Struktura a routing',
    kind: 'quiz',
    questions: [
      {
        q: 'Který soubor obslouží adresu /blog/jak-zacit-s-vue?',
        options: ['app/pages/blog.vue', 'app/pages/blog/[slug].vue', 'app/routes/blog/slug.ts', 'app/components/Blog.vue'],
        answer: 1,
        why: 'Hranaté závorky v názvu souboru znamenají dynamický parametr. Hodnotu přečteš přes useRoute().params.slug.',
      },
      {
        q: 'Máš komponentu v app/components/PriceTag.vue. Co musíš udělat, abys ji mohl použít ve stránce?',
        options: ['Importovat ji v každé stránce', 'Zaregistrovat ji v nuxt.config.ts', 'Nic, prostě napsat <PriceTag />', 'Přidat ji do app.vue'],
        answer: 2,
        why: 'Nuxt komponenty z app/components automaticky importuje a vygeneruje k nim typy.',
      },
      {
        q: 'Proč na odkazy mezi stránkami používat <NuxtLink> místo <a>?',
        options: ['Jinak odkaz nefunguje', 'Přepne stránku bez znovunačtení a odkazy na obrazovce stáhne dopředu', 'Kvůli SEO, <a> vyhledávače ignorují', 'Kvůli typové kontrole URL'],
        answer: 1,
        why: '<NuxtLink> vykreslí normální <a>, ale navigaci obslouží router v prohlížeči a kód cílové stránky načte předem.',
      },
    ],
  },
  {
    id: 'nuxt-data',
    track: 'nuxt',
    title: 'Data a serverové API',
    kind: 'quiz',
    questions: [
      {
        q: 'Stránka potřebuje při načtení zobrazit seznam článků z /api/posts. Co použiješ?',
        options: ['fetch() v onMounted', 'await useFetch(\'/api/posts\')', '$fetch v watch', 'useState(\'posts\')'],
        answer: 1,
        why: 'useFetch funguje při SSR i v prohlížeči a data nestahuje dvakrát. fetch v onMounted by běžel jen v prohlížeči až po vykreslení.',
      },
      {
        q: 'Uživatel odešle formulář a ty chceš data poslat metodou POST. Co je nejvhodnější?',
        options: ['useFetch v obsluze kliknutí', '$fetch v obsluze kliknutí', 'useAsyncData', 'Middleware'],
        answer: 1,
        why: 'useFetch a useAsyncData patří do setup a slouží k načtení dat pro stránku. Na jednorázové akce je $fetch.',
      },
      {
        q: 'Jak se jmenuje soubor pro endpoint GET /api/users/42?',
        options: ['server/api/users/[id].get.ts', 'app/api/users/42.ts', 'server/routes/users.ts', 'app/pages/api/users/[id].vue'],
        answer: 0,
        why: 'Cestu určuje umístění ve server/api, [id] je parametr a přípona .get omezí endpoint na metodu GET.',
      },
    ],
  },
  {
    id: 'nuxt-nasazeni',
    track: 'nuxt',
    title: 'Layouty, stav a nasazení',
    kind: 'quiz',
    questions: [
      {
        q: 'Chceš, aby se nepřihlášený uživatel na stránku /ucet vůbec nedostal. Kam patří kontrola?',
        options: ['Do onMounted ve stránce', 'Do route middleware', 'Do layoutu', 'Do nuxt.config.ts'],
        answer: 1,
        why: 'Middleware běží před přechodem na stránku a přes navigateTo může uživatele přesměrovat dřív, než se stránka vykreslí.',
      },
      {
        q: 'Tvoje aplikace používá server/api. Který build potřebuješ na Netlify?',
        options: ['nuxt generate', 'nuxt build (serverová část poběží jako Netlify Functions)', 'Stačí nahrát složku app/', 'Netlify Nuxt nepodporuje'],
        answer: 1,
        why: 'nuxt generate vyrobí jen statické soubory, takže serverová API by v produkci nefungovala. nuxt build na Netlify nasadí i server.',
      },
      {
        q: 'Jak sdílet přihlášeného uživatele mezi několika komponentami bez další knihovny?',
        options: ['Globální proměnná v window', 'useState(\'user\')', 'Props přes všechny úrovně', 'localStorage v každé komponentě'],
        answer: 1,
        why: 'useState vytvoří sdílený reaktivní stav pod klíčem, který přežije i přenos ze serveru do prohlížeče.',
      },
    ],
  },
]

export function lessonById(id: string): Lesson | undefined {
  return lessons.find(l => l.id === id)
}

export function lessonsOf(track: TrackId): Lesson[] {
  return lessons.filter(l => l.track === track)
}

export function neighbours(id: string) {
  const i = lessons.findIndex(l => l.id === id)
  return { prev: lessons[i - 1], next: lessons[i + 1] }
}
