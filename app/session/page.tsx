'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { loadProfile } from '@/lib/profile'
import type { UserProfile } from '@/lib/profile'

type SessionState = 'loading' | 'ready' | 'playing' | 'paused' | 'done' | 'error'

const OBJECTIVE_LABELS: Record<string, string> = {
  sleep: 'Dormir mejor',
  anxiety: 'Reducir ansiedad',
  stress: 'Reducir estrés',
  focus: 'Mejorar concentración',
  emotional: 'Bienestar emocional',
  growth: 'Crecimiento personal',
  spiritual: 'Espiritualidad',
  other: 'Bienestar general',
}

const MOOD_LABELS: Record<string, string> = {
  calm: 'tranquilo/a',
  stressed: 'estresado/a',
  anxious: 'ansioso/a',
  tired: 'cansado/a',
  overwhelmed: 'abrumado/a',
  unmotivated: 'desmotivado/a',
  variable: 'variable',
}

const STEPS = [
  { label: 'Analizando tu perfil...', pct: 10 },
  { label: 'Creando tu meditación...', pct: 35 },
  { label: 'Generando tu voz...', pct: 65 },
  { label: 'Preparando tu sesión...', pct: 90 },
  { label: 'Listo', pct: 100 },
]

type Segment = { type: 'audio' | 'silence', data: string, seconds?: number }

export default function SessionPage() {
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const segmentsRef = useRef<Segment[]>([])
  const currentSegRef = useRef(0)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef(0)
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [state, setState] = useState<SessionState>('loading')
  const [voice, setVoice] = useState<'male' | 'female'>('female')
  const [presessionConfig, setPresessionConfig] = useState<any>(null)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingPct, setLoadingPct] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)

  useEffect(() => {
    const p = loadProfile()
    if (!p) { router.push('/onboarding'); return }
    setProfile(p)
    const raw = sessionStorage.getItem("presession_config")
    if (raw) { try { const config = JSON.parse(raw); setPresessionConfig(config); if (config.voice) setVoice(config.voice as any) } catch {} }
  }, [router])

  useEffect(() => {
    if (!profile) return
    generateSession()
  }, [profile])

  function animateTo(pct: number, step: number) {
    setLoadingStep(step)
    setLoadingPct(pct)
  }

  async function generateSession() {
    if (!profile) return
    try {
      setState('loading')
      setLoadingPct(0)
      setElapsed(0)
      elapsedRef.current = 0
      currentSegRef.current = 0
      segmentsRef.current = []

      animateTo(STEPS[0].pct, 0)
      await new Promise(r => setTimeout(r, 600))

      animateTo(STEPS[1].pct, 1)
      const scriptRes = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: profile.level,
          objective: OBJECTIVE_LABELS[profile.answers.objective ?? ''] ?? 'bienestar general',
          mood: MOOD_LABELS[profile.answers.current_mood ?? ''] ?? 'neutral',
          tone: profile.preferredTone,
          duration: presessionConfig?.duration ?? profile.preferredDuration,
          mode: profile.recommendedMode,
        }),
      })
      if (!scriptRes.ok) throw new Error('Error generando script')
      const { script } = await scriptRes.json()

      animateTo(STEPS[2].pct, 2)
      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, voice }),
      })
      if (!audioRes.ok) throw new Error('Error generando audio')
      const { segments } = await audioRes.json()

      animateTo(STEPS[3].pct, 3)
      segmentsRef.current = segments

      // Calcular duración real: medir cada audio + silencios exactos
      let total = 0
      for (const seg of segments) {
        if (seg.type === 'silence') {
          total += seg.seconds ?? 0
        } else {
          // Medir duración real del audio decodificando el buffer
          const bytes = Uint8Array.from(atob(seg.data), c => c.charCodeAt(0))
          const blob = new Blob([bytes], { type: 'audio/mpeg' })
          const url = URL.createObjectURL(blob)
          const dur = await new Promise<number>(resolve => {
            const a = new Audio(url)
            a.onloadedmetadata = () => { resolve(a.duration); URL.revokeObjectURL(url) }
            a.onerror = () => { resolve(5); URL.revokeObjectURL(url) }
          })
          total += dur
        }
      }
      setTotalDuration(Math.round(total))

      animateTo(STEPS[4].pct, 4)
      await new Promise(r => setTimeout(r, 400))
      setState('ready')
    } catch (e) {
      console.error(e)
      setError('Hubo un error generando tu sesión. Intenta de nuevo.')
      setState('error')
    }
  }

  const stopElapsedTimer = useCallback(() => {
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current)
      elapsedTimerRef.current = null
    }
  }, [])

  const startElapsedTimer = useCallback(() => {
    stopElapsedTimer()
    elapsedTimerRef.current = setInterval(() => {
      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
    }, 1000)
  }, [stopElapsedTimer])

  const playNextSegment = useCallback(() => {
    const segments = segmentsRef.current
    const idx = currentSegRef.current
    if (idx >= segments.length) {
      stopElapsedTimer()
      setState('done')
      return
    }
    const seg = segments[idx]
    currentSegRef.current = idx + 1

    if (seg.type === 'silence') {
      silenceTimerRef.current = setTimeout(() => {
        playNextSegment()
      }, (seg.seconds ?? 0) * 1000)
    } else {
      const bytes = Uint8Array.from(atob(seg.data), c => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
      }
    }
  }, [stopElapsedTimer])

  function handlePlay() {
    setState('playing')
    currentSegRef.current = 0
    elapsedRef.current = 0
    setElapsed(0)
    startElapsedTimer()
    playNextSegment()
  }

  function handlePause() {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    audioRef.current?.pause()
    stopElapsedTimer()
    setState('paused')
  }

  function handleResume() {
    setState('playing')
    startElapsedTimer()
    audioRef.current?.play()
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progressPct = totalDuration > 0 ? Math.min((elapsed / totalDuration) * 100, 100) : 0
  const isActive = state === 'playing' || state === 'paused' || state === 'done'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#fafafa' }}>

      <button onClick={() => router.push('/onboarding')} style={{ position: 'absolute', top: '24px', left: '24px', background: 'none', border: 'none', fontSize: '13px', color: '#999', cursor: 'pointer' }}>
        ← Volver
      </button>

      {/* Loading */}
      {state === 'loading' && (
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px', color: '#111' }}>
            {STEPS[loadingStep].label}
          </p>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '32px' }}>
            Esto puede tomar unos segundos
          </p>
          <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${loadingPct}%`, height: '100%', background: '#111', borderRadius: '99px', transition: 'width 0.6s ease' }}/>
          </div>
          <p style={{ fontSize: '12px', color: '#bbb' }}>{loadingPct}%</p>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: '#cc0000', marginBottom: '16px' }}>{error}</p>
          <button onClick={generateSession} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Ready / Player */}
      {(state === 'ready' || isActive) && (
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>

          {/* Selector de voz — solo visible antes de iniciar */}
          {state === 'ready' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
              {(['female', 'male'] as const).map(v => (
                <button key={v} onClick={() => setVoice(v)} style={{
                  padding: '6px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer',
                  border: voice === v ? '2px solid #111' : '1.5px solid #ddd',
                  background: voice === v ? '#111' : '#fff',
                  color: voice === v ? '#fff' : '#666',
                }}>
                  {v === 'female' ? 'Femenina' : 'Masculina'}
                </button>
              ))}
            </div>
          )}

          <p style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>Tu sesión</p>
          <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>
            {OBJECTIVE_LABELS[profile?.answers.objective ?? ''] ?? 'Meditación'}
          </h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '40px' }}>
            {formatTime(totalDuration)} · {profile?.preferredTone}
          </p>

          <button
            onClick={
              state === 'ready' ? handlePlay :
              state === 'playing' ? handlePause :
              state === 'paused' ? handleResume :
              generateSession
            }
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}
          >
            {state === 'playing'
              ? <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              : state === 'done'
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
              : <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            }
          </button>

          <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '99px', marginBottom: '8px' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#111', borderRadius: '99px', transition: 'width 1s linear' }}/>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onEnded={playNextSegment}
      />
    </div>
  )
}
