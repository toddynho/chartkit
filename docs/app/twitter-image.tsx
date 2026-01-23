import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ChartKit - Lightweight charts for React & Next.js';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0c',
          backgroundImage: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a1a 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
          >
            <rect width="32" height="32" rx="8" fill="#4ade80" fillOpacity="0.1" />
            <path
              d="M8 22L12 14L16 18L20 10L24 16"
              stroke="#4ade80"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          ChartKit
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: '#a1a1aa',
            marginBottom: 48,
          }}
        >
          Lightweight charts for React & Next.js
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 32,
          }}
        >
          {['14 Charts', '17 Themes', '~15KB', 'Zero Deps'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: 8,
                padding: '12px 24px',
                fontSize: 20,
                color: '#4ade80',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            fontSize: 24,
            color: '#52525b',
          }}
        >
          chartkit.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
