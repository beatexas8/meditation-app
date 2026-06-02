'use client'
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
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({})
  const [stepIndex, setStepIndex] = useState(0)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const visibleQuestions = getVisibleQuestions(answers)
  const currentQuestion = visibleQuestions[stepIndex]

  const handleSelect = useCallback((value: string) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (!currentQuestion) return
    if (stepIndex === visibleQuestions.length - 1) {
      const p = buildProfile(answers)
      saveProfile(p)
      setProfile(p)
    } else {
      setStepIndex((i) => i + 1)
    }
  }, [currentQuestion, stepIndex, visibleQuestions.length, answers])

  const handleBack = useCallback(() => setStepIndex((i) => Math.max(0, i - 1)), [])
  const handleStart = useCallback(() => router.push('/session'), [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {profile
        ? <ProfileSummary profile={profile} onStart={handleStart} />
        : currentQuestion
          ? <QuizStep
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
          : null
      }
    </div>
  )
}
