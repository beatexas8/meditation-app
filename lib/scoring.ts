// lib/scoring.ts
// Motor de scoring: convierte respuestas del onboarding en nivel de meditador

import type { QuestionId } from './questions'

export type MeditatorLevel = 'beginner' | 'intermediate' | 'advanced'

export type ExperienceMode =
  | 'fully_guided'
  | 'semi_guided'
  | 'contemplative'
  | 'timer'
  | 'breathing'
  | 'soundscape'

// Mapa de nivel → modo de experiencia recomendado por defecto
const LEVEL_TO_MODE: Record<MeditatorLevel, ExperienceMode> = {
  beginner: 'fully_guided',
  intermediate: 'semi_guided',
  advanced: 'contemplative',
}

// Override por objetivo específico
const OBJECTIVE_MODE_OVERRIDE: Partial<Record<string, ExperienceMode>> = {
  sleep: 'fully_guided',
  anxiety: 'fully_guided',
  focus: 'soundscape',
}

export function computeLevel(answers: Partial<Record<QuestionId, string>>): MeditatorLevel {
  const experience = answers['prior_experience']
  const duration = answers['practice_duration']

  // Sin experiencia previa → principiante
  if (!experience || experience === 'never') return 'beginner'

  // Con experiencia pero sin duración registrada → intermedio por defecto
  if (!duration) return 'intermediate'

  // Mapeamos duración a nivel
  if (duration === 'lt3m') return 'beginner'
  if (duration === '3to12m') return 'intermediate'
  if (duration === '1to3y') return 'intermediate'
  if (duration === 'gt3y') return 'advanced'

  return 'intermediate'
}

export function computeRecommendedMode(
  level: MeditatorLevel,
  answers: Partial<Record<QuestionId, string>>
): ExperienceMode {
  // Si el usuario tiene preferencia explícita, respetarla
  const guidancePref = answers['guidance_preference']
  if (guidancePref) {
    const prefMap: Partial<Record<string, ExperienceMode>> = {
      fully_guided: 'fully_guided',
      partially_guided: 'semi_guided',
      occasional_silence: 'contemplative',
      mostly_silent: 'timer',
    }
    if (prefMap[guidancePref]) return prefMap[guidancePref]!
  }

  // Override por objetivo
  const objective = answers['objective']
  if (objective && OBJECTIVE_MODE_OVERRIDE[objective]) {
    return OBJECTIVE_MODE_OVERRIDE[objective]!
  }

  // Default por nivel
  return LEVEL_TO_MODE[level]
}
