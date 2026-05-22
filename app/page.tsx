'use client'

import { useState } from 'react'
import { currentUser } from '@/lib/data'

// Onboarding screens
const screens = [
  {
    step: 1,
    title: 'Boas-vindas',
    subtitle: 'Seu corpo muda a cada semana. Vamos acompanhar essa jornada juntas.',
    type: 'welcome'
  },
  {
    step: 2,
    title: 'Dados da gestação',
    subtitle: 'Nos conte um pouco sobre você',
    type: 'pregnancy-data'
  },
  {
    step: 3,
    title: 'Seus contatos',
    subtitle: 'Para entrarmos em contato quando necessário',
    type: 'contact'
  },
  {
    step: 4,
    title: 'Informações médicas',
    subtitle: 'Nos ajude a entender sua saúde',
    type: 'health'
  },
  {
    step: 5,
    title: 'Seus objetivos',
    subtitle: 'Selecione os que mais importam',
    type: 'objectives'
  },
  {
    step: 6,
    title: 'Desconfortos atuais',
    subtitle: 'Isso nos ajuda a personalizar suas aulas',
    type: 'discomforts'
  }
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    week: 22,
    dueDate: '',
    firstPregnancy: true,
    riskPregnancy: false,
    desiredBirth: 'normal',
    email: '',
    phone: '',
    healthyPregnancy: true,
    hadIntercurrence: false,
    doctorApproved: true,
    objectives: ['preparar-para-parto'],
    discomforts: ['dor-lombar']
  })

  const screen = screens[currentStep]

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save user data to localStorage before completing
      if (typeof window !== 'undefined') {
        localStorage.setItem('onboarding_data', JSON.stringify(formData))
      }
      setCompleted(true)
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

  if (completed) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        {/* Decorative gradient background */}
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
              // Save data to localStorage before going to home
              if (typeof window !== 'undefined') {
                localStorage.setItem('onboarding_data', JSON.stringify(formData))
              }
              window.location.href = '/home'
            }}
            className="mt-12 bg-gradient-to-r from-primary-300 to-secondary-300 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Começar Agora →
          </button>

          <p className="text-sm text-text-secondary/60 mt-8">Sua primeira prática está esperando 💚</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Decorative background */}
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

          {/* Welcome Screen */}
          {screen.type === 'welcome' && (
            <div className="text-center space-y-8 w-full">
              <div className="space-y-6 bg-gradient-to-br from-primary-300 via-secondary-300 to-accent-300 rounded-3xl p-12 text-white shadow-xl">
                <div className="space-y-6">
                  {/* Pregnant Woman Yoga Photo */}
                  <div className="flex justify-center mb-2 px-2">
                    <img
                      src="/pregnant-yoga.png"
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
                  <label className="block text-sm font-semibold text-text-primary mb-3">Quantas semanas? ⏳</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.week}
                    onChange={(e) => setFormData({...formData, week: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
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
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent text-lg"
                  />
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
                {/* Question 1: Healthy Pregnancy */}
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

                {/* Question 2: Had Intercurrence */}
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

                {/* Question 3: Doctor Approved */}
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

          {/* Button - Only show for steps after welcome */}
          {screen.type !== 'welcome' && (
            <>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-300 py-4 rounded-full font-bold text-lg border-2 border-primary-200 hover:shadow-lg hover:from-primary-200 hover:to-secondary-200 transition-all transform hover:scale-105 active:scale-95"
              >
                {currentStep === screens.length - 1 ? '✨ Finalizar' : 'Próximo →'}
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
