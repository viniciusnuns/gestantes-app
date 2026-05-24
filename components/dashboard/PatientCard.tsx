import Link from 'next/link'

interface PatientCardProps {
  id: string
  name: string
  email: string
  week: number
  phone?: string
  healthyPregnancy: boolean
  hadIntercurrence: boolean
  doctorApproved: boolean
}

export default function PatientCard({
  id,
  name,
  email,
  week,
  phone,
  healthyPregnancy,
  hadIntercurrence,
  doctorApproved
}: PatientCardProps) {
  const getHealthStatus = () => {
    if (!healthyPregnancy) return 'Gestação não saudável'
    if (hadIntercurrence) return 'Com intercorrências'
    if (!doctorApproved) return 'Pendente aprovação médica'
    return 'Gestação saudável'
  }

  const getStatusColor = () => {
    if (!healthyPregnancy || !doctorApproved) return 'bg-red-50 border-red-200'
    if (hadIntercurrence) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const getStatusTextColor = () => {
    if (!healthyPregnancy || !doctorApproved) return 'text-red-700'
    if (hadIntercurrence) return 'text-yellow-700'
    return 'text-green-700'
  }

  return (
    <Link href={`/dashboard/patient/${id}`}>
      <div className={`${getStatusColor()} border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer`}>
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">{name}</h3>
              <p className="text-sm text-text-secondary">{email}</p>
            </div>
            <span className="bg-primary-300 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Semana {week}
            </span>
          </div>

          {phone && (
            <p className="text-sm text-text-secondary">📱 {phone}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <span className={`${getStatusTextColor()} bg-white px-3 py-1 rounded-full text-xs font-medium border`}>
              {getHealthStatus()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
