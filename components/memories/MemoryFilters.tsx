'use client'

import { useRef, useEffect } from 'react'

interface MemoryFiltersProps {
  filter: 'all' | 'bride' | 'groom' | 'both'
  onFilterChange: (filter: 'all' | 'bride' | 'groom' | 'both') => void
  counts: {
    all: number
    bride: number
    groom: number
    both: number
  }
  themeColor?: string
}

export default function MemoryFilters({ 
  filter, 
  onFilterChange, 
  counts,
  themeColor = '#8B5CF6' 
}: MemoryFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to selected filter on mobile
  useEffect(() => {
    if (scrollRef.current && filter !== 'all') {
      const activeButton = scrollRef.current.querySelector(`[data-filter="${filter}"]`)
      activeButton?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [filter])

  const filters = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'bride', label: 'Bride', count: counts.bride },
    { id: 'groom', label: 'Groom', count: counts.groom },
    { id: 'both', label: 'Both', count: counts.both },
  ] as const

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-gray-100">
      <div 
        ref={scrollRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        } as React.CSSProperties}
      >
        {filters.map((item) => (
          <button
            key={item.id}
            data-filter={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
              whitespace-nowrap transition-all duration-200 transform active:scale-95
              ${filter === item.id 
                ? 'text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            style={{
              backgroundColor: filter === item.id ? themeColor : undefined,
              minHeight: '44px', // iOS touch target minimum
            }}
            aria-pressed={filter === item.id}
            aria-label={`Filter by ${item.label}, ${item.count} memories`}
          >
            <span>{item.label}</span>
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-semibold
              ${filter === item.id 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}