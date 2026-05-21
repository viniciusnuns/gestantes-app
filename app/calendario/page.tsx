'use client'

import Link from 'next/link'
import { Baby, Heart, Sparkles, Lightbulb, ChevronRight } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import Card from '@/components/shared/Card'
import ProgressBar from '@/components/shared/ProgressBar'
import {
  currentUser,
  exercises,
  pregnancyCalendar,
  type Exercise,
} from '@/lib/data'
import { getTrimester } from '@/lib/utils'

type CalendarWeek = {
  baby: string
  body: string
  exercises: string[]
  tips: string[]
}

/** Pick the calendar entry closest to the user's current week. */
function getCalendarFor(week: number): { weekShown: number; data: CalendarWeek } {
  const entries = Object.entries(pregnancyCalendar) as [
    string,
    CalendarWeek
  ][]
  const weeks = entries.map(([key, data]) => ({
    week: parseInt(key.replace('week', ''), 10),
    data,
  }))
  // Closest week (preferring <= user's week if available)
  const sorted = [...weeks].sort(
    (a, b) => Math.abs(a.week - week) - Math.abs(b.week - week)
  )
  const closest = sorted[0]
  return { weekShown: closest.week, data: closest.data }
}

// strip combining diacritical marks (Unicode block U+0300..U+036F)
const DIACRITICS_RE = new RegExp(
  '[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']',
  'g'
)

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function findExerciseByIdSlug(slug: string): Exercise | undefined {
  // The calendar uses ids like "mobilidade-pelvica"; match by slugified name.
  return exercises.find((ex) => slugify(ex.name) === slug)
}

export default function CalendarPage() {
  const { weekShown, data } = getCalendarFor(currentUser.week)
  const trimester = getTrimester(currentUser.week)
  const progressPct = (currentUser.week / 40) * 100
  const daysLeft = (40 - currentUser.week) * 7

  const suggestedExercises = data.exercises
    .map((slug) => findExerciseByIdSlug(slug))
    .filter((e): e is Exercise => Boolean(e))

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="gradient-secondary text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs opacity-90 uppercase tracking-wider">
            Calendário gestacional
          </p>
          <h1 className="text-3xl font-bold mt-1">
            {currentUser.week}ª semana
          </h1>
          <p className="text-sm opacity-90 mt-1">
            {trimester} trimestre · {daysLeft} dias até o parto
          </p>

          <div className="mt-4">
            <ProgressBar
              value={progressPct}
              variant="accent"
              trackClassName="bg-white/30"
              fillClassName="bg-white"
            />
            <div className="flex justify-between text-[11px] mt-1.5 opacity-90">
              <span>1ª semana</span>
              <span>40ª semana</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 -mt-6 space-y-4">
        {weekShown !== currentUser.week && (
          <p className="text-[11px] text-text-light text-center -mb-1">
            Mostrando informações da semana {weekShown} (a mais próxima cadastrada)
          </p>
        )}

        {/* Baby section */}
        <Card className="!p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center">
              <Baby size={18} />
            </div>
            <h2 className="font-semibold text-text-primary">Seu bebê</h2>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">
            {data.baby}
          </p>
        </Card>

        {/* Body section */}
        <Card className="!p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-secondary-100 text-secondary-500 flex items-center justify-center">
              <Heart size={18} />
            </div>
            <h2 className="font-semibold text-text-primary">Seu corpo</h2>
          </div>
          <p className="text-sm text-text-primary leading-relaxed">
            {data.body}
          </p>
        </Card>

        {/* Suggested Exercises */}
        {suggestedExercises.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles size={16} className="text-accent-500" />
              <h2 className="font-semibold text-text-primary">
                Exercícios sugeridos para esta semana
              </h2>
            </div>
            <div className="space-y-2">
              {suggestedExercises.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/biblioteca/${ex.id}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-warm-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.image}
                    alt={ex.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-text-primary truncate">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {ex.duration} min · {ex.category.replace('-', ' ')}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-text-light" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tips */}
        {data.tips.length > 0 && (
          <Card className="!p-5 bg-accent-50 border-accent-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-accent-200 text-accent-700 flex items-center justify-center">
                <Lightbulb size={18} />
              </div>
              <h2 className="font-semibold text-accent-900">
                Dicas para esta semana
              </h2>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, idx) => (
                <li key={idx} className="flex gap-2 text-sm text-text-primary">
                  <span className="text-accent-500 font-bold">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
