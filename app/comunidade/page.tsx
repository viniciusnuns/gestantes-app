'use client'

import { useMemo, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { PenSquare } from 'lucide-react'
import BottomNav from '@/components/nav/BottomNav'
import PostCard from '@/components/community/PostCard'
import NewPostModal from '@/components/community/NewPostModal'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: '1º trimestre', label: '1º trim.' },
  { id: '2º trimestre', label: '2º trim.' },
  { id: '3º trimestre', label: '3º trim.' },
  { id: 'pós-parto', label: 'Pós-parto' },
  { id: 'trabalho-parto', label: 'Trabalho de parto' },
] as const

type TabId = (typeof TABS)[number]['id']

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (secondsAgo < 60) return 'agora'
  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) return `${minutesAgo}min`
  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) return `${hoursAgo}h`
  const daysAgo = Math.floor(hoursAgo / 24)
  return `${daysAgo}d`
}

export default function CommunityPage() {
  const pathname = usePathname()
  const [tab, setTab] = useState<TabId>('todas')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch posts from Supabase - mostra dados reais com contadores atualizados
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      // Busca posts com contadores recalculados do banco
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          likes_count: community_likes(count),
          comments_count: community_comments(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      const formattedPosts = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        author: p.author_name,
        week: p.week_number,
        avatar: p.author_avatar,
        content: p.content,
        timestamp: formatTimeAgo(p.created_at),
        likes: Array.isArray(p.likes_count) ? p.likes_count[0]?.count || 0 : p.likes_count || 0,
        comments: Array.isArray(p.comments_count) ? p.comments_count[0]?.count || 0 : p.comments_count || 0,
        category: p.category,
      }))

      setPosts(formattedPosts)
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch posts quando entra na página ou quando navega de volta pra comunidade
  useEffect(() => {
    if (pathname === '/comunidade') {
      fetchPosts()
    }
  }, [pathname])

  // Refetch posts quando volta pra aba de comunidade (de outra aba do browser)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pathname === '/comunidade') {
        fetchPosts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [pathname])

  const filtered = useMemo(() => {
    if (tab === 'todas') return posts
    return posts.filter((p) => p.category === tab)
  }, [tab, posts])

  return (
    <div className="min-h-screen bg-warm-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">Comunidade</h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Conversas entre gestantes em movimento
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-full bg-primary-300 text-white flex items-center justify-center hover:bg-primary-400 shadow-sm"
              aria-label="Criar publicação"
            >
              <PenSquare size={18} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto -mx-1 px-1 pb-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                  tab === t.id
                    ? 'bg-secondary-300 text-white'
                    : 'bg-warm-100 text-text-secondary hover:bg-warm-200'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-5 py-5 space-y-3">
        {filtered.length === 0 ? (
          posts.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center text-center py-14 px-6">
              <div className="text-6xl mb-5">🌸</div>
              <h2 className="text-lg font-bold text-text-primary mb-2">
                Seja a primeira a compartilhar!
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6 max-w-xs">
                Esta comunidade é o seu espaço. Conta como está sendo a sua gestação, uma conquista do dia, uma dúvida ou simplesmente como você está se sentindo.
              </p>
              <p className="text-xs text-text-light italic mb-8">
                Cada história inspira outra mamãe 💗
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-primary-400 text-white rounded-2xl font-semibold text-sm shadow-sm hover:bg-primary-500 transition-colors"
              >
                Escrever primeiro post
              </button>
            </div>
          ) : (
            <div className="text-center py-16 text-text-secondary text-sm">
              <p className="text-4xl mb-3">💬</p>
              Ainda não há posts nessa categoria.
              <br />
              Seja a primeira a compartilhar!
            </div>
          )
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={fetchPosts}
            />
          ))
        )}
      </main>

      <NewPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={fetchPosts}
      />

      <BottomNav />
    </div>
  )
}
