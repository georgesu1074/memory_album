'use client'

import { useState, useCallback } from 'react'
import { Plus, Users } from 'lucide-react'
import MemorySubmissionModal from './MemorySubmissionModal'
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
  const [showGuestList, setShowGuestList] = useState(false)

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

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: wedding.theme_color }}>
                  {wedding.couple_names}
                </h1>
                <p className="text-sm text-gray-600">{wedding.wedding_date || 'Wedding Date TBD'}</p>
              </div>
              <div className="flex gap-2">
                {/* Guest List Toggle - Mobile Only */}
                <button
                  onClick={() => setShowGuestList(!showGuestList)}
                  className="md:hidden bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                  aria-label="Toggle guest list"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Guest List</span>
                </button>
                {/* Share Memory Button - Desktop Only */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="hidden md:flex bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Share Memory
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guest List Drawer - Mobile */}
        {showGuestList && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowGuestList(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Guest List ({guests?.length || 0})</h2>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-20">
                <div className="space-y-2">
                  {guests?.map((guest) => (
                    <div key={guest.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                      {guest.full_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="md:flex md:gap-6 md:p-6 md:max-w-7xl md:mx-auto">
          {/* Guest List - Desktop Only */}
          <div className="hidden md:block md:w-64 lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-3">Guest List ({guests?.length || 0})</h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {guests?.map((guest) => (
                  <div key={guest.id} className="text-sm p-2 bg-gray-50 rounded">
                    {guest.full_name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Memory Grid */}
          <div className="flex-1">
            <MemoryGrid 
              memories={memories}
              isLoading={isLoadingMemories}
              onRefresh={refreshMemories}
              weddingSlug={weddingSlug}
              themeColor={wedding.theme_color}
            />
          </div>
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