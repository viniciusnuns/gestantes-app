import { NextResponse } from 'next/server'
import { exercises } from '@/lib/data'

/**
 * GET /api/exercises/[id]
 *
 * Returns a single exercise by ID, including the `youtube_video_id` field
 * (which may be `null`/`undefined` for exercises without a video).
 *
 * Source: mock array in `lib/data.ts`. Future migration to Supabase will
 * keep the same API contract — only the data source changes.
 *
 * Responses:
 * - 200: Exercise JSON
 * - 404: `{ error: 'Exercício não encontrado' }`
 * - 500: `{ error: 'Erro interno do servidor' }`
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const exercise = exercises.find((ex) => ex.id === params.id)

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercício não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(exercise, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[/api/exercises/[id]] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
