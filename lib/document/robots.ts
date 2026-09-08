/**
 * The `robots` and `googlebot` meta contents, from the same decision the App Router pages use.
 *
 * `pageRobotsMetadata` is the one place that decides whether a route may be indexed and that fails
 * closed off the canonical production origin. A document this application writes itself has to
 * paint the tags Next.js would have painted, so it reads that decision and serialises it rather
 * than restating the rule.
 */
import { pageRobotsMetadata, type SeoDeploymentEnvironment } from '@/lib/seo/deployment'

export interface RobotsMetaTags {
  robots: string
  googlebot: string
}

interface RobotsDirectives {
  index?: boolean
  follow?: boolean
  nocache?: boolean
  noimageindex?: boolean
  'max-image-preview'?: string
}

function serialise(directives: RobotsDirectives): string {
  const parts = [directives.index ? 'index' : 'noindex', directives.follow ? 'follow' : 'nofollow']
  if (directives.nocache) parts.push('nocache')
  if (directives.noimageindex) parts.push('noimageindex')
  const preview = directives['max-image-preview']
  if (preview) parts.push(`max-image-preview:${preview}`)
  return parts.join(', ')
}

export function robotsMetaTags(
  decision: { index: boolean; follow: boolean },
  environment: SeoDeploymentEnvironment = process.env,
): RobotsMetaTags {
  const metadata = pageRobotsMetadata(decision, environment) as RobotsDirectives & {
    googleBot?: RobotsDirectives
  }
  return {
    robots: serialise(metadata),
    googlebot: serialise(metadata.googleBot ?? metadata),
  }
}
