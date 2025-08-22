'use client'

import { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import MemorySubmissionModal from './MemorySubmissionModal'

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
  const [activeTab, setActiveTab] = useState<'all' | 'bride' | 'groom' | 'together'>('all')

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

  // Filter memories based on active tab
  const filteredMemories = activeTab === 'all' 
    ? memories 
    : memories.filter(m => {
        const type = m.memory_type?.toLowerCase()
        if (activeTab === 'together') return type === 'both'
        return type === activeTab
      })

  // Calculate counts
  const counts = {
    all: memories.length,
    bride: memories.filter(m => m.memory_type?.toLowerCase() === 'bride').length,
    groom: memories.filter(m => m.memory_type?.toLowerCase() === 'groom').length,
    together: memories.filter(m => m.memory_type?.toLowerCase() === 'both').length,
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

        {/* Memory Grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {filteredMemories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemories.map((memory) => (
                <div key={memory.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  {/* Image Section */}
                  <div className="aspect-[4/3] relative bg-gray-100">
                    {memory.memory_photos && memory.memory_photos.length > 0 ? (
                      <img 
                        src={memory.memory_photos[0].url}
                        alt="Memory"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Cpath d="M200 120c-8.8 0-16 7.2-16 16s7.2 16 16 16 16-7.2 16-16-7.2-16-16-16zm0-20c-19.9 0-36 16.1-36 36s16.1 36 36 36 36-16.1 36-36-16.1-36-36-36zm0-20c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56z" fill="%23d1d5db"/%3E%3C/svg%3E'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {memory.memory_photos && memory.memory_photos.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        +{memory.memory_photos.length - 1}
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4">
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {memory.ai_summary || memory.memory_text}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">
                        {memory.wedding_guests?.full_name || memory.guest_name}
                      </span>
                      {memory.created_at && (
                        <span className="ml-2">
                          {new Date(memory.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
        onMemoryAdded={refreshMemories}
      />
    </>
  )
}