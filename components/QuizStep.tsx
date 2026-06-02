'use client'
import { useState, useEffect } from 'react'
import type { Question } from '@/lib/questions'
import ProgressBar from './ProgressBar'
import OptionButton from './OptionButton'

interface QuizStepProps {
  question: Question
  currentIndex: number
  totalVisible: number
  selected: string | undefined
  onSelect: (value: string) => void
  onNext: () => void
  onBack: () => void
  isFirst: boolean
  isLast: boolean
}

export default function QuizStep({ question, currentIndex, totalVisible, selected, onSelect, onNext, onBack, isFirst, isLast }: QuizStepProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [question.id])

  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    }}>

      {/* ZONA 1: Header fijo — progress + contador + pregunta */}
      <div style={{ flexShrink: 0 }}>
        <ProgressBar current={currentIndex + 1} total={totalVisible} />
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
          {currentIndex + 1} / {totalVisible}
        </p>
        <h2 style={{
          fontSize: '22px', fontWeight: 600, lineHeight: 1.3,
          marginBottom: '24px', color: '#111',
          minHeight: '64px',
        }}>
          {question.text}
        </h2>
      </div>

      {/* ZONA 2: Opciones — crece para ocupar espacio disponible */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {question.options.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            selected={selected === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>

      {/* ZONA 3: Botones — siempre al fondo */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '20px',
        paddingBottom: '24px',
        borderTop: '1px solid #f0f0f0',
        marginTop: '16px',
      }}>
        {!isFirst
          ? <button onClick={onBack} style={{
              background: 'none', border: '1.5px solid #ddd', borderRadius: '8px',
              padding: '10px 20px', fontSize: '14px', color: '#666', cursor: 'pointer',
            }}>Atrás</button>
          : <span />
        }
        <button
          onClick={onNext}
          disabled={!selected}
          style={{
            background: selected ? '#111' : '#eee',
            color: selected ? '#fff' : '#aaa',
            border: 'none', borderRadius: '8px',
            padding: '10px 28px', fontSize: '14px', fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
          }}
        >{isLast ? 'Comenzar' : 'Continuar'}</button>
      </div>

    </div>
  )
}
