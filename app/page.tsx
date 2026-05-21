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
    title: 'Seus objetivos',
    subtitle: 'Selecione os que mais importam',
    type: 'objectives'
  },
  {
    step: 4,
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
    objectives: ['preparar-para-parto'],
    discomforts: ['dor-lombar']
  })

  const screen = screens[currentStep]

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
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
      <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-6 text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">✨ Pronto!</h1>
          <p className="text-lg">Criamos sua jornada personalizada.</p>
          <p className="text-sm opacity-90">Estamos prontas para começar? 🤰</p>

          <button
            onClick={() => {
              // Redirect to home dashboard
              window.location.href = '/home'
            }}
            className="mt-8 bg-white text-primary-300 px-8 py-3 rounded-lg font-bold hover:bg-warm-50 transition-colors"
          >
            Ir para Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      {/* Header with progress */}
      <div className="bg-gradient-secondary text-white p-6 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-sm">Passo {currentStep + 1} de {screens.length}</div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / screens.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">

          {/* Welcome Screen */}
          {screen.type === 'welcome' && (
            <div className="space-y-6 text-center">
              <h1 className="text-4xl font-bold text-primary-300">Gestantes em Movimento</h1>
              <p className="text-lg text-text-secondary">{screen.subtitle}</p>
              <div className="text-6xl">🤰✨</div>
            </div>
          )}

          {/* Pregnancy Data */}
          {screen.type === 'pregnancy-data' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text-primary">{screen.title}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Seu nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Maria"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Semana gestacional</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.week}
                    onChange={(e) => setFormData({...formData, week: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.firstPregnancy}
                      onChange={(e) => setFormData({...formData, firstPregnancy: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">Primeira gestação?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Objectives */}
          {screen.type === 'objectives' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text-primary">{screen.title}</h2>
              <div className="space-y-3">
                {[
                  { id: 'aliviar-dores', label: '🩹 Aliviar dores' },
                  { id: 'preparar-para-parto', label: '🤰 Preparar para o parto' },
                  { id: 'mobilidade', label: '🧘 Mobilidade' },
                  { id: 'reduzir-ansiedade', label: '🧠 Reduzir ansiedade' },
                  { id: 'assoalho-pelvico', label: '💪 Assoalho pélvico' },
                  { id: 'manter-atividade', label: '🏃 Manter atividade física' },
                ].map(obj => (
                  <label key={obj.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-warm-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.objectives.includes(obj.id)}
                      onChange={() => handleObjectiveChange(obj.id)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">{obj.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Discomforts */}
          {screen.type === 'discomforts' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-text-primary">{screen.title}</h2>
              <div className="space-y-3">
                {[
                  { id: 'dor-lombar', label: '🔴 Dor lombar' },
                  { id: 'dor-pelvica', label: '🔴 Dor pélvica' },
                  { id: 'falta-ar', label: '😮‍💨 Falta de ar' },
                  { id: 'inchaço', label: '💧 Inchaço' },
                  { id: 'constipacao', label: '🚽 Constipação' },
                  { id: 'insonia', label: '😴 Insônia' },
                ].map(dis => (
                  <label key={dis.id} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-warm-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.discomforts.includes(dis.id)}
                      onChange={() => handleDiscomfortChange(dis.id)}
                      className="w-5 h-5"
                    />
                    <span className="text-sm">{dis.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleNext}
            className="w-full bg-gradient-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            {currentStep === screens.length - 1 ? 'Finalizar' : 'Próximo'}
          </button>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="w-full text-primary-300 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
