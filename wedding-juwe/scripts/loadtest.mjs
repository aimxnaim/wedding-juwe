// Zero-dependency load test for the wedding site.
//
// Simulates guest sessions hitting the wishes API. Each virtual user does a
// GET /api/wishes (what the homepage does on load); a configurable fraction
// also POST a wish (names are prefixed "LOADTEST-" so they're easy to clean up).
//
// Usage:
//   node scripts/loadtest.mjs <baseUrl> [options]
//
// Options:
//   --users N         total user sessions to simulate   (default 2000)
//   --concurrency C   how many run at the same time      (default 50)
//   --write-ratio R   fraction that also POST a wish 0-1 (default 0 = read-only)
//
// Examples:
//   # Realistic day-of test against a deployed site (read-only, safe):
//   node scripts/loadtest.mjs https://your-app.vercel.app --users 2000 --concurrency 50
//
//   # Stress test to find the ceiling:
//   node scripts/loadtest.mjs https://your-app.vercel.app --users 5000 --concurrency 300
//
//   # Include writes (10% of users leave a wish) — pollutes the DB with
//   # LOADTEST-* entries; clean up afterwards with cleanup-loadtest.mjs:
//   node scripts/loadtest.mjs http://localhost:4000 --users 500 --write-ratio 0.1

const args = process.argv.slice(2)
const baseUrl = args[0]
if (!baseUrl || baseUrl.startsWith('--')) {
  console.error('Usage: node scripts/loadtest.mjs <baseUrl> [--users N] [--concurrency C] [--write-ratio R]')
  process.exit(1)
}

function opt(name, fallback) {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? Number(args[i + 1]) : fallback
}

const TOTAL = opt('users', 2000)
const CONCURRENCY = opt('concurrency', 50)
const WRITE_RATIO = opt('write-ratio', 0)

const base = baseUrl.replace(/\/$/, '')
const latencies = []
let done = 0
let ok = 0
let failed = 0
let nextIndex = 0

async function oneSession() {
  const doWrite = Math.random() < WRITE_RATIO
  const start = performance.now()
  try {
    const getRes = await fetch(`${base}/api/wishes`)
    if (!getRes.ok) throw new Error(`GET ${getRes.status}`)
    await getRes.text()

    if (doWrite) {
      const postRes = await fetch(`${base}/api/wishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `LOADTEST-${Math.random().toString(36).slice(2, 8)}`,
          message: 'load test wish',
        }),
      })
      if (!postRes.ok) throw new Error(`POST ${postRes.status}`)
      await postRes.text()
    }
    ok++
  } catch {
    failed++
  } finally {
    latencies.push(performance.now() - start)
    done++
  }
}

async function worker() {
  while (nextIndex < TOTAL) {
    nextIndex++
    await oneSession()
  }
}

function percentile(sorted, p) {
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))
  return sorted[idx]
}

console.log(
  `Load test → ${base}\n` +
    `  users=${TOTAL}  concurrency=${CONCURRENCY}  write-ratio=${WRITE_RATIO}\n`,
)

const wallStart = performance.now()
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
const wallSec = (performance.now() - wallStart) / 1000

const sorted = latencies.slice().sort((a, b) => a - b)
const mean = latencies.reduce((s, x) => s + x, 0) / latencies.length

console.log('Results:')
console.log(`  completed:        ${done}`)
console.log(`  successful:       ${ok}`)
console.log(`  failed:           ${failed}`)
console.log(`  wall time:        ${wallSec.toFixed(1)} s`)
console.log(`  throughput:       ${(done / wallSec).toFixed(0)} sessions/s`)
console.log(`  latency mean:     ${mean.toFixed(0)} ms`)
console.log(`  latency p50:      ${percentile(sorted, 50).toFixed(0)} ms`)
console.log(`  latency p95:      ${percentile(sorted, 95).toFixed(0)} ms`)
console.log(`  latency p99:      ${percentile(sorted, 99).toFixed(0)} ms`)
console.log(`  latency max:      ${sorted[sorted.length - 1].toFixed(0)} ms`)
