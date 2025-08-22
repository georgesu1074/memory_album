'use client'

import { useState, useEffect } from 'react'
import { X, Camera, Image, CheckCircle } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import GuestDropdown from './GuestDropdown'

interface FormData {
  memoryType: 'bride' | 'groom' | 'both'
  guestId: string | null
  guestName: string
  memoryText: string
  photos: File[]
}

interface Guest {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
}

interface MemorySubmissionModalProps {
  weddingSlug: string
  guests: Guest[]
  isOpen: boolean
  onClose: () => void
  onMemoryAdded?: () => void
}

export default function MemorySubmissionModal({ weddingSlug, guests, isOpen, onClose, onMemoryAdded }: MemorySubmissionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    memoryType: 'both',
    guestId: null,
    guestName: '',
    memoryText: '',
    photos: []
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)

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

  if (!isOpen) return null

  const handleShareAnother = () => {
    setShowSuccess(false)
    setError(null)
  }

  const handleClose = () => {
    setShowSuccess(false)
    setError(null)
    onClose()
  }
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5)
    
    setIsCompressing(true)
    
    // Compress images before storing
    const compressedFiles: File[] = []
    for (const file of files) {
      try {
        const options = {
          maxSizeMB: 1, // Max 1MB per image
          maxWidthOrHeight: 1920, // Max 1920px dimension
          useWebWorker: true,
          fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp'
        }
        
        const compressedFile = await imageCompression(file, options)
        console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
        
        // Keep original filename
        const renamedFile = new File([compressedFile], file.name, {
          type: compressedFile.type,
          lastModified: Date.now()
        })
        compressedFiles.push(renamedFile)
      } catch (error) {
        console.error('Error compressing image:', error)
        // If compression fails, use original file
        compressedFiles.push(file)
      }
    }
    
    setFormData({ ...formData, photos: compressedFiles })
    setIsCompressing(false)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create FormData to handle file uploads
      const submitData = new FormData()
      submitData.append('memoryType', formData.memoryType)
      submitData.append('guestId', formData.guestId || '')
      submitData.append('guestName', formData.guestName)
      submitData.append('memoryText', formData.memoryText)
      
      // Add photos to FormData
      formData.photos.forEach((photo, index) => {
        submitData.append(`photo_${index}`, photo)
      })

      const response = await fetch(`/api/weddings/${weddingSlug}/memories`, {
        method: 'POST',
        body: submitData, // No Content-Type header needed for FormData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save memory')
      }

      // Success! Show success screen
      console.log('Memory saved successfully:', data)
      setShowSuccess(true)
      
      // Reset form for next submission
      setFormData({
        memoryType: 'both',
        guestId: null,
        guestName: '',
        memoryText: '',
        photos: []
      })
      
      // Notify parent to refresh memories
      if (onMemoryAdded) {
        onMemoryAdded()
      }
      
    } catch (err) {
      console.error('Error submitting memory:', err)
      setError(err instanceof Error ? err.message : 'Failed to save memory')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '100%',
        overflow: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            {showSuccess ? 'Memory Shared!' : 'Share a Memory'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Success Screen */}
        {showSuccess ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle style={{ 
              width: '64px', 
              height: '64px', 
              color: '#10b981',
              margin: '0 auto 20px'
            }} />
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#111827'
            }}>
              Thank you for sharing!
            </h3>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280',
              marginBottom: '32px'
            }}>
              Your memory has been saved and will be treasured forever.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleShareAnother}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: 'white',
                  backgroundColor: '#8b5cf6',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
              >
                Share Another Memory
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '14px',
                  color: '#374151',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {/* Memory Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              Who is this memory about?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, memoryType: 'bride' })}
                style={{
                  padding: '8px 12px',
                  border: '2px solid',
                  borderColor: formData.memoryType === 'bride' ? '#8b5cf6' : '#e5e7eb',
                  backgroundColor: formData.memoryType === 'bride' ? '#f3e8ff' : 'white',
                  color: formData.memoryType === 'bride' ? '#7c3aed' : '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Bride
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, memoryType: 'groom' })}
                style={{
                  padding: '8px 12px',
                  border: '2px solid',
                  borderColor: formData.memoryType === 'groom' ? '#8b5cf6' : '#e5e7eb',
                  backgroundColor: formData.memoryType === 'groom' ? '#f3e8ff' : 'white',
                  color: formData.memoryType === 'groom' ? '#7c3aed' : '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Groom
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, memoryType: 'both' })}
                style={{
                  padding: '8px 12px',
                  border: '2px solid',
                  borderColor: formData.memoryType === 'both' ? '#8b5cf6' : '#e5e7eb',
                  backgroundColor: formData.memoryType === 'both' ? '#f3e8ff' : 'white',
                  color: formData.memoryType === 'both' ? '#7c3aed' : '#374151',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Both
              </button>
            </div>
          </div>
          
          {/* Guest Name Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: '#374151'
              }}
            >
              Your name
            </label>
            <GuestDropdown
              guests={guests}
              value={formData.guestName}
              guestId={formData.guestId}
              onChange={(name, guestId) => setFormData({ ...formData, guestName: name, guestId })}
              required
            />
          </div>
          
          {/* Memory Text */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="memoryText"
              style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: '#374151'
              }}
            >
              Your memory
            </label>
            <textarea
              id="memoryText"
              required
              rows={4}
              placeholder="Share your favorite memory, story, or well wishes..."
              value={formData.memoryText}
              onChange={(e) => setFormData({ ...formData, memoryText: e.target.value })}
              maxLength={1000}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'inherit',
                color: '#1f2937',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <p style={{
              marginTop: '4px',
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'right'
            }}>
              {formData.memoryText.length}/1000
            </p>
          </div>
          
          {/* Photo Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '4px',
              color: '#374151'
            }}>
              Add photos (optional)
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              >
                <Camera style={{ 
                  margin: '0 auto',
                  height: '32px',
                  width: '32px',
                  color: '#9ca3af'
                }} />
                <p style={{
                  marginTop: '4px',
                  marginBottom: '0',
                  fontSize: '14px',
                  color: '#4b5563'
                }}>
                  Tap to add photos
                </p>
                <p style={{
                  marginTop: '4px',
                  marginBottom: '0',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Up to 5 photos, 10MB each
                </p>
              </div>
            </label>
            
            {/* Show compression indicator */}
            {isCompressing && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#92400e',
                textAlign: 'center'
              }}>
                Compressing photos...
              </div>
            )}
            
            {/* Show selected photos */}
            {formData.photos.length > 0 && !isCompressing && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {formData.photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Image style={{
                        height: '32px',
                        width: '32px',
                        color: '#9ca3af'
                      }} />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPhotos = [...formData.photos]
                        newPhotos.splice(index, 1)
                        setFormData({ ...formData, photos: newPhotos })
                      }}
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '16px',
              color: 'white',
              backgroundColor: isSubmitting ? '#9ca3af' : '#8b5cf6',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#7c3aed')}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#8b5cf6')}
          >
            {isSubmitting ? 'Sharing...' : 'Share Memory'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}