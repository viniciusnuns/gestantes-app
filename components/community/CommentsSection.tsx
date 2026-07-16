'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send } from 'lucide-react'
import Button from '@/components/shared/Button'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { useUserHeader } from '@/lib/stores/activityStore'
import { getDefaultAvatar } from '@/lib/utils'

interface Comment {
  id: string
  author_name: string
  author_avatar: string
  content: string
  created_at: string
}

interface CommentsSectionProps {
  postId: string
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

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const header = useUserHeader()

  // Fetch comments
  const fetchComments = useCallback(async () => {
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

      setComments(data || [])
    } catch (err) {
      console.error('Error in fetchComments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

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

      const { error: insertError } = await supabase
        .from('community_comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            author_name: header.name,
            author_avatar: getDefaultAvatar(user.id),
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
    } catch (err) {
      console.error('Error creating comment:', err)
      setError('Erro ao enviar comentário')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-text-secondary text-center py-4">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-4">
            Nenhum comentário ainda. Seja a primeira!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0 bg-warm-50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-text-primary">
                    {comment.author_name}
                  </h4>
                  <span className="text-[10px] text-text-light">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-xs text-text-primary mt-1 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2 pt-3 border-t border-warm-100">
        {error && (
          <p className="text-xs text-accent-700 bg-accent-50 p-2 rounded">
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
            className="flex-1 px-3 py-2 text-xs border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="p-2 bg-primary-300 text-white rounded-lg hover:bg-primary-400 disabled:opacity-50 transition-colors flex-shrink-0"
            aria-label="Enviar comentário"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}
