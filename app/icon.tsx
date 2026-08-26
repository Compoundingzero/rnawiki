import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        background: '#0071e3',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: 38,
        fontWeight: 800,
      }}
    >
      R
    </div>,
    size,
  )
}
