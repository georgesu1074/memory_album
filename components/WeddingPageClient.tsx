'use client'

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
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

  const refreshCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      // For now, we'll reload the page to get fresh data
      // In the future, we could create an API endpoint for categories
      window.location.reload()
    } catch (error) {
      console.error('Error refreshing categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }, [weddingSlug])

  // Filter categories based on active tab
  const filteredCategories = activeTab === 'all' 
    ? categories 
    : categories.filter(c => {
        const type = c.memory_type?.toLowerCase()
        if (activeTab === 'together') return type === 'both'
        return type === activeTab
      })

  // Calculate counts
  const counts = {
    all: categories.length,
    bride: categories.filter(c => c.memory_type?.toLowerCase() === 'bride').length,
    groom: categories.filter(c => c.memory_type?.toLowerCase() === 'groom').length,
    together: categories.filter(c => c.memory_type?.toLowerCase() === 'both').length,
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {filteredCategories.length > 0 ? (
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