# Wedding Juwe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page Malay wedding website for Najwan Shah & Aisyah that displays event details and lets guests submit wishes (name + message) that are stored in MongoDB and displayed publicly.

**Architecture:** React 19 + Vite + TypeScript frontend styled with Tailwind CSS v4, talking through a typed API client to a co-located Express + Mongoose backend. The backend connects to MongoDB Atlas via `MONGODB_URI` from a gitignored `.env`. Vite dev server proxies `/api` to Express; both run together via `concurrently`.

**Tech Stack:** React 19, Vite 8, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), Express 4, Mongoose 8, Vitest, @testing-library/react, supertest, mongodb-memory-server, concurrently.

## Global Constraints

- All app code lives in the `wedding-juwe/` subdirectory (the Vite app). Run all `npm` commands from there.
- Node 22 (ESM project — `package.json` has `"type": "module"`). Backend is plain ESM JavaScript (`.js`); no separate backend build step.
- Couple: **Najwan Shah** (groom) & **Aisyah** (bride). Date: **8 August 2026**. Venue: **Masjid Sri Sendayan**. Copy these strings verbatim.
- Visual style: songket-inspired — gold (`#C9A227`), maroon (`#7A1F2B`), deep green (`#1F4D36`), cream (`#FBF7EF`). Classic serif headings.
- Frontend never calls `fetch` directly in components — only through `src/api/wishes.ts`.
- Secrets (`MONGODB_URI`) live only in `.env`, which must be gitignored. Never commit the connection string.

---

### Task 1: Add Tailwind CSS v4 with songket theme

**Files:**
- Modify: `wedding-juwe/package.json` (deps)
- Modify: `wedding-juwe/vite.config.ts`
- Modify: `wedding-juwe/src/index.css`
- Delete: `wedding-juwe/src/App.css` usage (replaced later)

**Interfaces:**
- Produces: Tailwind utility classes available app-wide; theme colors `gold`, `maroon`, `green`, `cream` usable as `bg-maroon`, `text-gold`, etc.

- [ ] **Step 1: Install Tailwind v4**

Run from `wedding-juwe/`:
```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add the Tailwind Vite plugin**

Edit `wedding-juwe/vite.config.ts` to:
```ts
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
```

- [ ] **Step 3: Replace `src/index.css` with Tailwind import + theme**

Replace the entire contents of `wedding-juwe/src/index.css` with:
```css
@import "tailwindcss";

@theme {
  --color-gold: #c9a227;
  --color-maroon: #7a1f2b;
  --color-green: #1f4d36;
  --color-cream: #fbf7ef;
  --font-serif: Georgia, 'Times New Roman', serif;
}

body {
  margin: 0;
  background-color: var(--color-cream);
  color: var(--color-maroon);
  font-family: system-ui, sans-serif;
}
```

- [ ] **Step 4: Verify the dev build compiles**

Run: `npm run build`
Expected: build succeeds with no Tailwind/Vite errors (existing `App.tsx` still compiles).

- [ ] **Step 5: Commit**

```bash
git add wedding-juwe/package.json wedding-juwe/package-lock.json wedding-juwe/vite.config.ts wedding-juwe/src/index.css
git commit -m "feat: add Tailwind CSS v4 with songket theme"
```

---

### Task 2: Backend scaffold — Express app, env config, Mongoose connection, Wish model

**Files:**
- Modify: `wedding-juwe/package.json` (deps + scripts)
- Create: `wedding-juwe/.env.example`
- Modify: `wedding-juwe/.gitignore`
- Create: `wedding-juwe/server/db.js`
- Create: `wedding-juwe/server/models/Wish.js`
- Create: `wedding-juwe/server/app.js`
- Create: `wedding-juwe/server/index.js`

**Interfaces:**
- Produces:
  - `server/models/Wish.js` default-exports a Mongoose model `Wish` with schema `{ name: String (required, trim), message: String (required, trim), createdAt: Date (default now) }`.
  - `server/app.js` exports `createApp()` returning a configured Express `app` (JSON body parser, routes mounted at `/api`). No DB connection inside.
  - `server/db.js` exports `connectDB(uri)` returning a promise that resolves once connected.
  - `server/index.js` is the runnable entry: reads `process.env`, connects, listens on `PORT` (default 3001).

- [ ] **Step 1: Install backend deps**

Run from `wedding-juwe/`:
```bash
npm install express mongoose dotenv
npm install -D concurrently supertest mongodb-memory-server vitest
```

- [ ] **Step 2: Ignore `.env`**

Append to `wedding-juwe/.gitignore`:
```
# Local env
.env
```

- [ ] **Step 3: Create `.env.example`**

Create `wedding-juwe/.env.example`:
```
# MongoDB Atlas connection string (include the database name, e.g. .../wedding)
MONGODB_URI=mongodb+srv://user:pass@cluster0.example.mongodb.net/wedding
PORT=3001
```

- [ ] **Step 4: Create the Wish model**

Create `wedding-juwe/server/models/Wish.js`:
```js
import mongoose from 'mongoose'

const wishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Wish', wishSchema)
```

- [ ] **Step 5: Create the DB connector**

Create `wedding-juwe/server/db.js`:
```js
import mongoose from 'mongoose'

export function connectDB(uri) {
  return mongoose.connect(uri)
}
```

- [ ] **Step 6: Create the Express app factory (routes added in Task 3)**

Create `wedding-juwe/server/app.js`:
```js
import express from 'express'

export function createApp() {
  const app = express()
  app.use(express.json())
  return app
}
```

- [ ] **Step 7: Create the runnable entry point**

Create `wedding-juwe/server/index.js`:
```js
import 'dotenv/config'
import { createApp } from './app.js'
import { connectDB } from './db.js'

const PORT = process.env.PORT || 3001
const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

connectDB(uri)
  .then(() => {
    const app = createApp()
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
```

- [ ] **Step 8: Add scripts**

In `wedding-juwe/package.json`, set the `scripts` block to:
```json
{
  "dev": "concurrently -n web,api -c blue,green \"npm:dev:web\" \"npm:dev:api\"",
  "dev:web": "vite",
  "dev:api": "node --watch server/index.js",
  "build": "tsc -b && vite build",
  "lint": "oxlint",
  "preview": "vite preview",
  "test": "vitest run"
}
```

- [ ] **Step 9: Verify the model loads**

Run: `node -e "import('./server/models/Wish.js').then(()=>console.log('ok'))"`
Expected: prints `ok` (no import errors).

- [ ] **Step 10: Commit**

```bash
git add wedding-juwe/package.json wedding-juwe/package-lock.json wedding-juwe/.gitignore wedding-juwe/.env.example wedding-juwe/server
git commit -m "feat: scaffold express backend with mongoose Wish model"
```

---

### Task 3: Backend wishes routes (GET/POST) with validation + tests

**Files:**
- Create: `wedding-juwe/server/routes/wishes.js`
- Modify: `wedding-juwe/server/app.js`
- Create: `wedding-juwe/server/routes/wishes.test.js`
- Create: `wedding-juwe/vitest.config.ts`

**Interfaces:**
- Consumes: `Wish` model from Task 2; `createApp()` from Task 2.
- Produces:
  - `server/routes/wishes.js` default-exports an Express `Router`:
    - `GET /` → `200` JSON array of wishes, newest first.
    - `POST /` → body `{ name, message }`; `400 { error }` if either missing/blank after trim; `201` with created wish `{ _id, name, message, createdAt }`; `500 { error }` on DB failure.
  - `createApp()` now mounts this router at `/api/wishes`.

- [ ] **Step 1: Add a Vitest config that isolates Node tests**

Create `wedding-juwe/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['src/**', 'jsdom']],
    globals: true,
  },
})
```

- [ ] **Step 2: Write the failing route tests**

Create `wedding-juwe/server/routes/wishes.test.js`:
```js
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createApp } from '../app.js'

let mongod
let app

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
  app = createApp()
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

describe('wishes routes', () => {
  it('rejects a wish with a blank name', async () => {
    const res = await request(app).post('/api/wishes').send({ name: '  ', message: 'Hi' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('rejects a wish with a blank message', async () => {
    const res = await request(app).post('/api/wishes').send({ name: 'Ali', message: '' })
    expect(res.status).toBe(400)
  })

  it('creates a wish and returns it', async () => {
    const res = await request(app)
      .post('/api/wishes')
      .send({ name: 'Ali', message: 'Congrats!' })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Ali')
    expect(res.body.message).toBe('Congrats!')
    expect(res.body._id).toBeTruthy()
  })

  it('lists wishes newest first', async () => {
    await request(app).post('/api/wishes').send({ name: 'Siti', message: 'First' })
    await request(app).post('/api/wishes').send({ name: 'Budi', message: 'Second' })
    const res = await request(app).get('/api/wishes')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const names = res.body.map((w) => w.name)
    expect(names.indexOf('Budi')).toBeLessThan(names.indexOf('Siti'))
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- server/routes/wishes.test.js`
Expected: FAIL (route not found — POST/GET return 404).

- [ ] **Step 4: Implement the router**

Create `wedding-juwe/server/routes/wishes.js`:
```js
import { Router } from 'express'
import Wish from '../models/Wish.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const wishes = await Wish.find().sort({ createdAt: -1 }).lean()
    res.json(wishes)
  } catch {
    res.status(500).json({ error: 'Failed to load wishes' })
  }
})

router.post('/', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : ''

  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' })
  }

  try {
    const wish = await Wish.create({ name, message })
    res.status(201).json(wish)
  } catch {
    res.status(500).json({ error: 'Failed to save wish' })
  }
})

export default router
```

- [ ] **Step 5: Mount the router in `app.js`**

Edit `wedding-juwe/server/app.js` to:
```js
import express from 'express'
import wishesRouter from './routes/wishes.js'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/wishes', wishesRouter)
  return app
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- server/routes/wishes.test.js`
Expected: PASS (4 tests).

- [ ] **Step 7: Commit**

```bash
git add wedding-juwe/server wedding-juwe/vitest.config.ts
git commit -m "feat: add wishes GET/POST routes with validation and tests"
```

---

### Task 4: Frontend typed API client + tests

**Files:**
- Create: `wedding-juwe/src/api/wishes.ts`
- Create: `wedding-juwe/src/api/wishes.test.ts`

**Interfaces:**
- Consumes: backend `/api/wishes` shape from Task 3.
- Produces:
  - Type `Wish = { _id: string; name: string; message: string; createdAt: string }`.
  - Type `WishInput = { name: string; message: string }`.
  - `getWishes(): Promise<Wish[]>` — GET `/api/wishes`, throws `Error` on non-2xx.
  - `createWish(input: WishInput): Promise<Wish>` — POST `/api/wishes`, throws `Error` with the server's `error` message on non-2xx.

- [ ] **Step 1: Write the failing tests**

Create `wedding-juwe/src/api/wishes.test.ts`:
```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWish, getWishes } from './wishes'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('wishes api client', () => {
  it('getWishes returns parsed wishes', async () => {
    const data = [{ _id: '1', name: 'Ali', message: 'Hi', createdAt: '2026-08-08' }]
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(data), { status: 200 })))
    const wishes = await getWishes()
    expect(wishes).toEqual(data)
  })

  it('createWish posts and returns the created wish', async () => {
    const created = { _id: '2', name: 'Siti', message: 'Congrats', createdAt: '2026-08-08' }
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(created), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await createWish({ name: 'Siti', message: 'Congrats' })
    expect(result).toEqual(created)
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/wishes',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('createWish throws the server error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: 'Name and message are required.' }), { status: 400 })),
    )
    await expect(createWish({ name: '', message: '' })).rejects.toThrow('Name and message are required.')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/api/wishes.test.ts`
Expected: FAIL (`./wishes` module not found).

- [ ] **Step 3: Implement the API client**

Create `wedding-juwe/src/api/wishes.ts`:
```ts
export type Wish = {
  _id: string
  name: string
  message: string
  createdAt: string
}

export type WishInput = {
  name: string
  message: string
}

const BASE = '/api/wishes'

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (body && typeof body.error === 'string') return body.error
  } catch {
    /* ignore */
  }
  return 'Something went wrong. Please try again.'
}

export async function getWishes(): Promise<Wish[]> {
  const res = await fetch(BASE)
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function createWish(input: WishInput): Promise<Wish> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/api/wishes.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add wedding-juwe/src/api
git commit -m "feat: add typed wishes API client with tests"
```

---

### Task 5: Hero component

**Files:**
- Create: `wedding-juwe/src/components/Hero.tsx`

**Interfaces:**
- Produces: `Hero` (default export), no props. Renders couple names, date, venue using `hero.png`.

- [ ] **Step 1: Create the Hero component**

Create `wedding-juwe/src/components/Hero.tsx`:
```tsx
import heroImg from '../assets/hero.png'

export default function Hero() {
  return (
    <header className="bg-maroon text-cream text-center px-6 py-16">
      <p className="text-gold tracking-[0.3em] uppercase text-sm mb-6">
        Walimatulurus
      </p>
      <img
        src={heroImg}
        alt=""
        className="mx-auto mb-8 h-40 w-40 rounded-full border-4 border-gold object-cover"
      />
      <h1 className="font-serif text-4xl sm:text-5xl text-gold mb-2">
        Najwan Shah
      </h1>
      <p className="font-serif text-2xl text-cream mb-2">&amp;</p>
      <h1 className="font-serif text-4xl sm:text-5xl text-gold mb-8">Aisyah</h1>
      <div className="inline-block border-t border-b border-gold/60 py-3 px-6">
        <p className="text-lg">8 August 2026</p>
        <p className="text-cream/80">Masjid Sri Sendayan</p>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc -b`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add wedding-juwe/src/components/Hero.tsx
git commit -m "feat: add Hero section with couple and event details"
```

---

### Task 6: WishForm component + tests

**Files:**
- Create: `wedding-juwe/src/test/setup.ts`
- Modify: `wedding-juwe/vitest.config.ts`
- Create: `wedding-juwe/src/components/WishForm.tsx`
- Create: `wedding-juwe/src/components/WishForm.test.tsx`

**Interfaces:**
- Consumes: `createWish`, `Wish` from `src/api/wishes.ts`.
- Produces: `WishForm` (default export) with prop `{ onCreated: (wish: Wish) => void }`. Controlled name + message inputs; on submit calls `createWish`, calls `onCreated` with the result, clears the fields, and shows a thank-you message. Shows an error message on failure without clearing input.

- [ ] **Step 1: Install testing-library deps**

Run from `wedding-juwe/`:
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: Create the test setup file**

Create `wedding-juwe/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Wire setup into Vitest config**

Edit `wedding-juwe/vitest.config.ts` to add `setupFiles`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [['src/**', 'jsdom']],
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
})
```

- [ ] **Step 4: Write the failing form test**

Create `wedding-juwe/src/components/WishForm.test.tsx`:
```tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as api from '../api/wishes'
import WishForm from './WishForm'

describe('WishForm', () => {
  it('submits a wish and shows a thank-you message', async () => {
    const created = { _id: '1', name: 'Ali', message: 'Congrats', createdAt: '2026-08-08' }
    const spy = vi.spyOn(api, 'createWish').mockResolvedValue(created)
    const onCreated = vi.fn()
    render(<WishForm onCreated={onCreated} />)

    await userEvent.type(screen.getByLabelText(/name/i), 'Ali')
    await userEvent.type(screen.getByLabelText(/message/i), 'Congrats')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => expect(spy).toHaveBeenCalledWith({ name: 'Ali', message: 'Congrats' }))
    expect(onCreated).toHaveBeenCalledWith(created)
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test -- src/components/WishForm.test.tsx`
Expected: FAIL (`./WishForm` not found).

- [ ] **Step 6: Implement WishForm**

Create `wedding-juwe/src/components/WishForm.tsx`:
```tsx
import { useState } from 'react'
import { createWish, type Wish } from '../api/wishes'

type Props = { onCreated: (wish: Wish) => void }

export default function WishForm({ onCreated }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('sending')
    try {
      const wish = await createWish({ name: name.trim(), message: message.trim() })
      onCreated(wish)
      setName('')
      setMessage('')
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1 font-serif text-green">
          Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gold/50 bg-white px-3 py-2"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="block mb-1 font-serif text-green">
          Message
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded border border-gold/50 bg-white px-3 py-2"
          required
        />
      </div>
      {error && <p className="text-maroon text-sm">{error}</p>}
      {status === 'done' && (
        <p className="text-green text-sm">Thank you for your wish! 🤍</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="rounded bg-maroon px-6 py-2 text-cream hover:bg-maroon/90 disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send Wish'}
      </button>
    </form>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- src/components/WishForm.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```bash
git add wedding-juwe/src/components/WishForm.tsx wedding-juwe/src/components/WishForm.test.tsx wedding-juwe/src/test wedding-juwe/vitest.config.ts wedding-juwe/package.json wedding-juwe/package-lock.json
git commit -m "feat: add WishForm with submit + thank-you behavior and tests"
```

---

### Task 7: WishList + WishesSection

**Files:**
- Create: `wedding-juwe/src/components/WishList.tsx`
- Create: `wedding-juwe/src/components/WishesSection.tsx`

**Interfaces:**
- Consumes: `getWishes`, `Wish` from `src/api/wishes.ts`; `WishForm` from Task 6.
- Produces:
  - `WishList` (default export), prop `{ wishes: Wish[] }` — renders each wish's name + message; shows an empty state when the array is empty.
  - `WishesSection` (default export), no props — loads wishes on mount via `getWishes`, owns the list state, renders `WishForm` (prepending new wishes via `onCreated`) and `WishList`. Shows a loading state while fetching.

- [ ] **Step 1: Create WishList**

Create `wedding-juwe/src/components/WishList.tsx`:
```tsx
import type { Wish } from '../api/wishes'

type Props = { wishes: Wish[] }

export default function WishList({ wishes }: Props) {
  if (wishes.length === 0) {
    return (
      <p className="text-center text-green/70 italic">
        Be the first to leave a wish.
      </p>
    )
  }

  return (
    <ul className="space-y-4">
      {wishes.map((wish) => (
        <li
          key={wish._id}
          className="rounded-lg border border-gold/40 bg-white p-4 shadow-sm"
        >
          <p className="font-serif text-green">{wish.name}</p>
          <p className="text-maroon/90">{wish.message}</p>
        </li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Create WishesSection**

Create `wedding-juwe/src/components/WishesSection.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { getWishes, type Wish } from '../api/wishes'
import WishForm from './WishForm'
import WishList from './WishList'

export default function WishesSection() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWishes()
      .then(setWishes)
      .catch(() => setWishes([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h2 className="mb-8 text-center font-serif text-3xl text-maroon">
        Ucapan &amp; Doa
      </h2>
      <div className="mb-12 rounded-xl border border-gold/40 bg-cream p-6">
        <WishForm onCreated={(wish) => setWishes((prev) => [wish, ...prev])} />
      </div>
      {loading ? (
        <p className="text-center text-green/70">Loading wishes…</p>
      ) : (
        <WishList wishes={wishes} />
      )}
    </section>
  )
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `npx tsc -b`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add wedding-juwe/src/components/WishList.tsx wedding-juwe/src/components/WishesSection.tsx
git commit -m "feat: add WishList and WishesSection with load + refresh"
```

---

### Task 8: Compose App, clean up scaffold, update README

**Files:**
- Modify: `wedding-juwe/src/App.tsx`
- Delete: `wedding-juwe/src/App.css`
- Modify: `wedding-juwe/index.html` (title)
- Modify: `wedding-juwe/README.md`

**Interfaces:**
- Consumes: `Hero` (Task 5), `WishesSection` (Task 7).
- Produces: final composed single-page app.

- [ ] **Step 1: Replace App.tsx**

Replace the entire contents of `wedding-juwe/src/App.tsx` with:
```tsx
import Hero from './components/Hero'
import WishesSection from './components/WishesSection'

export default function App() {
  return (
    <main>
      <Hero />
      <WishesSection />
      <footer className="bg-maroon py-6 text-center text-cream/70 text-sm">
        Najwan Shah &amp; Aisyah · 8 August 2026
      </footer>
    </main>
  )
}
```

- [ ] **Step 2: Remove the unused scaffold stylesheet**

Run: `rm wedding-juwe/src/App.css`
(`App.tsx` no longer imports it.)

- [ ] **Step 3: Update the page title**

In `wedding-juwe/index.html`, change the `<title>` to:
```html
<title>Najwan Shah &amp; Aisyah · Walimatulurus</title>
```

- [ ] **Step 4: Replace README with run instructions**

Replace `wedding-juwe/README.md` with:
```markdown
# Wedding Juwe

Wedding website for Najwan Shah & Aisyah (8 August 2026, Masjid Sri Sendayan).
Guests can leave wishes that are stored in MongoDB and shown to everyone.

## Setup

1. `cd wedding-juwe && npm install`
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string (include a database name, e.g. `.../wedding`).
3. `npm run dev` — starts the Vite frontend (5173) and the Express API (3001) together.

## Scripts

- `npm run dev` — frontend + backend together
- `npm run build` — type-check and build the frontend
- `npm test` — run all tests (Vitest)
```

- [ ] **Step 5: Verify full build and tests pass**

Run: `npm run build && npm test`
Expected: build succeeds; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add wedding-juwe/src/App.tsx wedding-juwe/index.html wedding-juwe/README.md
git rm wedding-juwe/src/App.css
git commit -m "feat: compose wedding page and update docs"
```

---

## Notes for the implementer

- The user will supply the real `MONGODB_URI` in `.env`. Until then, the API tests use `mongodb-memory-server` and need no real DB; the frontend tests mock `fetch`/the API client. You can complete and verify every task without the Atlas cluster.
- Append `/wedding` (or another db name) to the connection string in `.env` so wishes land in a named database.
