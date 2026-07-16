'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, customSignOut } from '@/lib/customAuth'
import TherapistAuthForm from '@/components/auth/TherapistAuthForm'
import PatientCard from '@/components/dashboard/PatientCard'
import { getTherapistPatients, assignPatientToTherapist } from '@/lib/therapist'

interface Patient {
  id: string
  name: string
  email: string
  week: number
  phone?: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [newPatientEmail, setNewPatientEmail] = useState('')
  const [addingPatient, setAddingPatient] = useState(false)
  const [addError, setAddError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (!currentUser) {
      setLoading(false)
    }
  }, [])

  const loadPatients = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const patientsData = await getTherapistPatients(user.id)
      setPatients(patientsData as Patient[])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError('')
    setAddingPatient(true)

    try {
      const result = await assignPatientToTherapist(user!.id, newPatientEmail)
      if (result.success) {
        setNewPatientEmail('')
        setShowAddPatient(false)
        await loadPatients()
      } else {
        setAddError(result.error || 'Erro ao adicionar paciente')
      }
    } catch (error: any) {
      setAddError(error.message || 'Erro ao adicionar paciente')
    } finally {
      setAddingPatient(false)
    }
  }

  const handleLogout = async () => {
    customSignOut()
    router.push('/dashboard')
  }

  if (!user) {
    return <TherapistAuthForm onSuccess={() => router.refresh()} />
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/40 via-warm-50 to-secondary-50/30">
      {/* Header */}
      <div className="bg-white border-b border-warm-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Painel de Profissional</h1>
            <p className="text-text-secondary">Gestar em Movimento</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar paciente por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <button
              onClick={() => setShowAddPatient(!showAddPatient)}
              className="bg-gradient-to-r from-primary-300 to-secondary-300 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              + Adicionar Paciente
            </button>
          </div>

          {/* Add Patient Form */}
          {showAddPatient && (
            <div className="bg-white rounded-2xl p-6 border border-warm-100">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Adicionar Paciente</h3>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Email da Paciente
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>

                {addError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">{addError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={addingPatient}
                    className="flex-1 bg-gradient-to-r from-primary-300 to-secondary-300 text-white py-3 rounded-full font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {addingPatient ? 'Adicionando...' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPatient(false)
                      setAddError('')
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Patients List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">
              Minhas Pacientes ({filteredPatients.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">Carregando pacientes...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-warm-100">
              <p className="text-text-secondary mb-4">
                {patients.length === 0
                  ? 'Nenhuma paciente adicionada ainda. Comece adicionando pacientes por email.'
                  : 'Nenhuma paciente encontrada com esse termo de busca.'}
              </p>
              {patients.length === 0 && (
                <button
                  onClick={() => setShowAddPatient(true)}
                  className="bg-gradient-to-r from-primary-300 to-secondary-300 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
                >
                  Adicionar Primeira Paciente
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map(patient => (
                <PatientCard
                  key={patient.id}
                  id={patient.id}
                  name={patient.name}
                  email={patient.email}
                  week={patient.week}
                  phone={patient.phone}
                  healthyPregnancy={patient.healthyPregnancy}
                  hadIntercurrence={patient.hadIntercurrence}
                  doctorApproved={patient.doctorApproved}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
