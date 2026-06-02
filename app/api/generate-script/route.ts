import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { level, objective, mood, tone, duration, mode } = await req.json()

    const prompt = `Eres un guia de meditacion experto formado en las metodologias de Jon Kabat-Zinn (MBSR), Tara Brach (RAIN) y Andy Puddicombe (Headspace). Genera un script de meditacion en español con estas caracteristicas:

- Nivel del usuario: ${level}
- Objetivo: ${objective}
- Estado emocional actual: ${mood}
- Tono: ${tone}
- Duracion aproximada: ${duration} minutos
- Modo: ${mode}

REGLAS DEL SCRIPT:
- Escribe solo el texto que se va a narrar en voz alta
- Cada frase debe ser corta, maximo 10 palabras
- Nunca des dos instrucciones seguidas sin pausa entre ellas
- El usuario debe tener tiempo real de ejecutar cada instruccion antes de continuar
- No incluyas titulos, numeracion ni explicaciones
- Solo el script listo para narrar

TABLA DE PAUSAS OBLIGATORIA (basada en Jon Kabat-Zinn, Tara Brach y tecnicas 4-7-8 y box breathing):

INSTRUCCIONES DE APERTURA:
- Cierra los ojos lentamente -> [pausa 4s]
- Encuentra una posicion comoda -> [pausa 5s]
- Siente el contacto de tu cuerpo con la superficie -> [pausa 6s]

INSTRUCCIONES DE RESPIRACION:
- Inhala profundo por la nariz -> [pausa 5s]
- Reten el aire -> [pausa 5s]
- Exhala lentamente por la boca -> [pausa 9s]
- Respira naturalmente -> [pausa 8s]

INSTRUCCIONES DE SENSACION CORPORAL:
- Relaja los hombros -> [pausa 5s]
- Siente el peso de tu cuerpo -> [pausa 7s]
- Escanea tu cuerpo de cabeza a pies -> [pausa 12s]
- Observa donde sientes tension -> [pausa 10s]

INSTRUCCIONES DE OBSERVACION MENTAL:
- Observa tus pensamientos sin juzgar -> [pausa 12s]
- Deja ir cualquier pensamiento -> [pausa 10s]
- Regresa tu atencion a la respiracion -> [pausa 8s]

SILENCIOS CONTEMPLATIVOS:
- Despues de una instruccion importante -> [pausa 10s]
- Momento de presencia pura -> [pausa 15s]
- Cierre de la sesion -> [pausa 8s]

MODOS:
- fully_guided: narracion continua con pausas segun tabla
- semi_guided: menos texto, pausas mas largas
- contemplative: introduccion breve, silencios de 15s o mas

TONOS:
- neutral: claro y directo, sin misticismo
- spiritual: referencias a energia, presencia, conexion interior
- conversational: cercano, como si fuera un amigo guiando`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const script = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ script })
  } catch (error) {
    console.error('Error generating script:', error)
    return NextResponse.json({ error: 'Error generando el script' }, { status: 500 })
  }
}
