'use client'

import { useState } from 'react'
import { Users, Camera } from 'lucide-react'

interface Memory {
  id: string
  memory_text: string
  guest_name: string | null
  memory_type: string
  created_at: string
  wedding_guests?: {
    full_name: string
  } | null
  memory_photos?: {
    id: string
    url: string
    thumbnail_url: string | null
  }[]
}

interface CategoryCardProps {
  category: {
    id: string
    name: string
    summary: string | null
    memory_count: number
    memory_type: 'bride' | 'groom' | 'both' | null
    memories?: Memory[]
  }
  onClick?: () => void
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Get all photos from all memories in this category
  const allPhotos = category.memories?.flatMap(m => m.memory_photos || []) || []
  const mainPhoto = allPhotos[0]
  const photoCount = allPhotos.length
  
  // Get contributor count (unique guest names)
  const contributors = new Set(
    category.memories?.map(m => m.guest_name || m.wedding_guests?.full_name || 'Anonymous') || []
  )
  const contributorCount = contributors.size
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group"
    >
      {/* Image Section */}
      <div className="aspect-[4/3] relative bg-gray-100">
        {mainPhoto && !imageError ? (
          <img 
            src={mainPhoto.thumbnail_url || mainPhoto.url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 rounded-full mb-2">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">No photos yet</p>
            </div>
          </div>
        )}
        
        {/* Photo count badge */}
        {photoCount > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" />
            {photoCount}
          </div>
        )}
        
        {/* Memory type badge */}
        {category.memory_type && (
          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium
            ${category.memory_type === 'bride' ? 'bg-pink-500/90 text-white' :
              category.memory_type === 'groom' ? 'bg-blue-500/90 text-white' :
              'bg-purple-500/90 text-white'}`}
          >
            {category.memory_type === 'both' ? 'Together' : 
             category.memory_type.charAt(0).toUpperCase() + category.memory_type.slice(1)}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {category.name}
        </h3>
        
        {category.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {category.summary}
          </p>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{contributorCount} {contributorCount === 1 ? 'person' : 'people'}</span>
          </div>
          <div>
            {category.memory_count} {category.memory_count === 1 ? 'memory' : 'memories'}
          </div>
        </div>
      </div>
    </div>
  )
}