'use client'

import { useState } from 'react'
import Modal from '@/components/shared/Modal'
import Button from '@/components/shared/Button'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'
import { useUserHeader } from '@/lib/stores/activityStore'

interface NewPostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
}

function getTrimesterCategory(trimester: string): string {
  if (trimester.includes('1º')) return '1º trimestre'
  if (trimester.includes('2º')) return '2º trimestre'
  if (trimester.includes('3º')) return '3º trimestre'
  return '1º trimestre'
}

export default function NewPostModal({
  isOpen,
  onClose,
  onPostCreated,
}: NewPostModalProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const header = useUserHeader()
  const category = getTrimesterCategory(header.trimester)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('O conteúdo não pode estar vazio')
      return
    }

    if (content.trim().length < 10) {
      setError('O conteúdo deve ter pelo menos 10 caracteres')
      return
    }

    try {
      setIsLoading(true)
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
        .from('community_posts')
        .insert([
          {
            user_id: user.id,
            author_name: header.name,
            author_avatar: authorAvatar,
            content: content.trim(),
            category,
            week_number: header.week,
          },
        ])

      if (insertError) {
        console.error('Insert error:', insertError)
        setError('Erro ao criar publicação')
        return
      }

      // Check if this is the user's first post and unlock achievement
      const { count: postCount, error: countError } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      console.log('[Achievement] Post count:', postCount, 'Error:', countError)

      if (postCount === 1) {
        console.log('[Achievement] First post detected! Unlocking achievement...')
        console.log('[Achievement] User ID:', user.id)
        // This is the first post - unlock the "Comunidade" achievement
        const { data, error: achievementError } = await supabase
          .from('user_achievements')
          .insert([
            {
              user_id: user.id,
              achievement_id: 'ach-5',
            },
          ])

        console.log('[Achievement] Insert response - Data:', data, 'Error:', achievementError)
        if (achievementError) {
          console.error('[Achievement] Error unlocking achievement:', achievementError)
        } else {
          console.log('[Achievement] Achievement unlocked successfully!')
        }
      } else {
        console.log('[Achievement] Not first post, skipping achievement unlock')
      }

      setContent('')
      onPostCreated?.()
      onClose()
    } catch (err) {
      console.error('Error creating post:', err)
      setError('Erro ao criar publicação')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Publicação" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info about category */}
        <div className="text-xs text-text-secondary bg-warm-50 p-3 rounded-lg">
          📍 Sua publicação será postada em <span className="font-semibold text-text-primary">{category.replace('º trimestre', 'º Trimestre')}</span>
        </div>

        {/* Content Textarea */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            O que você quer compartilhar?
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conte sua experiência, dúvidas ou conquistas..."
            maxLength={500}
            rows={5}
            className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
          />
          <div className="mt-1 text-xs text-text-secondary text-right">
            {content.length}/500
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg text-sm text-accent-700">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-warm-200 rounded-lg text-sm font-semibold text-text-primary hover:bg-warm-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
