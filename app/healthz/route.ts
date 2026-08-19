// Railway's healthcheck (railway.toml: healthcheckPath = "/healthz"). It deliberately does NOT
// touch the database: a transient DB blip would otherwise fail the healthcheck and roll back an
// otherwise-good deploy. Liveness and readiness are different questions, and this answers liveness.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
