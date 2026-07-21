import { useActivityStore } from '@/lib/stores/activityStore'

// Vídeos de introdução incluídos no plano Parto (boas-vindas + apresentação da Fabiana)
export const PARTO_INTRO_IDS = new Set(['ex-0', 'ex-10'])

// Categorias acessíveis por produto
const ACCESS: Record<string, Set<string>> = {
  full: new Set([
    'introducao', 'educacao', 'apoio', 'mobilidade', 'alongamento',
    'respiracao', 'pelve', 'assoalho-pelvico', 'abdominal', 'meditacao', 'parto',
  ]),
  parto: new Set(['introducao', 'parto']),
}

export function useUserAccess() {
  const productType = useActivityStore(s => s.userProfile?.product_type) || 'full'
  const allowed = ACCESS[productType] ?? ACCESS.full

  function canAccessCategory(category: string): boolean {
    return allowed.has(category)
  }

  // Parto users só acessam ex-0 e ex-10 na introdução; demais categorias: verificação normal
  function canAccessExercise(id: string, category: string): boolean {
    if (!canAccessCategory(category)) return false
    if (productType === 'parto' && category === 'introducao') {
      return PARTO_INTRO_IDS.has(id)
    }
    return true
  }

  return {
    productType,
    isPartoOnly: productType === 'parto',
    canAccessCategory,
    canAccessExercise,
  }
}
