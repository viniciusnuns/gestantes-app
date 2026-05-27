'use client'

import { useState, useEffect } from 'react'
import { Send, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { useUserHeader } from '@/lib/stores/activityStore'

interface Comment {
  id: string
  author_name: string
  author_avatar: string
  content: string
  created_at: string
}

interface ExpandableCommentsProps {
  postId: string
  isExpanded: boolean
  onCommentAdded?: (newCount: number) => void
  onCommentsLoaded?: (newCount: number) => void
}

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

export default function ExpandableComments({
  postId,
  isExpanded,
  onCommentAdded,
  onCommentsLoaded,
}: ExpandableCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const header = useUserHeader()

  // Fetch comments
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const { data, error: queryError } = await supabase
        .from('community_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (queryError) {
        console.error('Error fetching comments:', queryError)
        return
      }

      const loadedComments = data || []
      setComments(loadedComments)
      onCommentsLoaded?.(loadedComments.length)
    } catch (err) {
      console.error('Error in fetchComments:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch comments when expanded
  useEffect(() => {
    if (isExpanded) {
      fetchComments()
    }
  }, [isExpanded, postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('O comentário não pode estar vazio')
      return
    }

    try {
      setIsSubmitting(true)
      const user = getCurrentUser()

      if (!user) {
        setError('Usuária não autenticada')
        return
      }

      // Get user's avatar from database
      const { data: userData } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      const authorAvatar = userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`

      const { error: insertError } = await supabase
        .from('community_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            author_name: header.name,
            author_avatar: authorAvatar,
            content: content.trim(),
          },
        ])

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Erro ao enviar comentário')
        return
      }

      setContent('')
      await fetchComments()
      onCommentAdded?.(comments.length + 1)
    } catch (err) {
      console.error('Error creating comment:', err)
      setError('Erro ao enviar comentário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-t border-warm-100 mt-3 pt-3 space-y-3">
      {/* Comments List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-text-secondary text-center py-2">
            Carregando comentários...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-2">
            Nenhum comentário ainda
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0 bg-warm-50 rounded p-2">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-semibold text-text-primary">
                    {comment.author_name}
                  </h4>
                  <span className="text-[10px] text-text-light">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-xs text-text-primary mt-0.5 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-1">
        {error && (
          <p className="text-xs text-accent-700 bg-accent-50 p-1.5 rounded">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Adicionar um comentário..."
            maxLength={200}
            disabled={isSubmitting}
            className="flex-1 px-2.5 py-1.5 text-xs border border-warm-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="p-1.5 bg-primary-300 text-white rounded hover:bg-primary-400 disabled:opacity-50 transition-colors flex-shrink-0"
            aria-label="Enviar comentário"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  )
}
