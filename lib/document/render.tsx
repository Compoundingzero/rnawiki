/**
 * Turn a document tree into the bytes of a response.
 *
 * `renderToStaticMarkup` writes the markup and nothing else: no hydration markers, no client
 * manifest, no inlined React Server Components stream. That is the whole point of step 6.1, and it
 * is also the constraint on what may appear inside one of these trees — every component in it is a
 * server component with no hooks and no context, and a `'use client'` module would fail here rather
 * than silently ship a second renderer.
 *
 * WHY THE IMPORT IS DYNAMIC AND MARKED `webpackIgnore`.
 *
 * A route handler is compiled in the React Server Components layer, where `react-dom/server` is
 * deliberately unavailable: bundling it statically fails the build, and reaching it through
 * `react-dom/server.node` compiles but resolves to a stub that throws
 * "react-dom/server is not supported in React Server Components". That restriction exists so a page
 * does not quietly gain a second renderer. These two route families are the case it does not cover:
 * they are not pages, they render once on the server, and they exist precisely so that the page
 * renderer's second copy of the record is not sent. `webpackIgnore` leaves the specifier for Node
 * to resolve at run time, with Node's own conditions rather than the bundler's `react-server` one,
 * which is how the real implementation is reached. Elements are plain objects keyed by registered
 * symbols, so a tree built by one copy of React renders correctly through another.
 */
import type { ReactElement } from 'react'

type StaticRenderer = (element: ReactElement) => string

interface ReactDomServer {
  renderToStaticMarkup?: StaticRenderer
  default?: { renderToStaticMarkup?: StaticRenderer }
}

const DOCTYPE = '<!doctype html>'

let cached: StaticRenderer | null = null

async function staticRenderer(): Promise<StaticRenderer> {
  if (cached) return cached
  const loaded = (await import(/* webpackIgnore: true */ 'react-dom/server')) as ReactDomServer
  const render = loaded.renderToStaticMarkup ?? loaded.default?.renderToStaticMarkup
  if (!render) throw new Error('react-dom/server did not export renderToStaticMarkup')
  cached = render
  return render
}

export async function renderDocument(tree: ReactElement): Promise<string> {
  const render = await staticRenderer()
  return `${DOCTYPE}${render(tree)}`
}

/** The response a document route returns, with the content type and no store of its own. */
export async function documentResponse(
  tree: ReactElement,
  init: ResponseInit = {},
): Promise<Response> {
  return new Response(await renderDocument(tree), {
    ...init,
    headers: { 'content-type': 'text/html; charset=utf-8', ...(init.headers ?? {}) },
  })
}
