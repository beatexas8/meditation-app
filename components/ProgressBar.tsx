'use client'
export default function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ width: '100%', height: '3px', background: '#eee', borderRadius: '99px', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: '#111', borderRadius: '99px', transition: 'width 0.35s ease' }}/>
    </div>
  )
}
