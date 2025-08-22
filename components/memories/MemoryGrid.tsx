'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import MemoryCard from './MemoryCard'
import MemoryFilters from './MemoryFilters'
import LoadingSkeleton from './LoadingSkeleton'
import { RefreshCw } from 'lucide-react'

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

interface MemoryGridProps {
  memories: Memory[]
  isLoading?: boolean
  onRefresh?: () => Promise<void>
  weddingSlug: string
  themeColor?: string
}

export default function MemoryGrid({ 
  memories: initialMemories, 
  isLoading = false,
  onRefresh,
  weddingSlug,
  themeColor = '#8B5CF6'
}: MemoryGridProps) {
  const [memories, setMemories] = useState(initialMemories)
  const [filter, setFilter] = useState<'all' | 'bride' | 'groom' | 'both'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update memories when props change
  useEffect(() => {
    setMemories(initialMemories)
  }, [initialMemories])

  // Filter memories based on selected category
  const filteredMemories = memories.filter(memory => {
    if (filter === 'all') return true
    return memory.memory_type?.toLowerCase() === filter
  })

  // Memory counts for each category
  const counts = {
    all: memories.length,
    bride: memories.filter(m => m.memory_type?.toLowerCase() === 'bride').length,
    groom: memories.filter(m => m.memory_type?.toLowerCase() === 'groom').length,
    both: memories.filter(m => m.memory_type?.toLowerCase() === 'both').length,
  }

  // Pull-to-refresh implementation for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart(touch.clientY)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return
    
    const touch = e.touches[0]
    const distance = touch.clientY - touchStart
    
    // Only trigger if pulling down from the top
    if (containerRef.current.scrollTop === 0 && distance > 0) {
      e.preventDefault()
      setPullDistance(Math.min(distance, 100))
    }
  }, [touchStart])

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60 && onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
  }, [pullDistance, onRefresh])

  return (
    <div className="relative">
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center bg-white/90 backdrop-blur-sm z-10 transition-all"
          style={{ 
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 60, 1)
          }}
        >
          <RefreshCw 
            className={`h-6 w-6 text-[#d4899f] ${pullDistance > 60 ? 'animate-spin' : ''}`}
          />
        </div>
      )}

      <div 
        ref={containerRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {/* Filters */}
        <MemoryFilters 
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          themeColor={themeColor}
        />

        {/* Memory count */}
        <div className="px-4 py-2 text-sm text-gray-600">
          {filteredMemories.length} {filteredMemories.length === 1 ? 'memory' : 'memories'}
        </div>

        {/* Loading state */}
        {isLoading || isRefreshing ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-4 pb-4">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredMemories.length > 0 ? (
          /* Memory Grid - Mobile-first responsive design */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 px-4 pb-4">
            {filteredMemories.map((memory) => (
              <MemoryCard 
                key={memory.id}
                memory={memory}
                weddingSlug={weddingSlug}
                themeColor={themeColor}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 mb-2">
              {filter === 'all' 
                ? 'No memories shared yet' 
                : `No ${filter} memories yet`}
            </p>
            <p className="text-sm text-gray-400">
              Be the first to share a memory!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}