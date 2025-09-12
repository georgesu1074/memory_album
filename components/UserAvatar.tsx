'use client'

import { User } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserAvatarProps {
  avatarUrl?: string | null
  name?: string | null
  email?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function UserAvatar({ 
  avatarUrl, 
  name, 
  email, 
  size = 'md',
  className = ''
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  
  // Reset error state when URL changes
  useEffect(() => {
    setImageError(false)
    setImageLoading(true)
  }, [avatarUrl])
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  // Get initials from name or email
  const getInitials = () => {
    if (name) {
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return ''
  }

  const initials = getInitials()

  // Don't show image while loading or if there's an error
  if (avatarUrl && !imageError) {
    return (
      <>
        {/* Show fallback while image is loading */}
        {imageLoading && (
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium ${className}`}>
            {initials || <User className={iconSizes[size]} />}
          </div>
        )}
        <img 
          src={avatarUrl} 
          alt={name || email || 'User'} 
          className={`${sizeClasses[size]} rounded-full object-cover ${className} ${imageLoading ? 'hidden' : ''}`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true)
            setImageLoading(false)
          }}
        />
      </>
    )
  }

  // Show initials if available, otherwise show user icon
  if (initials) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium ${className}`}>
        {initials}
      </div>
    )
  }

  // Fallback to user icon
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}>
      <User className={iconSizes[size]} />
    </div>
  )
}