'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp, Edit, X } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import Button from '@/components/shared/Button'
import ExpandableComments from '@/components/community/ExpandableComments'
import { useLike } from '@/lib/hooks/useLike'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { cn } from '@/lib/utils'
import type { CommunityPost } from '@/lib/data'

interface PostCardProps {
  post: CommunityPost
  onPostDeleted?: () => void
}

export default function PostCard({ post, onPostDeleted }: PostCardProps) {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [postContent, setPostContent] = useState(post.content)
  const currentUser = getCurrentUser()
  const { liked, toggleLike, isLoading } = useLike({
    postId: post.id,
    initialLiked: false,
    onLikeChange: (isLiked) => {
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(prev - 1, 0)))
    },
  })

  const handleEditPost = async () => {
    if (!currentUser || !editedContent.trim()) {
      alert('O post não pode estar vazio')
      return
    }

    try {
      setIsSavingEdit(true)
      const { error } = await supabase
        .from('community_posts')
        .update({ content: editedContent.trim() })
        .eq('id', post.id)
        .eq('user_id', currentUser.id)

      if (error) {
        console.error('Edit error:', error)
        alert('Erro ao editar post')
        return
      }

      setPostContent(editedContent.trim())
      setIsEditingPost(false)
    } catch (err) {
      console.error('Error editing post:', err)
      alert('Erro ao editar post')
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <article className="bg-white rounded-xl border border-warm-100 shadow-sm">
      <div className="p-4">
        <header className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-text-primary">{post.author}</h3>
              <span className="text-xs text-text-light">· {post.timestamp}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge tone="primary" className="!text-[10px] !px-2 !py-0.5">
                {post.week}ª semana
              </Badge>
              <span className="text-xs text-text-secondary">{post.category}</span>
            </div>
          </div>
          {currentUser?.id === (post as any).user_id && (
            <button
              type="button"
              onClick={() => setIsEditingPost(true)}
              className="flex-shrink-0 p-2 hover:bg-warm-100 rounded-lg transition-colors"
              aria-label="Editar post"
              title="Editar post"
            >
              <Edit size={18} className="text-text-secondary hover:text-primary-600" />
            </button>
          )}
        </header>

        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line mb-3">
          {postContent}
        </p>

        <footer className="flex items-center gap-4 pt-3 border-t border-warm-100 text-xs text-text-secondary">
          <button
            type="button"
            onClick={toggleLike}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-1.5 hover:text-primary-400 transition-colors disabled:opacity-50',
              liked && 'text-primary-400'
            )}
          >
            <Heart
              size={16}
              fill={liked ? 'currentColor' : 'none'}
              strokeWidth={liked ? 0 : 1.8}
            />
            <span className="font-medium">{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCommentsExpanded((v) => !v)}
            className="flex items-center gap-1.5 hover:text-secondary-400 transition-colors"
          >
            <MessageCircle size={16} />
            <span className="font-medium">{commentCount}</span>
            {isCommentsExpanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 hover:text-accent-500 transition-colors ml-auto"
            aria-label="Compartilhar"
          >
            <Share2 size={16} />
          </button>
        </footer>
      </div>

      {/* Expandable Comments */}
      {isCommentsExpanded && (
        <div className="px-4 pb-4">
          <ExpandableComments
            postId={post.id}
            isExpanded={isCommentsExpanded}
            onCommentAdded={(newCount) => setCommentCount(newCount)}
            onCommentsLoaded={(loadedCount) => setCommentCount(loadedCount)}
          />
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-text-primary">Editar Post</h2>
              <button
                type="button"
                onClick={() => setIsEditingPost(false)}
                className="p-1 hover:bg-warm-100 rounded transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
              rows={5}
              placeholder="Digite o conteúdo do seu post..."
              maxLength={500}
            />

            <p className="text-xs text-text-secondary mt-2">
              {editedContent.length}/500 caracteres
            </p>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsEditingPost(false)}
                className="flex-1 px-4 py-2 border border-warm-200 rounded-lg text-text-primary hover:bg-warm-50 transition-colors"
              >
                Cancelar
              </button>
              <Button
                onClick={handleEditPost}
                disabled={isSavingEdit || !editedContent.trim()}
                className="flex-1"
              >
                {isSavingEdit ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
