// Railway deploy health check target (see railway.toml). Deliberately does not touch the
// database or any other dependency — this only needs to prove the Next.js server process
// itself is up and serving requests; a DB outage should not also fail the health check and
// take a working app server out of rotation.
export async function GET() {
  return new Response('ok', { status: 200 })
}
