import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const SIZE = 1080

const CARD_DATA: Record<string, {
  icon: string
  name: string
  phrase: string
  from: string
  to: string
}> = {
  'ach-6': {
    icon: '🌱',
    name: 'Jornada Iniciada',
    phrase: 'O primeiro passo da jornada mais importante da sua vida',
    from: '#15803d',
    to: '#4ade80',
  },
  'ach-7': {
    icon: '📚',
    name: 'Mamãe Bem\nInformada',
    phrase: 'Mamãe que se conhece chega muito mais preparada',
    from: '#6d28d9',
    to: '#a855f7',
  },
  'ach-1': {
    icon: '🎖️',
    name: 'Primeira Semana',
    phrase: 'Uma semana inteira cuidando de você e do seu bebê',
    from: '#be185d',
    to: '#f472b6',
  },
  'ach-2': {
    icon: '🏅',
    name: '30 Dias',
    phrase: 'Trinta dias de prática — seu corpo e seu bebê agradecem',
    from: '#9333ea',
    to: '#db2777',
  },
  'ach-3': {
    icon: '💪',
    name: 'Consistência',
    phrase: 'Dez dias de prática provam que você é consistente',
    from: '#7c3aed',
    to: '#ec4899',
  },
  'ach-4': {
    icon: '🗣️',
    name: 'Exploradora',
    phrase: 'Você faz parte da comunidade e inspira outras mamães',
    from: '#4c1d95',
    to: '#7c3aed',
  },
  'ach-5': {
    icon: '💬',
    name: 'Comunidade',
    phrase: 'Seu primeiro post marca o início de conexões especiais',
    from: '#7c3aed',
    to: '#db2777',
  },
  'ach-8': {
    icon: '🤱',
    name: 'Pronta para o Parto',
    phrase: 'Você estudou, se preparou e está pronta para o grande dia',
    from: '#9f1239',
    to: '#9333ea',
  },
}

const DEFAULT = CARD_DATA['ach-1']

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') ?? ''
  const data = CARD_DATA[id] ?? DEFAULT

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(145deg, ${data.from} 0%, ${data.to} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculo decorativo topo-direita */}
        <div
          style={{
            position: 'absolute',
            top: -160,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
          }}
        />
        {/* Círculo decorativo baixo-esquerda */}
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            left: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />
        {/* Círculo médio topo-esquerda */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
          }}
        />

        {/* Conteúdo central */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            zIndex: 1,
            padding: '0 80px',
          }}
        >
          {/* Label topo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 48,
                height: 2,
                background: 'rgba(255,255,255,0.5)',
                display: 'flex',
              }}
            />
            <span
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 6,
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
              }}
            >
              Conquista
            </span>
            <div
              style={{
                width: 48,
                height: 2,
                background: 'rgba(255,255,255,0.5)',
                display: 'flex',
              }}
            />
          </div>

          {/* Emoji grande */}
          <div
            style={{
              fontSize: 200,
              lineHeight: 1,
              marginBottom: 40,
              display: 'flex',
            }}
          >
            {data.icon}
          </div>

          {/* Nome da conquista */}
          <div
            style={{
              color: '#ffffff',
              fontSize: data.name.length > 18 ? 68 : 80,
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.1,
              marginBottom: 36,
              fontFamily: 'sans-serif',
              whiteSpace: 'pre-wrap',
            }}
          >
            {data.name}
          </div>

          {/* Frase */}
          <div
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: 34,
              fontWeight: 400,
              textAlign: 'center',
              lineHeight: 1.5,
              maxWidth: 820,
              fontFamily: 'sans-serif',
            }}
          >
            {data.phrase}
          </div>
        </div>

        {/* Branding rodapé */}
        <div
          style={{
            position: 'absolute',
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 80,
              height: 2,
              background: 'rgba(255,255,255,0.35)',
              display: 'flex',
              marginBottom: 12,
            }}
          />
          <span
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 26,
              fontWeight: 700,
              fontFamily: 'sans-serif',
              letterSpacing: 1,
            }}
          >
            Gestar em Movimento
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 20,
              fontFamily: 'sans-serif',
            }}
          >
            gestantes-app.vercel.app
          </span>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  )
}
