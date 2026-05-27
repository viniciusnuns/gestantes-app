import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'

interface UseLikeOptions {
  postId: string
  initialLiked?: boolean
  onLikeChange?: (liked: boolean) => void
}

export function useLike({ postId, initialLiked = false, onLikeChange }: UseLikeOptions) {
  const [liked, setLiked] = useState(initialLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user has already liked this post
  useEffect(() => {
    const checkLike = async () => {
      try {
        const user = getCurrentUser()
        if (!user) return

        const { data, error: queryError } = await supabase
          .from('community_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        if (queryError && queryError.code !== 'PGRST116') {
          console.error('Error checking like:', queryError)
          return
        }

        setLiked(!!data)
      } catch (err) {
        console.error('Error in checkLike:', err)
      }
    }

    checkLike()
  }, [postId])

  const toggleLike = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const user = getCurrentUser()

      if (!user) {
        setError('Usuária não autenticada')
        return
      }

      if (liked) {
        // Remove like
        const { error: deleteError } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Error removing like:', deleteError)
          setError('Erro ao remover like')
          return
        }

        setLiked(false)
        onLikeChange?.(false)
      } else {
        // Add like
        const { error: insertError } = await supabase
          .from('community_likes')
          .insert([
            {
              post_id: postId,
              user_id: user.id,
            },
          ])

        if (insertError) {
          console.error('Error adding like:', insertError)
          setError('Erro ao dar like')
          return
        }

        setLiked(true)
        onLikeChange?.(true)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setError('Erro ao processar like')
    } finally {
      setIsLoading(false)
    }
  }

  return { liked, isLoading, error, toggleLike }
}
