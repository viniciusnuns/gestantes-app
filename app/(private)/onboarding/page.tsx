'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, customSignOut } from '@/lib/customAuth'
import { saveOnboardingData } from '@/lib/onboarding'
import { supabase } from '@/lib/supabase'

const BETA_ACCESS_CODE = 'MAESAUDAVEL30'

// Onboarding screens
const screens = [
  {
    step: 1,
    title: 'Código de Acesso',
    subtitle: 'Este app está em fase beta. Insira seu código para continuar.',
    type: 'access-code'
  },
  {
    step: 2,
    title: 'Boas-vindas',
    subtitle: 'Seu corpo muda a cada semana. Vamos acompanhar essa jornada juntas.',
    type: 'welcome'
  },
  {
    step: 3,
    title: 'Dados da gestação',
    subtitle: 'Nos conte um pouco sobre você',
    type: 'pregnancy-data'
  },
  {
    step: 4,
    title: 'Seus contatos',
    subtitle: 'Para entrarmos em contato quando necessário',
    type: 'contact'
  },
  {
    step: 5,
    title: 'Informações médicas',
    subtitle: 'Nos ajude a entender sua saúde',
    type: 'health'
  },
  {
    step: 6,
    title: 'Seus objetivos',
    subtitle: 'Selecione os que mais importam',
    type: 'objectives'
  },
  {
    step: 7,
    title: 'Desconfortos atuais',
    subtitle: 'Isso nos ajuda a personalizar suas aulas',
    type: 'discomforts'
  },
  {
    step: 8,
    title: 'Termos de Uso',
    subtitle: 'Leia e aceite nossos termos antes de começar',
    type: 'terms'
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)
  const [formData, setFormData] = useState({
    accessCode: '',
    name: '',
    weekAtRegistration: 20,
    estimatedDueDate: '',
    firstPregnancy: true,
    email: '',
    phone: '',
    healthyPregnancy: true,
    hadIntercurrence: false,
    doctorApproved: true,
    objectives: ['preparar-para-parto'],
    discomforts: ['dor-lombar'],
    termsAccepted: false
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (currentUser?.email) {
      setFormData(prev => ({ ...prev, email: currentUser.email }))
    }
  }, [])

  const validateFormData = () => {
    const missingFields = []

    if (!formData.name?.trim()) missingFields.push('- Nome completo')
    if (!formData.weekAtRegistration || formData.weekAtRegistration < 1 || formData.weekAtRegistration > 40) missingFields.push('- Semana de gestação (1-40)')
    // Email é preenchido automaticamente da sessão
    // if (!formData.email?.trim()) missingFields.push('- Email')
    if (!formData.phone?.trim()) missingFields.push('- Telefone')

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `❌ CAMPOS OBRIGATÓRIOS FALTANDO:\n\n${missingFields.join('\n')}\n\nPor favor, preencha todos os campos antes de salvar.`
      }
    }

    // Validate terms acceptance
    if (!formData.termsAccepted) {
      return {
        valid: false,
        message: '❌ OBRIGATÓRIO:\n\nVocê precisa aceitar os Termos de Uso para continuar.\n\nLeia os termos completos em "Ver termos completos".'
      }
    }

    return { valid: true }
  }

  const handleNext = async () => {
    // Validate access code before proceeding from first step
    if (screen.type === 'access-code') {
      if (formData.accessCode.trim().toUpperCase() !== BETA_ACCESS_CODE) {
        setCodeError('Código inválido. Verifique e tente novamente.')
        return
      }

      setValidatingCode(true)
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'beta')
      setValidatingCode(false)

      if ((count ?? 0) >= 31) {
        setCodeError('As vagas para o beta estão esgotadas. Entre em contato com nossa equipe para mais informações.')
        return
      }

      setCodeError('')
    }

    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const validation = validateFormData()
      if (!validation.valid) {
        alert(validation.message)
        return
      }

      if (!formData.email && user?.email) {
        formData.email = user.email
      }

      if (user?.id) {
        setSaving(true)
        try {
          const { success, error } = await saveOnboardingData(user.id, {
            ...formData,
            userType: formData.accessCode.trim().toUpperCase() === BETA_ACCESS_CODE ? 'beta' : 'patient',
          })
          console.log('[Onboarding] saveOnboardingData returned - success:', success, 'error:', error)
          setSaving(false)

          if (success) {
            // Notificação de boas-vindas — dispara em background, não bloqueia navegação
            const userName = formData.name?.split(' ')[0] || 'mamãe'
            fetch('/api/push', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                title: 'Bem-vinda ao Gestar em Movimento! 🌸',
                message: `Olá, ${userName}! Seu primeiro exercício está esperando por você.`,
                url: '/home',
              }),
            }).catch(() => {}) // Silencioso se OneSignal ainda não registrou o dispositivo

            router.push('/home')
          } else {
            const errorMsg = error?.message || error?.toString?.() || 'Erro desconhecido ao salvar'
            alert(`❌ ERRO AO SALVAR:

${errorMsg}

Verifique sua conexão e tente novamente.`)
          }
        } catch (err: any) {
          setSaving(false)
          const errorMsg = err?.message || err?.toString?.() || 'Erro desconhecido'
          alert(`❌ ERRO GERAL:\n\n${errorMsg}`)
        }
      } else {
        alert('❌ ERRO: Nenhum usuário encontrado. Faça login novamente.')
      }
    }
  }

  const handleObjectiveChange = (objective: string) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.includes(objective)
        ? formData.objectives.filter(o => o !== objective)
        : [...formData.objectives, objective]
    })
  }

  const handleDiscomfortChange = (discomfort: string) => {
    setFormData({
      ...formData,
      discomforts: formData.discomforts.includes(discomfort)
        ? formData.discomforts.filter(d => d !== discomfort)
        : [...formData.discomforts, discomfort]
    })
  }

  const screen = screens[currentStep]

  if (completed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 via-warm-50 to-accent-100/20 pointer-events-none"></div>

        <div className="relative text-center space-y-8">
          <div className="text-7xl animate-bounce">✨</div>
          <h1 className="text-4xl font-bold text-text-primary">Pronto!</h1>
          <div className="space-y-3">
            <p className="text-xl text-text-secondary font-medium">Criamos sua jornada personalizada</p>
            <p className="text-base text-text-secondary">Você está pronta para começar essa transformação? 🤰</p>
          </div>

          <button
            onClick={() => {
              router.push('/home')
            }}
            className="mt-12 bg-gradient-to-r from-primary-300 to-secondary-300 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Começar Agora →
          </button>

          <button
            onClick={() => {
              customSignOut()
              router.push('/login')
            }}
            className="mt-4 text-primary-300 font-semibold hover:text-primary-400"
          >
            Sair da conta
          </button>

          <p className="text-sm text-text-secondary/60 mt-8">Sua primeira prática está esperando 💚</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/40 via-warm-50 to-secondary-50/30 pointer-events-none"></div>

      {/* Header with progress */}
      <div className="relative bg-white border-b border-warm-200 p-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-sm text-text-secondary">Passo {currentStep + 1} de {screens.length}</div>
          <div className="w-full bg-warm-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-300 to-secondary-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / screens.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">

          {/* Access Code Screen */}
          {screen.type === 'access-code' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div className="text-center space-y-3">
                <div className="text-5xl">🔐</div>
                <h2 className="text-3xl font-bold text-text-primary">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-text-primary">Seu código de acesso</label>
                <input
                  type="text"
                  placeholder="Digite seu código"
                  value={formData.accessCode}
                  onChange={(e) => {
                    setFormData({ ...formData, accessCode: e.target.value })
                    setCodeError('')
                  }}
                  className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg tracking-widest uppercase"
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                {codeError && (
                  <p className="text-sm text-red-500 font-medium">{codeError}</p>
                )}
                <p className="text-xs text-text-secondary">
                  Não tem um código? Entre em contato com nossa equipe para solicitar acesso.
                </p>
              </div>
              <button
                onClick={handleNext}
                disabled={validatingCode}
                className="w-full bg-gradient-to-r from-primary-300 to-secondary-300 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingCode ? '⏳ Verificando...' : 'Continuar →'}
              </button>
            </div>
          )}

          {/* Welcome Screen */}
          {screen.type === 'welcome' && (
            <div className="text-center space-y-8 w-full">
              <div className="space-y-6 bg-gradient-to-br from-primary-300 via-secondary-300 to-accent-300 rounded-3xl p-12 text-white shadow-xl">
                <div className="space-y-4">
                  <div className="flex justify-center px-2">
                    <img
                      src="/pregnant-yoga.webp"
                      alt="Mulher grávida fazendo yoga com alegria"
                      className="h-80 w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
                    Gestar em Movimento
                  </h1>
                  <p className="text-xl md:text-2xl text-white/95 font-medium leading-relaxed drop-shadow-md">
                    {screen.subtitle}
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  className="mt-8 bg-white text-primary-300 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                >
                  Começar →
                </button>
              </div>
            </div>
          )}

          {/* Pregnancy Data */}
          {screen.type === 'pregnancy-data' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">Como você se chama? 👋</label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">Quantas semanas está grávida agora? ⏳</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.weekAtRegistration}
                    onChange={(e) => setFormData({...formData, weekAtRegistration: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
                  <p className="text-xs text-text-secondary mt-2">Ela vai aumentar automaticamente a cada semana 📅</p>
                </div>
                <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl hover:bg-primary-50 transition-colors border border-warm-100">
                  <input
                    type="checkbox"
                    checked={formData.firstPregnancy}
                    onChange={(e) => setFormData({...formData, firstPregnancy: e.target.checked})}
                    className="w-5 h-5 accent-primary-300"
                  />
                  <span className="text-base text-text-primary font-medium">É sua primeira gestação?</span>
                </label>
              </div>
            </div>
          )}

          {/* Contact */}
          {screen.type === 'contact' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">E-mail 📧</label>
                  <div className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl bg-warm-50 text-lg text-text-primary flex items-center">
                    ✓ {user?.email}
                  </div>
                  <p className="text-xs text-text-secondary mt-2">Email confirmado na sua conta</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-3">WhatsApp ou Telefone 📱</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Health Information */}
          {screen.type === 'health' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Sua gestação está saudável? 💚</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({...formData, healthyPregnancy: true})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        formData.healthyPregnancy
                          ? 'bg-primary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Sim 👍
                    </button>
                    <button
                      onClick={() => setFormData({...formData, healthyPregnancy: false})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        !formData.healthyPregnancy
                          ? 'bg-secondary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Não 👎
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Você teve alguma intercorrência até hoje? 🏥</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({...formData, hadIntercurrence: false})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        !formData.hadIntercurrence
                          ? 'bg-primary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Não 👍
                    </button>
                    <button
                      onClick={() => setFormData({...formData, hadIntercurrence: true})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        formData.hadIntercurrence
                          ? 'bg-secondary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Sim ⚠️
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-text-primary">Seu médico te liberou para atividade física? ✅</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormData({...formData, doctorApproved: true})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        formData.doctorApproved
                          ? 'bg-primary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Sim ✅
                    </button>
                    <button
                      onClick={() => setFormData({...formData, doctorApproved: false})}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                        !formData.doctorApproved
                          ? 'bg-secondary-300 text-white shadow-md'
                          : 'bg-warm-100 text-text-primary hover:bg-warm-200'
                      }`}
                    >
                      Não 🚫
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Objectives */}
          {screen.type === 'objectives' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'aliviar-dores', label: '🩹 Aliviar dores' },
                  { id: 'preparar-para-parto', label: '🤰 Preparar para o parto' },
                  { id: 'mobilidade', label: '🧘 Mobilidade' },
                  { id: 'reduzir-ansiedade', label: '🧠 Reduzir ansiedade' },
                  { id: 'assoalho-pelvico', label: '💪 Assoalho pélvico' },
                  { id: 'manter-atividade', label: '🏃 Manter atividade física' },
                ].map(obj => (
                  <label key={obj.id} className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl transition-all border-2 ${
                    formData.objectives.includes(obj.id)
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-warm-100 hover:bg-warm-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.objectives.includes(obj.id)}
                      onChange={() => handleObjectiveChange(obj.id)}
                      className="w-5 h-5 accent-primary-300"
                    />
                    <span className="text-base text-text-primary font-medium">{obj.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Discomforts */}
          {screen.type === 'discomforts' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'dor-lombar', label: '🔴 Dor lombar' },
                  { id: 'dor-pelvica', label: '🔴 Dor pélvica' },
                  { id: 'falta-ar', label: '😮‍💨 Falta de ar' },
                  { id: 'inchaço', label: '💧 Inchaço' },
                  { id: 'constipacao', label: '🚽 Constipação' },
                  { id: 'insonia', label: '😴 Insônia' },
                ].map(dis => (
                  <label key={dis.id} className={`flex items-center space-x-3 cursor-pointer p-4 rounded-xl transition-all border-2 ${
                    formData.discomforts.includes(dis.id)
                      ? 'border-accent-300 bg-accent-50'
                      : 'border-warm-100 hover:bg-warm-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.discomforts.includes(dis.id)}
                      onChange={() => handleDiscomfortChange(dis.id)}
                      className="w-5 h-5 accent-accent-300"
                    />
                    <span className="text-base text-text-primary font-medium">{dis.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Terms Acceptance */}
          {screen.type === 'terms' && (
            <div className="space-y-6 bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{screen.title}</h2>
                <p className="text-text-secondary">{screen.subtitle}</p>
              </div>

              <div className="bg-accent-50 border-l-4 border-accent-600 p-4 rounded space-y-2">
                <p className="text-sm font-semibold text-accent-700">⚠️ Importante</p>
                <p className="text-sm text-text-primary leading-relaxed">
                  Gestar em Movimento é um aplicativo <strong>educativo</strong> e de promoção de saúde.
                  <strong>NÃO substitui</strong> avaliação médica ou acompanhamento profissional.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: formData.termsAccepted ? '#9b87f5' : '#e8d7f1',
                    backgroundColor: formData.termsAccepted ? '#f3f0ff' : '#faf7ff'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                    className="w-5 h-5 accent-primary-300 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-base text-text-primary font-medium block">
                      Li e aceito os Termos de Uso
                    </span>
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-300 hover:underline">
                      Ver termos completos →
                    </a>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Button - Only show for steps after welcome (access-code and welcome have their own buttons) */}
          {screen.type !== 'welcome' && screen.type !== 'access-code' && (
            <>
              <button
                onClick={handleNext}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-300 py-4 rounded-full font-bold text-lg border-2 border-primary-200 hover:shadow-lg hover:from-primary-200 hover:to-secondary-200 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '⏳ Salvando...' : currentStep === screens.length - 1 ? 'Começar Agora →' : 'Próximo →'}
              </button>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="w-full text-primary-300 py-3 rounded-full font-medium border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 transition-colors"
                >
                  ← Voltar
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
