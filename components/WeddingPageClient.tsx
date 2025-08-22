'use client'

import { useState, useCallback } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import MemorySubmissionModal from './MemorySubmissionModal'
import CategoryCard from './memories/CategoryCard'
import MemoryGrid from './memories/MemoryGrid'

interface Guest {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
}

interface WeddingPageClientProps {
  wedding: any
  guests: Guest[]
  memories: any[]
  weddingSlug: string
}

export default function WeddingPageClient({ wedding, guests, memories: initialMemories, weddingSlug }: WeddingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [memories, setMemories] = useState(initialMemories)
  const [isLoadingMemories, setIsLoadingMemories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'bride' | 'groom' | 'both' | null>(null)

  const refreshMemories = useCallback(async () => {
    setIsLoadingMemories(true)
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/memories`)
      if (response.ok) {
        const data = await response.json()
        setMemories(data.memories)
      }
    } catch (error) {
      console.error('Error refreshing memories:', error)
    } finally {
      setIsLoadingMemories(false)
    }
  }, [weddingSlug])

  // Calculate total memories
  const totalMemories = memories.length
  const categories: Array<'bride' | 'groom' | 'both'> = ['bride', 'groom', 'both']

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-purple-100">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {wedding.couple_names}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {wedding.wedding_date || 'Wedding Date TBD'}
                </p>
              </div>
              {/* Share Memory Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Share Memory</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedCategory === null ? (
          /* Category Cards View */
          <div className="px-4 py-8 max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                Memory Album
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {totalMemories > 0 
                  ? `${totalMemories} beautiful ${totalMemories === 1 ? 'memory' : 'memories'} shared by our loved ones`
                  : 'Share your favorite memories with the happy couple'}
              </p>
            </div>
            
            {/* Category Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category}
                  category={category}
                  memories={memories}
                  onClick={() => setSelectedCategory(category)}
                  themeColor={wedding.theme_color}
                />
              ))}
            </div>
            
            {/* Stats Section */}
            {totalMemories > 0 && (
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalMemories}</div>
                  <div className="text-sm text-gray-600">Total Memories</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {memories.filter(m => m.memory_photos?.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">With Photos</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {guests?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Guests</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {memories.filter(m => m.memory_type).length}
                  </div>
                  <div className="text-sm text-gray-600">Categorized</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Memory Grid View for Selected Category */
          <div className="relative">
            {/* Back Button */}
            <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
              <div className="px-4 py-3 flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Back to categories"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-lg font-semibold capitalize">
                  {selectedCategory === 'both' ? 'Together' : selectedCategory} Memories
                </h2>
              </div>
            </div>
            <MemoryGrid 
              memories={memories.filter(m => m.memory_type?.toLowerCase() === selectedCategory.toLowerCase())}
              isLoading={isLoadingMemories}
              onRefresh={refreshMemories}
              weddingSlug={weddingSlug}
              themeColor={wedding.theme_color}
            />
          </div>
        )}
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
        onMemoryAdded={refreshMemories}
      />
    </>
  )
}