'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/customAuth'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getPatientDetails } from '@/lib/therapist'
import { formatDateWithTimezoneBR, formatDateTimeWithTimezoneBR } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface PatientDetail {
  user: {
    id: string
    email: string
    name: string
    week: number
    phone?: string
    healthyPregnancy: boolean
    hadIntercurrence: boolean
    doctorApproved: boolean
    objectives: string[]
    discomforts: string[]
    createdAt: string
    updatedAt: string
  }
  activities: Array<{
    id: string
    userId: string
    exerciseId: string
    exerciseName: string
    completedAt: string
    durationMinutes?: number
  }>
  progress: {
    userId: string
    points: number
    activeDays: number
    currentStreak: number
    totalExercises: number
  }
}

const objectiveLabels: Record<string, string> = {
  'preparar-para-parto': 'Preparação para Parto',
  'aliviar-desconfortos': 'Aliviar Desconfortos',
  'manter-saude': 'Manter Saúde',
  'fortalecer-musculatura': 'Fortalecer Musculatura'
}

const discomfortLabels: Record<string, string> = {
  'dor-lombar': 'Dor Lombar',
  'inchaço': 'Inchaço',
  'fadiga': 'Fadiga',
  'insonia': 'Insônia',
  'azia': 'Azia',
  'falta-ar': 'Falta de Ar'
}

export default function PatientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const patientId = params.id as string

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [testimonials, setTestimonials] = useState<Array<{
    id: string
    type: string
    score: number
    testimonial: string | null
    created_at: string
  }>>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (!currentUser) {
      router.push('/dashboard')
      return
    }
  }, [router])

  useEffect(() => {
    if (!user) return

    const loadPatient = async () => {
      try {
        setLoading(true)
        const data = await getPatientDetails(patientId)
        setPatient(data)
      } catch (error) {
        console.error('Erro ao carregar detalhes do paciente:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadPatient()
  }, [user, patientId, router])

  useEffect(() => {
    if (!patientId) return
    supabase
      .from('user_testimonials')
      .select('id, type, score, testimonial, created_at')
      .eq('user_id', patientId)
      .not('testimonial', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTestimonials(data)
      })
  }, [patientId])

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary">Carregando dados da paciente...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-text-secondary mb-4">Paciente não encontrada</p>
        <Link href="/dashboard" className="text-primary-300 font-semibold hover:text-primary-400">
          ← Voltar ao Painel
        </Link>
      </div>
    )
  }

  const getHealthStatus = () => {
    if (!patient.user.healthyPregnancy) return 'Gestação não saudável'
    if (patient.user.hadIntercurrence) return 'Com intercorrências'
    if (!patient.user.doctorApproved) return 'Pendente aprovação médica'
    return 'Gestação saudável'
  }

  const getStatusColor = () => {
    if (!patient.user.healthyPregnancy || !patient.user.doctorApproved) return 'bg-red-50 border-red-200'
    if (patient.user.hadIntercurrence) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const getStatusTextColor = () => {
    if (!patient.user.healthyPregnancy || !patient.user.doctorApproved) return 'text-red-700'
    if (patient.user.hadIntercurrence) return 'text-yellow-700'
    return 'text-green-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/40 via-warm-50 to-secondary-50/30">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-primary-300 font-semibold hover:text-primary-400 flex items-center gap-2"
          >
            ← Voltar ao Painel
          </Link>
          <h1 className="text-3xl font-bold text-text-primary text-center flex-1">{patient.user.name}</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Status Card */}
            <div className={`${getStatusColor()} border rounded-2xl p-8`}>
              <h2 className="text-2xl font-bold text-text-primary mb-4">Status de Saúde</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Gestação</span>
                  <span className={`${getStatusTextColor()} font-semibold text-lg`}>
                    {getHealthStatus()}
                  </span>
                </div>
                <div className="h-px bg-white/20"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Gestação Saudável</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {patient.user.healthyPregnancy ? '✓' : '✗'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Intercorrências</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {patient.user.hadIntercurrence ? '✓' : '✗'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Aprovação Médica</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {patient.user.doctorApproved ? '✓' : '✗'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Details */}
            <div className="bg-white rounded-2xl p-8 border border-warm-100">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Informações de Contato</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-secondary mb-1">Email</p>
                  <p className="text-lg text-text-primary">{patient.user.email}</p>
                </div>
                {patient.user.phone && (
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Telefone</p>
                    <p className="text-lg text-text-primary">{patient.user.phone}</p>
                  </div>
                )}
                <div className="h-px bg-warm-100 my-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Semana de Gestação</p>
                    <p className="text-3xl font-bold text-primary-300">{patient.user.week}ª</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Membro Desde</p>
                    <p className="text-lg text-text-primary">
                      {formatDateWithTimezoneBR(patient.user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-2xl p-8 border border-warm-100">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Objetivos</h2>
              <div className="flex flex-wrap gap-3">
                {patient.user.objectives.length > 0 ? (
                  patient.user.objectives.map(obj => (
                    <span
                      key={obj}
                      className="bg-primary-50 text-primary-300 px-4 py-2 rounded-full font-semibold border border-primary-200"
                    >
                      {objectiveLabels[obj] || obj}
                    </span>
                  ))
                ) : (
                  <p className="text-text-secondary">Nenhum objetivo registrado</p>
                )}
              </div>
            </div>

            {/* Discomforts */}
            <div className="bg-white rounded-2xl p-8 border border-warm-100">
              <h2 className="text-2xl font-bold text-text-primary mb-4">Desconfortos Relatados</h2>
              <div className="flex flex-wrap gap-3">
                {patient.user.discomforts.length > 0 ? (
                  patient.user.discomforts.map(discomfort => (
                    <span
                      key={discomfort}
                      className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full font-semibold border border-yellow-200"
                    >
                      {discomfortLabels[discomfort] || discomfort}
                    </span>
                  ))
                ) : (
                  <p className="text-text-secondary">Nenhum desconforto relatado</p>
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl p-8 border border-warm-100">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Histórico de Atividades</h2>
              {patient.activities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {patient.activities.map(activity => (
                    <div key={activity.id} className="border border-warm-100 rounded-lg p-4 hover:bg-warm-50 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-text-primary">{activity.exerciseName}</p>
                          <p className="text-sm text-text-secondary">
                            {formatDateTimeWithTimezoneBR(activity.completedAt)}
                          </p>
                        </div>
                        {activity.durationMinutes && (
                          <span className="bg-primary-50 text-primary-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {activity.durationMinutes}min
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary">Nenhuma atividade registrada</p>
              )}
            </div>
          </div>

          {/* Sidebar - Progress Metrics */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-2xl p-8 border border-warm-100 sticky top-24">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Progresso</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-text-secondary font-semibold">Pontos</p>
                    <p className="text-4xl font-bold text-primary-300">{patient.progress.points}</p>
                  </div>
                  <div className="bg-warm-100 rounded-full h-2"></div>
                </div>

                <div className="h-px bg-warm-100"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-text-secondary mb-2">Dias Ativos</p>
                    <p className="text-3xl font-bold text-primary-300">{patient.progress.activeDays}</p>
                  </div>

                  <div className="bg-secondary-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-text-secondary mb-2">Sequência</p>
                    <p className="text-3xl font-bold text-secondary-300">{patient.progress.currentStreak}</p>
                  </div>
                </div>

                <div className="h-px bg-warm-100"></div>

                <div className="bg-accent-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-text-secondary mb-2">Exercícios Totais</p>
                  <p className="text-3xl font-bold text-accent-300">{patient.progress.totalExercises}</p>
                </div>
              </div>
            </div>

            {/* Testimonials Card */}
            {testimonials.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-warm-100">
                <h2 className="text-xl font-bold text-text-primary mb-4">💜 Depoimentos</h2>
                <div className="space-y-4">
                  {testimonials.map((t) => (
                    <div key={t.id} className="border border-warm-100 rounded-xl p-4 bg-primary-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase text-text-light tracking-wide">
                          {t.type === 'nps' ? 'NPS' : '⭐ Avaliação'}
                        </span>
                        <span className="text-sm font-bold text-primary-400">
                          {t.type === 'nps' ? `${t.score}/10` : `${t.score}/5 estrelas`}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary italic leading-relaxed">
                        &ldquo;{t.testimonial}&rdquo;
                      </p>
                      <p className="text-[11px] text-text-light mt-2">
                        {formatDateWithTimezoneBR(t.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
