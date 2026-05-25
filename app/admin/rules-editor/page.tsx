'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Send, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Rule {
  id: string
  category: string
  title: string
  content: string
  status: 'active' | 'partial' | 'tech-debt'
  expanded: boolean
}

interface Suggestion {
  id: string
  ruleId: string
  text: string
  timestamp: string
  status: 'pending' | 'analyzed' | 'implemented'
}

const initialRules: Rule[] = [
  {
    id: 'onboarding',
    category: 'Negócio',
    title: '✅ Onboarding - 6 Passos obrigatórios',
    content: `Todo novo usuário passa por: Boas-vindas → Perfil → Saúde → Objetivos → Desconfortos → Confirmação. Dados salvos em users table.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'semana',
    category: 'Negócio',
    title: '✅ Semana de Gestação - Cálculo automático',
    content: `registration_date + week_at_registration = semana atual. Teto máximo 40 semanas. Sincronizado em tempo real em todas as telas. Timezone: America/Sao_Paulo.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'trimestres',
    category: 'Negócio',
    title: '✅ Trimestres - 3 exercícios por trimestre',
    content: `1º (1-13): respiracao, core, pelve | 2º (14-27): respiracao, pelve, assoalho-pelvico | 3º (28-40): respiracao, parto, ansiedade. Mudança automática.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'exercicios',
    category: 'Negócio',
    title: '✅ Exercícios - 9 exercícios fixos',
    content: `Catálogo estático com 3 exercícios por trimestre. Cada exercício tem: id, name, category, trimester, duration, description, image, contraindications, instructions.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'atividades',
    category: 'Negócio',
    title: '✅ Atividades - Um exercício completado',
    content: `Sempre 20 pontos. Dados: user_id, exercise_id, activity_date (pode ser dia diferente de hoje!), completed_at, points_earned, source (calendario/biblioteca/home). REPETIÇÃO PERMITIDA.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'pontos',
    category: 'Negócio',
    title: '✅ Pontos e Ranking - Ranking público em tempo real',
    content: `Fonte de verdade: user_activity_history. Cálculo: SUM(points_earned) por usuária. RANK() OVER ORDER BY total_points DESC. Visibilidade: todas veem todas.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'progresso',
    category: 'Negócio',
    title: '✅ Progresso Pessoal - 4 métricas principais',
    content: `Dias ativos (DISTINCT activity_date), Total atividades, Total pontos, Meta semanal (5 atividades/semana com visual bar). Histórico exibe últimas atividades.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'home',
    category: 'Telas',
    title: '✅ Home - Dashboard personalizado',
    content: `Exibe: nome, semana, trimestre, dias faltando, 3 exercícios sugeridos, dias ativos, pontos, meta semanal, ranking. Realtime subscription. Carrega últimas 100 atividades.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'biblioteca',
    category: 'Telas',
    title: '✅ Biblioteca - Catálogo + detalhe + conclusão',
    content: `Se vindo do calendário (?date): registra para AQUELE dia, source='calendario', back retorna ao calendário. Se direto: registra para hoje, source='biblioteca'. Exercícios são dados estáticos.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'calendario-mes',
    category: 'Telas',
    title: '✅ Calendário Mês - Grid 7x6 com cores',
    content: `Verde: 3/3, Amarelo: 1-2/3, Branco: 0/3. Status baseado em user_activity_history por activity_date. Clique abre /calendario/{date}. Sem busca de dados extra.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'calendario-dia',
    category: 'Telas',
    title: '✅ Calendário Dia - 3 exercícios com opções',
    content: `Opção A: Clique "Completei" direto (source='calendario'). Opção B: Clique no card → biblioteca com ?date={date}. Back retorna ao calendário.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'progresso-tela',
    category: 'Telas',
    title: '✅ Progresso - 3 abas: Ranking, Histórico, Conquistas',
    content: `Ranking: top 100 usuárias. Histórico: últimas 100 atividades. Conquistas: estrutura pronta. Atualiza realtime. Destaque na linha da usuária atual.`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'realtime',
    category: 'Sincronização',
    title: '✅ Realtime Subscriptions - Canal único por usuária',
    content: `Canal: realtime:user-updates:{userId}. Listener: postgres_changes em user_activity_history INSERT. Atualiza todas as telas <100ms. Sem debounce (tech-debt).`,
    status: 'active',
    expanded: false,
  },
  {
    id: 'auth',
    category: 'Segurança',
    title: '⚠️ Custom Auth - Sem Supabase Auth (Tech-debt)',
    content: `Email + Senha. UUID validation. Bcryptjs 6 rounds. Data isolation migration. Session em localStorage. Sem expiration, sem refresh tokens, sem 2FA.`,
    status: 'tech-debt',
    expanded: false,
  },
  {
    id: 'performance',
    category: 'Performance',
    title: '✅ Performance - Otimizada pós-simplificação',
    content: `Login: <200ms (removida geração de 90 atividades). Carrega max 100 atividades. Zustand selectors (não store inteiro). Dados iniciais: ~5KB (antes 50KB).`,
    status: 'active',
    expanded: false,
  },
]

export default function RulesEditorPage() {
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [newSuggestion, setNewSuggestion] = useState('')
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'partial' | 'tech-debt'>('all')
  const [expandedSuggestionId, setExpandedSuggestionId] = useState<string | null>(null)

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, expanded: !r.expanded } : r))
  }

  const handleAddSuggestion = () => {
    if (!newSuggestion.trim() || !selectedRuleId) return

    const rule = rules.find(r => r.id === selectedRuleId)

    const suggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      ruleId: selectedRuleId,
      text: newSuggestion,
      timestamp: new Date().toLocaleString('pt-BR'),
      status: 'pending',
    }

    setSuggestions([...suggestions, suggestion])
    setNewSuggestion('')
    setSelectedRuleId(null)

    alert('✅ Sugestão registrada! Copie e cole aqui no chat comigo para eu revisar e implementar.')
  }

  const filteredRules = rules.filter(r => filter === 'all' || r.status === filter)
  const categories = Array.from(new Set(rules.map(r => r.category)))

  const ruleSuggestions = selectedRuleId
    ? suggestions.filter(s => s.ruleId === selectedRuleId)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-primary-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-warm-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            📋 Editor de Regras - Gestar em Movimento
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Visualize todas as regras do app e sugira melhorias para implementação
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rules List - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'partial', 'tech-debt'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    filter === status
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white text-text-primary border border-warm-200 hover:border-primary-300'
                  )}
                >
                  {status === 'all' && '📌 Todas'}
                  {status === 'active' && '✅ Ativas'}
                  {status === 'partial' && '⚠️ Parciais'}
                  {status === 'tech-debt' && '🔧 Tech-debt'}
                </button>
              ))}
            </div>

            {/* Rules by Category */}
            {categories.map(category => {
              const categoryRules = filteredRules.filter(r => r.category === category)
              if (categoryRules.length === 0) return null

              return (
                <section key={category} className="space-y-3">
                  <h2 className="text-lg font-bold text-text-primary sticky top-16 bg-gradient-to-r from-warm-50 to-primary-50 py-2">
                    {category}
                  </h2>

                  {categoryRules.map(rule => (
                    <div
                      key={rule.id}
                      className={cn(
                        'rounded-xl border transition-all cursor-pointer',
                        selectedRuleId === rule.id
                          ? 'border-primary-400 bg-primary-50 shadow-md'
                          : 'border-warm-200 bg-white hover:shadow-md'
                      )}
                    >
                      {/* Rule Header */}
                      <button
                        onClick={() => {
                          toggleRule(rule.id)
                          setSelectedRuleId(rule.id)
                        }}
                        className="w-full p-4 flex items-start gap-3 text-left"
                      >
                        <ChevronDown
                          size={20}
                          className={cn(
                            'flex-shrink-0 mt-1 transition-transform',
                            rule.expanded && 'rotate-180'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-text-primary">{rule.title}</h3>
                          <p className="text-xs text-text-secondary mt-1">{rule.content.substring(0, 100)}...</p>
                        </div>
                        <div className={cn(
                          'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                          rule.status === 'active' && 'bg-emerald-100 text-emerald-700',
                          rule.status === 'partial' && 'bg-yellow-100 text-yellow-700',
                          rule.status === 'tech-debt' && 'bg-red-100 text-red-700'
                        )}>
                          {rule.status}
                        </div>
                      </button>

                      {/* Rule Details */}
                      {rule.expanded && (
                        <div className="border-t border-warm-200 p-4 bg-warm-50/50">
                          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                            {rule.content}
                          </p>

                          {/* Suggestions for this rule */}
                          {ruleSuggestions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-warm-200 space-y-2">
                              <p className="text-xs font-bold text-text-secondary">Sugestões pendentes:</p>
                              {ruleSuggestions.map(sug => (
                                <button
                                  key={sug.id}
                                  onClick={() => setExpandedSuggestionId(sug.id)}
                                  className="w-full text-xs bg-white p-2 rounded border border-warm-100 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                                >
                                  <p className="text-text-primary line-clamp-2">{sug.text}</p>
                                  <p className="text-text-secondary text-[10px] mt-1">{sug.timestamp}</p>
                                  <p className="text-primary-600 text-[10px] mt-1 font-medium">→ Ler mais</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )
            })}
          </div>

          {/* Suggestions Panel - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Suggestion Form */}
              <div className="bg-white rounded-xl border-2 border-primary-200 p-5 shadow-lg">
                <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                  <Plus size={18} className="text-primary-600" />
                  Sugerir Melhoria
                </h3>

                {selectedRuleId ? (
                  <div className="space-y-3">
                    <div className="text-xs bg-primary-50 p-2 rounded border border-primary-200">
                      <p className="font-medium text-primary-900">
                        {rules.find(r => r.id === selectedRuleId)?.title.substring(0, 50)}...
                      </p>
                    </div>

                    <textarea
                      placeholder="Descreva a melhoria que você quer implementar..."
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      className="w-full p-3 border border-warm-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200 resize-none"
                      rows={4}
                    />

                    <button
                      onClick={handleAddSuggestion}
                      disabled={!newSuggestion.trim()}
                      className="w-full py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition-all"
                    >
                      <Send size={16} />
                      Enviar Sugestão
                    </button>

                    <button
                      onClick={() => setSelectedRuleId(null)}
                      className="w-full py-2 bg-warm-100 text-text-primary rounded-lg font-medium text-sm hover:bg-warm-200 transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">
                    👈 Clique em uma regra para sugerir melhorias
                  </p>
                )}
              </div>

              {/* Suggestions Summary */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-xl border border-warm-200 p-4">
                  <h4 className="font-bold text-text-primary mb-3">
                    📝 Sugestões ({suggestions.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {suggestions.map(sug => (
                      <button
                        key={sug.id}
                        onClick={() => setExpandedSuggestionId(sug.id)}
                        className="w-full text-xs bg-warm-50 p-2 rounded border border-warm-100 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-yellow-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-text-primary font-medium line-clamp-1">
                              {rules.find(r => r.id === sug.ruleId)?.title.substring(0, 30)}
                            </p>
                            <p className="text-text-secondary mt-1 line-clamp-2">{sug.text}</p>
                            <p className="text-primary-600 text-[10px] mt-1 font-medium">→ Ler mais</p>
                            <p className="text-[10px] text-text-secondary mt-1">{sug.timestamp}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-4">
                <h4 className="font-bold text-emerald-900 mb-3">📊 Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Regras Ativas:</span>
                    <span className="font-bold text-emerald-900">{rules.filter(r => r.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Total de Regras:</span>
                    <span className="font-bold text-emerald-900">{rules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Sugestões Pendentes:</span>
                    <span className="font-bold text-emerald-900">{suggestions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal - Expanded Suggestion */}
        {expandedSuggestionId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              {(() => {
                const sug = suggestions.find(s => s.id === expandedSuggestionId)
                const rule = sug ? rules.find(r => r.id === sug.ruleId) : null

                return (
                  <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary-600 mb-1">Sugestão para:</p>
                        <h3 className="text-xl font-bold text-text-primary">
                          {rule?.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setExpandedSuggestionId(null)}
                        className="flex-shrink-0 p-2 hover:bg-warm-100 rounded-lg transition-colors"
                      >
                        <X size={20} className="text-text-secondary" />
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-warm-200" />

                    {/* Content */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-text-secondary mb-2">Sua sugestão:</p>
                        <p className="text-base text-text-primary leading-relaxed whitespace-pre-wrap bg-warm-50 p-4 rounded-lg border border-warm-200">
                          {sug?.text}
                        </p>
                      </div>

                      {rule && (
                        <div>
                          <p className="text-sm font-semibold text-text-secondary mb-2">Regra atual:</p>
                          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap bg-primary-50 p-4 rounded-lg border border-primary-200">
                            {rule.content}
                          </p>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between items-center text-xs text-text-secondary">
                        <span>📅 {sug?.timestamp}</span>
                        <span className={cn(
                          'px-3 py-1 rounded-full font-medium',
                          sug?.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                          sug?.status === 'analyzed' && 'bg-blue-100 text-blue-700',
                          sug?.status === 'implemented' && 'bg-emerald-100 text-emerald-700'
                        )}>
                          {sug?.status}
                        </span>
                      </div>
                    </div>

                    {/* Close Button */}
                    <div className="pt-4 border-t border-warm-200">
                      <button
                        onClick={() => setExpandedSuggestionId(null)}
                        className="w-full py-2 bg-primary-100 text-primary-700 rounded-lg font-medium hover:bg-primary-200 transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
