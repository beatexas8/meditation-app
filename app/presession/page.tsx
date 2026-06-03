'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadProfile, saveProfile } from '@/lib/profile'

const VOICES = [
  { id: 'female', label: 'Femenina' },
  { id: 'male',   label: 'Masculina' },
] as const

const DURATIONS = [5, 10, 15, 20] as const

const AMBIENCES = [
  { id: 'rain',   label: 'Lluvia' },
  { id: 'forest', label: 'Bosque' },
  { id: 'ocean',  label: 'Oceano' },
  { id: 'silent', label: 'Silencio' },
] as const

const INTENTIONS = [
  { id: 'calm',      label: 'Calmar la mente' },
  { id: 'focus',     label: 'Enfocarme' },
  { id: 'rest',      label: 'Descansar' },
  { id: 'energy',    label: 'Activar energia' },
  { id: 'gratitude', label: 'Cultivar gratitud' },
] as const

type Voice     = typeof VOICES[number]['id']
type Ambience  = typeof AMBIENCES[number]['id']
type Intention = typeof INTENTIONS[number]['id']

export interface PreSessionConfig {
  voice: Voice
  duration: number
  ambience: Ambience
  binaural: boolean
  intention: Intention
}

export default function PreSessionPage() {
  const router = useRouter()
  const [voice,     setVoice]    = useState<Voice>('female')
  const [duration,  setDuration] = useState<number>(10)
  const [ambience,  setAmbience] = useState<Ambience>('silent')
  const [binaural,  setBinaural] = useState(false)
  const [intention, setIntention] = useState<Intention | null>(null)
  const [mounted,   setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    const profile = loadProfile()
    if (!profile) { router.push('/onboarding'); return }
    if (profile.preferredDuration) setDuration(profile.preferredDuration)
  }, [router])

  function handleStart() {
    if (!intention) return
    const config: PreSessionConfig = { voice, duration, ambience, binaural, intention }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('presession_config', JSON.stringify(config))
    }
    const profile = loadProfile()
    if (profile) { profile.preferredDuration = duration; saveProfile(profile) }
    router.push('/session')
  }

  if (!mounted) return null

  const sel = (active: boolean): React.CSSProperties => ({
    borderRadius: '12px',
    border: active ? '1.5px solid #1a1a1a' : '1.5px solid #e8e4df',
    background: active ? '#1a1a1a' : '#fff',
    color: active ? '#fff' : '#555',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f2', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0 60px', fontFamily: 'Georgia, serif' }}>

      <div style={{ width: '100%', maxWidth: '480px', padding: '40px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', fontSize: '13px', color: '#aaa', cursor: 'pointer' }}>
          inicio
        </button>
        <span style={{ fontSize: '11px', color: '#bbb', letterSpacing: '0.12em', textTransform: 'uppercase' }}>tu sesion</span>
        <div style={{ width: '60px' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '480px', padding: '32px 24px 0', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>Como quieres meditar hoy?</h1>
        <p style={{ fontSize: '14px', color: '#999', marginTop: '10px', fontWeight: 300 }}>Cada sesion se adapta a este momento</p>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', padding: '0 24px' }}>

        <Label text="Intencion" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INTENTIONS.map(i => (
            <button key={i.id} onClick={() => setIntention(i.id)} style={{ ...sel(intention === i.id), width: '100%', padding: '14px 18px', fontSize: '15px', textAlign: 'left' }}>
              {i.label}
            </button>
          ))}
        </div>

        <Label text="Duracion" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setDuration(d)} style={{ ...sel(duration === d), padding: '14px 8px', fontSize: '14px' }}>
              {d} min
            </button>
          ))}
        </div>

        <Label text="Voz" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {VOICES.map(v => (
            <button key={v.id} onClick={() => setVoice(v.id)} style={{ ...sel(voice === v.id), padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {v.label}
            </button>
          ))}
        </div>

        <Label text="Ambiente" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {AMBIENCES.map(a => (
            <button key={a.id} onClick={() => setAmbience(a.id)} style={{ ...sel(ambience === a.id), padding: '14px 8px', fontSize: '12px' }}>
              {a.label}
            </button>
          ))}
        </div>

        <Label text="Binaural" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#fff', borderRadius: '12px', border: '1.5px solid #e8e4df' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>Frecuencias binaurales</p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#aaa' }}>Usa audifonos para mejor efecto</p>
          </div>
          <button onClick={() => setBinaural(!binaural)} style={{ width: '44px', height: '24px', borderRadius: '99px', border: 'none', background: binaural ? '#1a1a1a' : '#ddd', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: '3px', left: binaural ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s ease', display: 'block' }} />
          </button>
        </div>

        <div style={{ marginTop: '32px' }}>
          <button onClick={handleStart} disabled={!intention} style={{ width: '100%', padding: '18px', borderRadius: '14px', border: 'none', background: intention ? '#1a1a1a' : '#e0ddd9', color: intention ? '#fff' : '#bbb', fontSize: '16px', cursor: intention ? 'pointer' : 'not-allowed' }}>
            {intention ? 'Comenzar sesion' : 'Elige una intencion para continuar'}
          </button>
        </div>

      </div>
    </div>
  )
}

function Label({ text }: { text: string }) {
  return <p style={{ margin: '32px 0 12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', fontWeight: 500 }}>{text}</p>
}
