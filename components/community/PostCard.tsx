'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import ExpandableComments from '@/components/community/ExpandableComments'
import { useLike } from '@/lib/hooks/useLike'
import { cn } from '@/lib/utils'
import type { CommunityPost } from '@/lib/data'

interface PostCardProps {
  post: CommunityPost
}

export default function PostCard({ post }: PostCardProps) {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comments)
  const [likeCount, setLikeCount] = useState(post.likes)
  const { liked, toggleLike, isLoading } = useLike({
    postId: post.id,
    initialLiked: false,
    onLikeChange: (isLiked) => {
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(prev - 1, 0)))
    },
  })

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
        </header>

        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line mb-3">
          {post.content}
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
    </article>
  )
}
