'use client'

import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/customAuth'
import { getDefaultAvatar } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatar?: string
  onAvatarUpdated?: (url: string) => void
}

export default function AvatarUpload({
  currentAvatar,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande (máx 5MB)')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const user = getCurrentUser()
      if (!user) {
        setError('Usuária não autenticada')
        return
      }

      // Preview local
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload para Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = fileName  // Don't prefix with 'avatars/' - we're already in that bucket

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        const errorMsg = uploadError?.message || 'Erro ao fazer upload'
        setError(errorMsg)
        setPreview(null)
        return
      }

      // Gerar URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      console.log('Generated public URL:', publicUrl)
      console.log('File path:', filePath)

      // Atualizar usuária no banco
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        setError('Erro ao salvar avatar')
        return
      }

      console.log('Avatar saved to database successfully')

      // Save to localStorage for persistence
      localStorage.setItem(`avatar_${user.id}`, publicUrl)

      onAvatarUpdated?.(publicUrl)
    } catch (err) {
      console.error('Error:', err)
      setError('Erro ao processar foto')
      setPreview(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          preview ||
          currentAvatar ||
          getDefaultAvatar(getCurrentUser()?.id || 'default')
        }
        alt="Avatar"
        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
      />

      {/* Upload Button */}
      <label className="absolute bottom-0 right-0 bg-primary-300 rounded-full p-1.5 cursor-pointer hover:bg-primary-400 transition-colors shadow-md">
        <Camera size={14} className="text-white" />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
          aria-label="Enviar foto de perfil"
        />
      </label>

      {/* Status Messages */}
      {error && (
        <div className="absolute top-full left-0 mt-2 bg-accent-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  )
}
