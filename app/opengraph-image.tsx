import { ImageResponse } from 'next/og'

export const alt = 'RNAWiki — public medicine evidence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f5f5f7',
        color: '#1d1d1f',
        padding: '72px 80px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 700 }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 999,
            background: '#0071e3',
            display: 'flex',
          }}
        />
        RNAWiki
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 980 }}>
        <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-2.5px' }}>
          Medicine evidence, explained in plain English.
        </div>
        <div style={{ color: '#515154', fontSize: 30, lineHeight: 1.35 }}>
          What studies measured, what they found, and what remains unknown.
        </div>
      </div>
      <div style={{ color: '#6e6e73', fontSize: 22 }}>rnawiki.com</div>
    </div>,
    size,
  )
}
