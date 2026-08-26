import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RNAWiki — Medicine evidence, explained',
    short_name: 'RNAWiki',
    description:
      'Source-linked medicine evidence showing what studies measured, found and could not prove.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F5F7',
    theme_color: '#0071E3',
    icons: [{ src: '/icon', sizes: '64x64', type: 'image/png' }],
  }
}
