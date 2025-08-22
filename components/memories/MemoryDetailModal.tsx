'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Calendar, User, Share2, Link, Check } from 'lucide-react'
import PhotoCarousel from './PhotoCarousel'
import PhotoLightbox from './PhotoLightbox'

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

interface Category {
  id: string
  name: string
  summary: string | null
  memory_count: number
  memory_type: 'bride' | 'groom' | 'both' | null
  memories?: Memory[]
}

interface MemoryDetailModalProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
}

export default function MemoryDetailModal({ category, isOpen, onClose }: MemoryDetailModalProps) {
  const [selectedMemoryIndex, setSelectedMemoryIndex] = useState<number | null>(null)
  const [showCopied, setShowCopied] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxPhotos, setLightboxPhotos] = useState<any[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !category) return null

  // Get all photos from all memories
  const allPhotos = category.memories?.flatMap(m => 
    m.memory_photos?.map(p => ({
      ...p,
      memoryId: m.id,
      guestName: m.guest_name || m.wedding_guests?.full_name || 'Anonymous'
    })) || []
  ) || []

  const selectedMemory = selectedMemoryIndex !== null && category.memories 
    ? category.memories[selectedMemoryIndex] 
    : null

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${category.id}`
    const shareText = `Check out these ${category.name} memories from our wedding!`
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: category.name,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[90vw] md:max-w-5xl bg-white md:rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
              {category.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {category.memory_count} {category.memory_count === 1 ? 'memory' : 'memories'} from {
                category.memories ? new Set(category.memories.map(m => 
                  m.guest_name || m.wedding_guests?.full_name || 'Anonymous'
                )).size : 0
              } {category.memories && new Set(category.memories.map(m => 
                m.guest_name || m.wedding_guests?.full_name || 'Anonymous'
              )).size === 1 ? 'person' : 'people'}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              aria-label="Share"
            >
              {showCopied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Share2 className="h-5 w-5 text-gray-500" />
              )}
              {showCopied && (
                <span className="absolute -bottom-8 right-0 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo Carousel Section */}
          {allPhotos.length > 0 && (
            <div className="bg-gray-50">
              <PhotoCarousel photos={allPhotos} />
            </div>
          )}

          {/* Category Summary */}
          {category.summary && (
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-b">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Our Story</h3>
              <p className="text-gray-700 leading-relaxed">{category.summary}</p>
            </div>
          )}

          {/* Memory Entries */}
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Journal Entries</h3>
            <div className="space-y-4">
              {category.memories?.map((memory, index) => (
                <div
                  key={memory.id}
                  className={`bg-white border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
                    selectedMemoryIndex === index ? 'ring-2 ring-purple-500 shadow-md' : ''
                  }`}
                  onClick={() => setSelectedMemoryIndex(
                    selectedMemoryIndex === index ? null : index
                  )}
                >
                  {/* Memory Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(memory.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="font-medium">
                          {memory.guest_name || memory.wedding_guests?.full_name || 'Anonymous'}
                        </span>
                      </div>
                    </div>
                    {memory.memory_type && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium
                        ${memory.memory_type === 'bride' ? 'bg-pink-100 text-pink-700' :
                          memory.memory_type === 'groom' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'}`}
                      >
                        {memory.memory_type === 'both' ? 'Together' : 
                         memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                      </span>
                    )}
                  </div>

                  {/* Memory Text */}
                  <p className={`text-gray-700 leading-relaxed ${
                    selectedMemoryIndex === index ? '' : 'line-clamp-3'
                  }`}>
                    {memory.memory_text}
                  </p>

                  {/* Photo Thumbnails (if this memory has photos) */}
                  {memory.memory_photos && memory.memory_photos.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {memory.memory_photos.map((photo, photoIndex) => (
                        <img
                          key={photo.id}
                          src={photo.thumbnail_url || photo.url}
                          alt=""
                          className="h-16 w-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Open this memory's photos in lightbox
                            setLightboxPhotos(memory.memory_photos || [])
                            setLightboxIndex(photoIndex)
                            setLightboxOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Expand/Collapse indicator */}
                  {memory.memory_text.length > 200 && (
                    <button className="text-sm text-purple-600 mt-2 font-medium">
                      {selectedMemoryIndex === index ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Photo Lightbox for individual memory photos */}
      <PhotoLightbox
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}