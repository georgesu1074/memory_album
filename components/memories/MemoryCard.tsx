'use client'

import { useState } from 'react'
import { User, Calendar, Heart } from 'lucide-react'
import Image from 'next/image'

interface Memory {
  id: string
  guest_name: string
  memory_text: string
  memory_photos: any[]
  memory_type: string | null
  ai_category: string | null
  ai_summary: string | null
  created_at: string
  wedding_guests?: {
    full_name: string
  }
}

interface MemoryCardProps {
  memory: Memory
  weddingSlug: string
  themeColor?: string
  onClick?: () => void
}

export default function MemoryCard({ 
  memory, 
  weddingSlug, 
  themeColor = '#8B5CF6',
  onClick 
}: MemoryCardProps) {
  const [imageError, setImageError] = useState(false)
  const guestName = memory.wedding_guests?.full_name || memory.guest_name || 'Anonymous'
  const firstPhoto = memory.memory_photos?.[0]
  const photoCount = memory.memory_photos?.length || 0
  
  // Truncate text for card display
  const truncatedText = memory.memory_text.length > 80 
    ? memory.memory_text.substring(0, 80) + '...'
    : memory.memory_text

  // Format date for display
  const formattedDate = new Date(memory.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  // Get category badge color
  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'bride':
        return 'bg-[#fdf0f2] text-[#8b4759]'
      case 'groom':
        return 'bg-blue-100 text-blue-700'
      case 'both':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      {/* Image or placeholder */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {firstPhoto && !imageError ? (
          <>
            <img
              src={firstPhoto.url}
              alt="Memory"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            {/* Photo count indicator */}
            {photoCount > 1 && (
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                +{photoCount - 1}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-gray-50">
            <Heart className="h-12 w-12 text-[#e8b4c2]" />
          </div>
        )}
        
        {/* Category badge */}
        {memory.memory_type && (
          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${getCategoryColor(memory.memory_type)}`}>
            {memory.memory_type === 'both' ? 'Together' : memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Memory text */}
        <p className="text-sm text-gray-700 mb-2 line-clamp-3">
          {truncatedText}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 truncate">
            <User className="h-3 w-3" />
            <span className="truncate">{guestName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}