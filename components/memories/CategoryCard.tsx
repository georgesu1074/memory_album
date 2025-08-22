'use client'

import { useState } from 'react'
import { Heart, Users, User } from 'lucide-react'

interface CategoryCardProps {
  category: 'bride' | 'groom' | 'both'
  memories: any[]
  onClick: () => void
  themeColor?: string
}

export default function CategoryCard({ 
  category, 
  memories, 
  onClick,
  themeColor = '#8B5CF6'
}: CategoryCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  // Get category-specific data
  const categoryMemories = memories.filter(m => 
    m.memory_type?.toLowerCase() === category.toLowerCase()
  )
  
  const count = categoryMemories.length
  
  // Get the best photo (first photo from most recent memory)
  const bestPhoto = categoryMemories
    .filter(m => m.memory_photos?.length > 0)
    .map(m => m.memory_photos[0])[0]
  
  // Get AI summary for the category (from most recent memory with summary)
  const summary = categoryMemories
    .find(m => m.ai_summary)?.ai_summary || 
    categoryMemories[0]?.memory_text?.substring(0, 150) ||
    `Beautiful memories about the ${category === 'both' ? 'couple' : category}`
  
  // Truncate summary for card display
  const truncatedSummary = summary.length > 120 
    ? summary.substring(0, 120) + '...'
    : summary
  
  // Category config
  const categoryConfig = {
    bride: {
      title: 'Bride',
      subtitle: "Memories of the bride",
      icon: User,
      gradient: 'from-pink-500 to-rose-600',
      lightGradient: 'from-pink-50 to-rose-50',
      iconColor: 'text-pink-500',
      borderColor: 'border-pink-200'
    },
    groom: {
      title: 'Groom',
      subtitle: "Memories of the groom",
      icon: User,
      gradient: 'from-blue-500 to-indigo-600',
      lightGradient: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    },
    both: {
      title: 'Together',
      subtitle: "Memories of the couple",
      icon: Heart,
      gradient: 'from-purple-500 to-pink-600',
      lightGradient: 'from-purple-50 to-pink-50',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200'
    }
  }
  
  const config = categoryConfig[category]
  const Icon = config.icon
  
  if (count === 0) {
    // Empty state card
    return (
      <div 
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed
          ${config.borderColor} bg-gradient-to-br ${config.lightGradient}
          p-6 cursor-pointer transition-all duration-300
          hover:border-solid hover:shadow-lg
        `}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Icon className={`h-12 w-12 ${config.iconColor} mb-3 opacity-50`} />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">
            No {config.title} Memories Yet
          </h3>
          <p className="text-sm text-gray-500">
            Be the first to share a memory
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl shadow-lg cursor-pointer
        transform transition-all duration-300 
        ${isPressed ? 'scale-95' : 'hover:scale-[1.02] hover:shadow-xl'}
      `}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      role="button"
      tabIndex={0}
    >
      {/* Background Image or Gradient */}
      <div className="relative h-64 sm:h-72">
        {bestPhoto ? (
          <>
            <img 
              src={bestPhoto.url}
              alt={`${config.title} memories`}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`} />
        )}
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{config.title}</span>
          </div>
        </div>
        
        {/* Memory Count */}
        <div className="absolute top-4 right-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-white text-sm font-semibold">
              {count} {count === 1 ? 'memory' : 'memories'}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">
            {config.subtitle}
          </h3>
          <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
            {truncatedSummary}
          </p>
        </div>
      </div>
    </div>
  )
}