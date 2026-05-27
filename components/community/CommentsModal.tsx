'use client'

import Modal from '@/components/shared/Modal'
import CommentsSection from '@/components/community/CommentsSection'

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  postId: string
  authorName: string
}

export default function CommentsModal({
  isOpen,
  onClose,
  postId,
  authorName,
}: CommentsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Comentários em "${authorName}"`}
      size="md"
    >
      <CommentsSection postId={postId} />
    </Modal>
  )
}
