'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface Guest {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
}

interface GuestDropdownProps {
  guests: Guest[]
  value: string
  guestId: string | null
  onChange: (name: string, guestId: string | null) => void
  required?: boolean
}

export default function GuestDropdown({ 
  guests, 
  value, 
  guestId,
  onChange, 
  required = false 
}: GuestDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(guests)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter guests based on input value
  useEffect(() => {
    if (!value) {
      setFilteredGuests(guests)
    } else {
      const query = value.toLowerCase()
      const filtered = guests.filter(guest => 
        guest.full_name.toLowerCase().includes(query) ||
        guest.first_name.toLowerCase().includes(query) ||
        guest.last_name.toLowerCase().includes(query)
      )
      setFilteredGuests(filtered)
    }
    setSelectedIndex(-1)
  }, [value, guests])

  const selectGuest = (guest: Guest) => {
    onChange(guest.full_name, guest.id)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue, null) // Clear guest ID when typing
    setShowDropdown(true) // Show dropdown when typing
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault()
        setShowDropdown(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredGuests.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < filteredGuests.length) {
        selectGuest(filteredGuests[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          required={required}
          placeholder="Click to select or type to search..."
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '8px 32px 8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: guestId ? '#f9fafb' : 'white'
          }}
          onFocusCapture={(e) => e.target.style.borderColor = '#8b5cf6'}
          onBlurCapture={(e) => e.target.style.borderColor = '#d1d5db'}
        />
        
        {/* Dropdown icon */}
        <button
          type="button"
          onClick={() => {
            setShowDropdown(!showDropdown)
            inputRef.current?.focus()
          }}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronDown 
            style={{
              width: '16px',
              height: '16px',
              color: '#6b7280',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s'
            }}
          />
        </button>

        {/* Guest selected indicator */}
        {guestId && (
          <span style={{
            position: 'absolute',
            right: '32px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '12px',
            color: '#10b981',
            fontWeight: '500'
          }}>
            ✓
          </span>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
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
          {filteredGuests.length > 0 ? (
            <>
              {/* Optional: Show "Select a guest" header */}
              <div style={{
                padding: '6px 12px',
                fontSize: '12px',
                color: '#6b7280',
                borderBottom: '1px solid #f3f4f6',
                fontWeight: '500'
              }}>
                {value ? `${filteredGuests.length} matches` : 'Select a guest'}
              </div>
              
              {filteredGuests.map((guest, index) => (
                <div
                  key={guest.id}
                  onClick={() => selectGuest(guest)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? '#f3f4f6' : 'white',
                    borderBottom: index < filteredGuests.length - 1 ? '1px solid #f9fafb' : 'none',
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
            </>
          ) : (
            <div style={{
              padding: '12px',
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {value ? 'No matching guests found' : 'No guests available'}
            </div>
          )}
          
          {/* Option to enter custom name */}
          {value && !guestId && (
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid #e5e7eb',
              fontSize: '12px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Can't find your name? Keep typing to enter it manually.
            </div>
          )}
        </div>
      )}
    </div>
  )
}