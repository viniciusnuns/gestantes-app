import { useActivityStore } from '@/lib/stores/activityStore'

// Vídeos de introdução incluídos nos planos Parto e Dores
export const PARTO_INTRO_IDS = new Set(['ex-0', 'ex-10'])
export const DORES_INTRO_IDS = new Set(['ex-0', 'ex-10'])

// Categorias acessíveis por produto
const ACCESS: Record<string, Set<string>> = {
  full: new Set([
    'introducao', 'educacao', 'apoio', 'mobilidade', 'alongamento',
    'respiracao', 'pelve', 'assoalho-pelvico', 'abdominal', 'meditacao', 'parto', 'pilates',
  ]),
  parto: new Set(['introducao', 'parto']),
  dores: new Set(['introducao', 'apoio']),
}

export function useUserAccess() {
  const productType = useActivityStore(s => s.userProfile?.product_type) || 'full'
  const allowed = ACCESS[productType] ?? ACCESS.full

  function canAccessCategory(category: string): boolean {
    return allowed.has(category)
  }

  function canAccessExercise(id: string, category: string): boolean {
    if (!canAccessCategory(category)) return false
    if (productType === 'parto' && category === 'introducao') {
      return PARTO_INTRO_IDS.has(id)
    }
    if (productType === 'dores' && category === 'introducao') {
      return DORES_INTRO_IDS.has(id)
    }
    return true
  }

  return {
    productType,
    isPartoOnly: productType === 'parto',
    isDoresOnly: productType === 'dores',
    canAccessCategory,
    canAccessExercise,
  }
}
