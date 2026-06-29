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
