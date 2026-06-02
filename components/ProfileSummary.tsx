'use client'
// components/ProfileSummary.tsx
// Muestra el perfil generado al finalizar el onboarding

import type { UserProfile } from '@/lib/profile'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const MODE_LABELS: Record<string, string> = {
  fully_guided: 'Guiada completa',
  semi_guided: 'Semi guiada',
  contemplative: 'Contemplativa',
  timer: 'Temporizador',
  breathing: 'Respiración guiada',
  soundscape: 'Soundscape',
}

interface ProfileSummaryProps {
  profile: UserProfile
  onStart: () => void
}

export default function ProfileSummary({ profile, onStart }: ProfileSummaryProps) {
  const rows: { label: string; value: string }[] = [
    { label: 'Nivel', value: LEVEL_LABELS[profile.level] ?? profile.level },
    { label: 'Modo recomendado', value: MODE_LABELS[profile.recommendedMode] ?? profile.recommendedMode },
    { label: 'Duración', value: `${profile.preferredDuration} min` },
    { label: 'Idioma', value: profile.preferredLanguage === 'both' ? 'Español / Inglés' : profile.preferredLanguage === 'es' ? 'Español' : 'Inglés' },
    { label: 'Tono', value: profile.preferredTone },
  ]

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginBottom: '0.5rem' }}>
        Tu perfil
      </p>
      <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: '0.5rem' }}>
        Todo listo
      </h2>
      <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
        Hemos configurado tu experiencia de meditación.
      </p>

      <div
        style={{
          border: '1px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden',
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.75rem 1.125rem',
              borderBottom: i < rows.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none',
              fontSize: 14,
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)' }}>{row.label}</span>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{row.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: 'var(--color-text-primary)',
          color: 'var(--color-background-primary)',
          border: 'none',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Comenzar mi primera sesión
      </button>
    </div>
  )
}
