// lib/questions.ts
// Definición completa de preguntas, tipos y lógica condicional del onboarding

export type QuestionId =
  | 'objective'
  | 'current_mood'
  | 'prior_experience'
  | 'practice_duration'
  | 'guidance_preference'
  | 'session_duration'

  | 'tone'
  | 'frequency'
  | 'personalization'

export interface Option {
  value: string
  label: string
}

export interface Question {
  id: QuestionId
  text: string
  options: Option[]
  // Si showIf está definido, la pregunta solo aparece si la condición se cumple
  showIf?: {
    questionId: QuestionId
    notValues: string[] // Ocultar si la respuesta anterior ES uno de estos valores
  }
}

export const QUESTIONS: Question[] = [
  {
    id: 'objective',
    text: '¿Cuál es tu objetivo principal ahora mismo?',
    options: [
      { value: 'sleep', label: 'Dormir mejor' },
      { value: 'anxiety', label: 'Reducir ansiedad' },
      { value: 'stress', label: 'Reducir estrés' },
      { value: 'focus', label: 'Mejorar concentración' },
      { value: 'emotional', label: 'Bienestar emocional' },
      { value: 'growth', label: 'Crecimiento personal' },
      { value: 'spiritual', label: 'Espiritualidad' },
      { value: 'other', label: 'Otro' },
    ],
  },
  {
    id: 'current_mood',
    text: '¿Cómo te has sentido en las últimas semanas?',
    options: [
      { value: 'calm', label: 'Tranquilo/a' },
      { value: 'stressed', label: 'Estresado/a' },
      { value: 'anxious', label: 'Ansioso/a' },
      { value: 'tired', label: 'Cansado/a' },
      { value: 'overwhelmed', label: 'Abrumado/a' },
      { value: 'unmotivated', label: 'Desmotivado/a' },
      { value: 'variable', label: 'Variable' },
    ],
  },
  {
    id: 'prior_experience',
    text: '¿Has practicado meditación antes?',
    options: [
      { value: 'never', label: 'Nunca' },
      { value: 'sometimes', label: 'Algunas veces' },
      { value: 'regularly', label: 'Regularmente' },
      { value: 'years', label: 'Durante años' },
    ],
  },
  {
    id: 'practice_duration',
    text: '¿Cuánto tiempo llevas practicando?',
    // Solo aparece si prior_experience NO es 'never'
    showIf: {
      questionId: 'prior_experience',
      notValues: ['never'],
    },
    options: [
      { value: 'lt3m', label: 'Menos de 3 meses' },
      { value: '3to12m', label: 'Entre 3 y 12 meses' },
      { value: '1to3y', label: 'Entre 1 y 3 años' },
      { value: 'gt3y', label: 'Más de 3 años' },
    ],
  },
  {
    id: 'guidance_preference',
    text: '¿Qué tipo de experiencia prefieres?',
    options: [
      { value: 'fully_guided', label: 'Totalmente guiada' },
      { value: 'partially_guided', label: 'Parcialmente guiada' },
      { value: 'occasional_silence', label: 'Silencios ocasionales' },
      { value: 'mostly_silent', label: 'Principalmente silenciosa' },
    ],
  },
  {
    id: 'session_duration',
    text: '¿Cuánto tiempo te gustaría meditar?',
    options: [
      { value: '3', label: '3 minutos' },
      { value: '5', label: '5 minutos' },
      { value: '10', label: '10 minutos' },
      { value: '20', label: '20 minutos' },
      { value: '30', label: '30 minutos o más' },
    ],
  },
  {
    id: 'tone',
    text: '¿Qué tono prefieres?',
    options: [
      { value: 'neutral', label: 'Neutral' },
      { value: 'spiritual', label: 'Espiritual' },
      { value: 'conversational', label: 'Conversacional' },
    ],
  },
  {
    id: 'frequency',
    text: '¿Con qué frecuencia te gustaría practicar?',
    options: [
      { value: 'occasionally', label: 'Ocasionalmente' },
      { value: 'weekly', label: 'Algunas veces por semana' },
      { value: 'daily', label: 'Diariamente' },
    ],
  },
  {
    id: 'personalization',
    text: '¿Prefieres recibir recomendaciones personalizadas?',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
  },
]

// Devuelve solo las preguntas que deben mostrarse dado el estado actual de respuestas
export function getVisibleQuestions(answers: Partial<Record<QuestionId, string>>): Question[] {
  return QUESTIONS.filter((q) => {
    if (!q.showIf) return true
    const dependsOn = answers[q.showIf.questionId]
    if (!dependsOn) return false
    return !q.showIf.notValues.includes(dependsOn)
  })
}

