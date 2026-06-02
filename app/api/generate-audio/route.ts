import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const VOICE_MALE = process.env.ELEVENLABS_VOICE_MALE!
const VOICE_FEMALE = process.env.ELEVENLABS_VOICE_FEMALE!

async function textToSpeech(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      speed: 0.75,
      voice_settings: {
        stability: 0.45,
        similarity_boost: 0.75,
        style: 0.35,
        use_speaker_boost: true,
      },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs error: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

function generateSilenceWav(seconds: number): Buffer {
  const sampleRate = 44100
  const numChannels = 1
  const bitsPerSample = 16
  const numSamples = Math.floor(sampleRate * seconds)
  const dataSize = numSamples * numChannels * (bitsPerSample / 8)
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(numChannels, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28)
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32)
  buffer.writeUInt16LE(bitsPerSample, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)
  return buffer
}

export async function POST(req: NextRequest) {
  try {
    const { script, voice } = await req.json()
    const voiceId = voice === 'male' ? VOICE_MALE : VOICE_FEMALE
    const parts = script.split(/(\[pausa \d+s\])/g).filter((p: string) => p.trim())
    const segments = []

    for (const part of parts) {
      const pauseMatch = part.trim().match(/\[pausa (\d+)s\]/)
      if (pauseMatch) {
        const seconds = parseInt(pauseMatch[1])
        const wav = generateSilenceWav(seconds)
        segments.push({ type: 'silence', data: wav.toString('base64'), seconds })
      } else if (part.trim().length > 0) {
        const buf = await textToSpeech(part.trim(), voiceId)
        segments.push({ type: 'audio', data: buf.toString('base64') })
      }
    }

    return NextResponse.json({ segments })
  } catch (error) {
    console.error('Error generating audio:', error)
    return NextResponse.json({ error: 'Error generando audio' }, { status: 500 })
  }
}
