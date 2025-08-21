'use client'

import { useState } from 'react'
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

export default function WeddingPageClient({ wedding, guests, memories, weddingSlug }: WeddingPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Share Memory Button */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: wedding.theme_color }}>
                  {wedding.couple_names}
                </h1>
                <p className="text-gray-600">Wedding Date: {wedding.wedding_date || 'TBD'}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Share Memory
              </button>
            </div>
          </div>

          {/* Guest List */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Guest List ({guests?.length || 0})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {guests?.map((guest) => (
                <div key={guest.id} className="text-sm p-2 bg-gray-50 rounded">
                  {guest.full_name}
                </div>
              ))}
            </div>
          </div>

          {/* Memories */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Memories ({memories?.length || 0})</h2>
            {memories?.length > 0 ? (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="border-l-4 border-purple-500 pl-4">
                    <p className="text-gray-800 mb-2">{memory.memory_text}</p>
                    <p className="text-sm text-gray-500">
                      - {memory.wedding_guests?.full_name || memory.guest_name || 'Anonymous'}
                      {memory.ai_category && ` • ${memory.ai_category}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No memories shared yet</p>
                <p className="text-sm">Be the first to share a memory!</p>
              </div>
            )}
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
      />
    </>
  )
}