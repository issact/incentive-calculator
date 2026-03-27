import { Router } from "express"
import { prisma } from "../lib/prisma.js"

const router = Router()

const startedAt = Date.now()

async function checkDb() {
    const started = Date.now()
    try {
        await prisma.$queryRaw`SELECT 1`
        return { ok: true, latencyMs: Date.now() - started }
    } catch (err) {
        return { ok: false, latencyMs: Date.now() - started, error: err instanceof Error ? err.message : String(err) }
    }
}

function baseHealth() {
    const mem = process.memoryUsage()
    return {
        status: "ok" as "ok" | "degraded",
        timestamp: new Date().toISOString(),
        uptimeSec: Math.floor(process.uptime()),
        startedAt: new Date(startedAt).toISOString(),
        node: process.version,
        service: {
            name: process.env.RENDER_SERVICE_NAME || process.env.npm_package_name || "incentive-calc-back",
            env: process.env.NODE_ENV || "development",
            gitCommit: process.env.RENDER_GIT_COMMIT || undefined
        },
        memory: {
            rss: mem.rss,
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal
        }
    }
}

function renderHealthHtml(input: {
    apiBase: string
    health: Awaited<ReturnType<typeof getHealthJson>>
}) {
    const { health, apiBase } = input
    const db = health.dependencies.db
    const dbBadge = db.ok ? "ok" : "bad"
    const overallBadge = health.status === "ok" ? "ok" : "warn"

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Server Health</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 0; padding: 24px; }
    .wrap { max-width: 920px; margin: 0 auto; }
    .title { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    h1 { font-size: 22px; margin: 0; }
    .meta { opacity: .8; font-size: 13px; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 18px; }
    @media (min-width: 860px) { .grid { grid-template-columns: 1fr 1fr; } }
    .card { border: 1px solid rgba(127,127,127,.25); border-radius: 12px; padding: 14px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid rgba(127,127,127,.12); }
    .row:last-child { border-bottom: none; }
    .k { opacity: .75; }
    .v { font-weight: 600; overflow-wrap: anywhere; text-align: right; }
    .badge { display:inline-flex; align-items:center; gap:8px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; border: 1px solid rgba(127,127,127,.25); }
    .dot { width: 8px; height: 8px; border-radius: 999px; }
    .ok .dot { background: #16a34a; }
    .warn .dot { background: #f59e0b; }
    .bad .dot { background: #dc2626; }
    .ok { color: inherit; }
    .actions { margin-top: 14px; display:flex; flex-wrap:wrap; gap: 10px; }
    a { color: inherit; }
    .btn { display:inline-flex; align-items:center; justify-content:center; padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(127,127,127,.25); text-decoration:none; font-weight: 700; font-size: 13px; }
    pre { margin: 0; font-size: 12px; overflow:auto; padding: 12px; border-radius: 10px; border: 1px solid rgba(127,127,127,.25); background: rgba(127,127,127,.06); }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="title">
      <div>
        <h1>Server Health</h1>
        <div class="meta">${health.service.name} • ${health.service.env} • ${health.node}</div>
      </div>
      <div class="badge ${overallBadge}"><span class="dot"></span>${health.status.toUpperCase()}</div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="row"><div class="k">Time</div><div class="v">${health.timestamp}</div></div>
        <div class="row"><div class="k">Uptime</div><div class="v">${health.uptimeSec}s</div></div>
        <div class="row"><div class="k">Started</div><div class="v">${health.startedAt}</div></div>
        <div class="row"><div class="k">Git Commit</div><div class="v">${health.service.gitCommit ?? "-"}</div></div>
      </div>

      <div class="card">
        <div class="row"><div class="k">DB</div><div class="v"><span class="badge ${dbBadge}"><span class="dot"></span>${db.ok ? "OK" : "DOWN"}</span></div></div>
        <div class="row"><div class="k">DB Latency</div><div class="v">${db.latencyMs}ms</div></div>
        <div class="row"><div class="k">RSS</div><div class="v">${health.memory.rss}</div></div>
        <div class="row"><div class="k">Heap Used</div><div class="v">${health.memory.heapUsed}</div></div>
      </div>
    </div>

    <div class="actions">
      <a class="btn" href="${apiBase}/health">Health JSON</a>
      <a class="btn" href="${apiBase}/health/ui">Refresh</a>
    </div>

    <div style="margin-top:14px">
      <pre>${escapeHtml(JSON.stringify(health, null, 2))}</pre>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

async function getHealthJson() {
    const health = baseHealth()
    const db = await checkDb()
    const status: "ok" | "degraded" = db.ok ? "ok" : "degraded"

    return {
        ...health,
        status,
        dependencies: {
            db: {
                ok: db.ok,
                latencyMs: db.latencyMs,
                ...(db.ok ? {} : { error: db.error })
            }
        }
    }
}

router.get("/", (_req, res) => {
    // Minimal landing page so Render health probes don't spam logs.
    res.type("html").send(`<html><body><h3>incentive-calc-back</h3><p>OK. Try <a href="/health/ui">/health/ui</a> or <a href="/health">/health</a>.</p></body></html>`)
})

router.head("/", (_req, res) => {
    res.status(200).end()
})

router.get("/health", async (_req, res) => {
    const data = await getHealthJson()
    res.json(data)
})

router.get("/health/ui", async (req, res) => {
    const data = await getHealthJson()
    res.type("html").send(renderHealthHtml({ apiBase: `${req.protocol}://${req.get("host")}`, health: data }))
})

export default router

