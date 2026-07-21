import { useActivityStore } from '@/lib/stores/activityStore'

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

  return {
    productType,
    isPartoOnly: productType === 'parto',
    canAccessCategory,
  }
}
