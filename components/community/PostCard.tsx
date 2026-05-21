'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import Badge from '@/components/shared/Badge'
import { cn } from '@/lib/utils'
import type { CommunityPost } from '@/lib/data'

interface PostCardProps {
  post: CommunityPost
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)
  const likeCount = post.likes + (liked ? 1 : 0)

  return (
    <article className="bg-white rounded-xl p-4 border border-warm-100 shadow-sm">
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
            <span className="text-xs text-text-light capitalize">{post.category}</span>
          </div>
        </div>
      </header>

      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line mb-3">
        {post.content}
      </p>

      <footer className="flex items-center gap-4 pt-3 border-t border-warm-100 text-xs text-text-secondary">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 hover:text-primary-400 transition-colors',
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
          className="flex items-center gap-1.5 hover:text-secondary-400 transition-colors"
        >
          <MessageCircle size={16} />
          <span className="font-medium">{post.comments}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-accent-500 transition-colors ml-auto"
          aria-label="Compartilhar"
        >
          <Share2 size={16} />
        </button>
      </footer>
    </article>
  )
}
