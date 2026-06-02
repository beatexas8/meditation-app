'use client'
// app/onboarding/page.tsx
// Orquesta el flujo completo del onboarding: quiz → perfil → sesión

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { QuestionId } from '@/lib/questions'
import { getVisibleQuestions } from '@/lib/questions'
import { buildProfile, saveProfile } from '@/lib/profile'
import QuizStep from '@/components/QuizStep'
import ProfileSummary from '@/components/ProfileSummary'
import type { UserProfile } from '@/lib/profile'

export default function OnboardingPage() {
  const router = useRouter()

  // Respuestas acumuladas del usuario
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({})

  // Índice de la pregunta visible actual
  const [stepIndex, setStepIndex] = useState(0)

  // Perfil generado al completar el quiz
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Preguntas visibles dado el estado actual de respuestas
  const visibleQuestions = getVisibleQuestions(answers)
  const currentQuestion = visibleQuestions[stepIndex]

  const handleSelect = useCallback((value: string) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (!currentQuestion) return
    const isLast = stepIndex === visibleQuestions.length - 1

    if (isLast) {
      // Calcular perfil y mostrar resumen
      const newProfile = buildProfile(answers)
      saveProfile(newProfile)
      setProfile(newProfile)
    } else {
      setStepIndex((i) => i + 1)
    }
  }, [currentQuestion, stepIndex, visibleQuestions.length, answers])

  const handleBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleStart = useCallback(() => {
    // Ir al player (Fase 4). Por ahora redirige a /session
    router.push('/session')
  }, [router])

  // Vista: resumen de perfil
  if (profile) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}>
        <ProfileSummary profile={profile} onStart={handleStart} />
      </main>
    )
  }

  // Vista: pregunta actual
  if (!currentQuestion) return null

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center' }}>
      <QuizStep
        question={currentQuestion}
        currentIndex={stepIndex}
        totalVisible={visibleQuestions.length}
        selected={answers[currentQuestion.id]}
        onSelect={handleSelect}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={stepIndex === 0}
        isLast={stepIndex === visibleQuestions.length - 1}
      />
    </main>
  )
}
