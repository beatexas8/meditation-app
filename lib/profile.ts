// lib/profile.ts
// Tipo UserProfile y helpers de persistencia en localStorage (MVP)

import type { QuestionId } from './questions'
import type { MeditatorLevel, ExperienceMode } from './scoring'
import { computeLevel, computeRecommendedMode } from './scoring'

export interface UserProfile {
  // Respuestas crudas del onboarding
  answers: Partial<Record<QuestionId, string>>

  // Clasificación derivada
  level: MeditatorLevel
  recommendedMode: ExperienceMode

  // Preferencias de sesión
  preferredDuration: number          // minutos
  preferredLanguage: 'es' | 'en' | 'both'
  preferredTone: string
  wantsPersonalization: boolean

  // Metadata
  completedAt: string                // ISO date string
  sessionCount: number               // Para adaptar recomendaciones post-MVP
}

const STORAGE_KEY = 'mvp_user_profile'

export function buildProfile(answers: Partial<Record<QuestionId, string>>): UserProfile {
  const level = computeLevel(answers)
  const recommendedMode = computeRecommendedMode(level, answers)

  return {
    answers,
    level,
    recommendedMode,
    preferredDuration: parseInt(answers['session_duration'] ?? '10', 10),
    preferredLanguage: (answers['language'] as UserProfile['preferredLanguage']) ?? 'es',
    preferredTone: answers['tone'] ?? 'neutral',
    wantsPersonalization: answers['personalization'] === 'yes',
    completedAt: new Date().toISOString(),
    sessionCount: 0,
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function incrementSessionCount(): void {
  const profile = loadProfile()
  if (!profile) return
  profile.sessionCount += 1
  saveProfile(profile)
}
