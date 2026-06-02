'use client'
interface OptionButtonProps {
  label: string
  selected: boolean
  onClick: () => void
}
export default function OptionButton({ label, selected, onClick }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '9px 14px',
        borderRadius: '8px',
        border: selected ? '2px solid #111' : '1.5px solid #ddd',
        background: selected ? '#f5f5f5' : '#fff',
        color: '#111',
        fontSize: '14px',
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
          border: selected ? '5px solid #111' : '1.5px solid #bbb',
          display: 'inline-block',
        }}/>
        {label}
      </span>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8l3.5 3.5L13 4.5" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}
