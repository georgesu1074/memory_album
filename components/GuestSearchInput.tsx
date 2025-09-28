'use client'

import { useState, useEffect, useRef } from 'react'

interface Guest {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
}

interface GuestSearchInputProps {
  weddingSlug: string
  value: string
  guestId: string | null
  onChange: (name: string, guestId: string | null) => void
  required?: boolean
}

export default function GuestSearchInput({ 
  weddingSlug, 
  value, 
  guestId,
  onChange, 
  required = false 
}: GuestSearchInputProps) {
  const [suggestions, setSuggestions] = useState<Guest[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search for guests when input changes
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Don't search if input is empty or we have a selected guest
    if (!value || value.length < 2 || guestId) {
      setSuggestions([])
      return
    }

    // Debounce the search
    debounceTimer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/weddings/${weddingSlug}/guests/search?q=${encodeURIComponent(value)}`
        )
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.guests || [])
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Error searching guests:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value, weddingSlug, guestId])

  const selectGuest = (guest: Guest) => {
    onChange(guest.full_name, guest.id)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue, null) // Clear guest ID when typing
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        selectGuest(suggestions[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        required={required}
        placeholder="Start typing to search..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: guestId ? '#f3f4f6' : 'white',
          color: '#111827'
        }}
        onFocusCapture={(e) => e.target.style.borderColor = '#8b5cf6'}
        onBlurCapture={(e) => e.target.style.borderColor = '#d1d5db'}
      />
      
      {/* Guest selected indicator */}
      {guestId && (
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#10b981',
          fontWeight: '500'
        }}>
          ✓ Guest found
        </span>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {suggestions.map((guest, index) => (
            <div
              key={guest.id}
              onClick={() => selectGuest(guest)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: index === selectedIndex ? '#f3f4f6' : 'white',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
                setSelectedIndex(index)
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.backgroundColor = 'white'
                }
              }}
            >
              <div style={{ fontWeight: '500', fontSize: '14px', color: '#111827' }}>
                {guest.full_name}
              </div>
              {guest.email && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                  {guest.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          Searching...
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && value.length >= 2 && suggestions.length === 0 && !guestId && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          padding: '12px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          No guests found. You can still enter your name manually.
        </div>
      )}
    </div>
  )
}