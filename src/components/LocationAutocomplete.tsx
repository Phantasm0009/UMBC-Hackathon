'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationAutocompleteProps {
  value: string
  onChange: (location: string, coordinates?: { lat: number, lng: number }) => void
  placeholder?: string
  className?: string
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
}

export const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter location...", 
  className = "" 
}: LocationAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (value.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchLocation(value)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [value])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchLocation = async (query: string) => {
    if (query.length < 3) return

    setIsLoading(true)
    try {
      // Using Nominatim (OpenStreetMap) API - completely free!
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `countrycodes=us&` + // Limit to US for Baltimore area
        `limit=5`,
        {
          headers: {
            'User-Agent': 'DisasterLens Emergency Response App'
          }
        }
      )

      if (response.ok) {
        const data: NominatimResult[] = await response.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      }
    } catch (error) {
      console.error('Error searching location:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue) // Update parent state
  }

  const handleSuggestionClick = (suggestion: NominatimResult) => {
    const location = suggestion.display_name
    const coordinates = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    }
    
    onChange(location, coordinates)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-red-50 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {suggestion.display_name.split(',').slice(0, 2).join(', ')}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {suggestion.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Attribution for OpenStreetMap */}
      <div className="text-xs text-gray-400 mt-1">
        📍 Location search powered by OpenStreetMap
      </div>
    </div>
  )
}