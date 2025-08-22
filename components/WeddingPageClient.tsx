'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import MemorySubmissionModal from './MemorySubmissionModal'
import CategoryCard from './memories/CategoryCard'
import MemoryDetailModal from './memories/MemoryDetailModal'

interface Guest {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
}

interface Category {
  id: string
  name: string
  summary: string | null
  memory_count: number
  memory_type: 'bride' | 'groom' | 'both' | null
  memories?: any[]
}

interface WeddingPageClientProps {
  wedding: any
  guests: Guest[]
  categories: Category[]
  weddingSlug: string
}

export default function WeddingPageClient({ wedding, guests, categories: initialCategories, weddingSlug }: WeddingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categories, setCategories] = useState(initialCategories)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'bride' | 'groom' | 'together'>('all')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)
  const [totalCounts, setTotalCounts] = useState({
    all: 0,
    bride: 0,
    groom: 0,
    together: 0
  })
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const pullStartY = useRef<number | null>(null)
  
  // Fetch total counts on mount
  useEffect(() => {
    fetchTotalCounts()
  }, [])
  
  const fetchTotalCounts = async () => {
    try {
      // Fetch total counts for all tabs
      const response = await fetch(`/api/weddings/${weddingSlug}/categories/counts`)
      if (response.ok) {
        const counts = await response.json()
        setTotalCounts(counts)
      }
    } catch (error) {
      console.error('Error fetching total counts:', error)
    }
  }

  // Load more categories for infinite scroll
  const loadMoreCategories = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      const response = await fetch(
        `/api/weddings/${weddingSlug}/categories?offset=${categories.length}&limit=6&type=${activeTab}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setCategories(prev => [...prev, ...data.categories])
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Error loading more categories:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [weddingSlug, categories.length, activeTab, isLoadingMore, hasMore])

  // Refresh categories (for pull-to-refresh and after memory submission)
  const refreshCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const response = await fetch(
        `/api/weddings/${weddingSlug}/categories?offset=0&limit=6&type=${activeTab}`
      )
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
        setHasMore(data.hasMore)
        // Also refresh total counts
        fetchTotalCounts()
      }
    } catch (error) {
      console.error('Error refreshing categories:', error)
    } finally {
      setIsLoadingCategories(false)
      setIsPullRefreshing(false)
    }
  }, [weddingSlug, activeTab])

  // Filter categories based on active tab
  const filteredCategories = activeTab === 'all' 
    ? categories 
    : categories.filter(c => {
        const type = c.memory_type?.toLowerCase()
        if (activeTab === 'together') return type === 'both'
        return type === activeTab
      })

  // We now use totalCounts from the API instead of calculating from loaded categories

  // Set up infinite scroll observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreCategories()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loadMoreCategories])

  // Reset when tab changes
  useEffect(() => {
    setIsLoadingCategories(true) // Show loading state immediately
    setCategories([])
    setHasMore(true)
    refreshCategories()
  }, [activeTab])

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    pullStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullStartY.current) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - pullStartY.current
    
    // If pulled down more than 100px and at the top of the page
    if (diff > 100 && window.scrollY === 0 && !isPullRefreshing) {
      setIsPullRefreshing(true)
      refreshCategories()
    }
  }

  const handleTouchEnd = () => {
    pullStartY.current = null
  }

  return (
    <>
      <div 
        className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {isPullRefreshing && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-white rounded-full shadow-lg p-3">
            <RefreshCw className="h-5 w-5 text-purple-600 animate-spin" />
          </div>
        )}
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {wedding.couple_names}
                </h1>
                <p className="text-sm text-gray-500">
                  {wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : 'Wedding Date TBD'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Share Memory
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex space-x-8">
              {(['all', 'bride', 'groom', 'together'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    py-3 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab 
                      ? tab === 'all' ? 'border-purple-600 text-purple-600' :
                        tab === 'bride' ? 'border-pink-500 text-pink-600' :
                        tab === 'groom' ? 'border-blue-500 text-blue-600' :
                        'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({totalCounts[tab]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {isLoadingCategories && filteredCategories.length === 0 ? (
            // Loading state when switching tabs or initial load
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard 
                  key={category.id} 
                  category={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setIsDetailModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {activeTab === 'all' 
                  ? 'No memories shared yet' 
                  : `No ${activeTab === 'together' ? 'couple' : activeTab} memories yet`}
              </p>
              <p className="text-sm text-gray-400">Be the first to share a memory!</p>
            </div>
          )}
          
          {/* Infinite scroll trigger */}
          {filteredCategories.length > 0 && (
            <div 
              ref={loadMoreRef} 
              className="h-20 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!hasMore && filteredCategories.length > 0 && (
                <p className="text-sm text-gray-400">No more memories to load</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 md:hidden"
        aria-label="Share Memory"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Memory Submission Modal */}
      <MemorySubmissionModal
        weddingSlug={weddingSlug}
        guests={guests}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemoryAdded={refreshCategories}
      />

      {/* Memory Detail Modal */}
      <MemoryDetailModal
        category={selectedCategory}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedCategory(null)
        }}
      />
    </>
  )
}