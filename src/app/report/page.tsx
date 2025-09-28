'use client'

import { useState } from 'react'
import { classifyData } from '@/lib/ai'
import { DisasterIcon, Plus, MapPin } from '@/components/Icons'
import { LocationAutocomplete } from '@/components/LocationAutocomplete'
import Link from 'next/link'

export default function ReportPage() {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    imageUrl: '',
    userLocation: null as { lat: number, lng: number } | null
  })
  const [classification, setClassification] = useState<{
    type: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'
    confidence: number
    severity: 'low' | 'medium' | 'high' | 'critical'
    summary: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim()) return

    setLoading(true)
    
    try {
      // Submit the report to the API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_report: formData.description,
          image_url: formData.imageUrl || undefined,
          location_lat: formData.userLocation?.lat,
          location_lng: formData.userLocation?.lng,
          location_text: formData.location || 'Unknown location'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setClassification(result.classification)
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      // Fallback to local AI classification
      const result = await classifyData(formData.description, formData.imageUrl)
      setClassification(result)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      description: '',
      location: '',
      imageUrl: '',
      userLocation: null
    })
    setClassification(null)
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your report. Our AI has classified this as a{' '}
            <span className="font-semibold capitalize">{classification?.type}</span> incident with{' '}
            <span className="font-semibold">{Math.round((classification?.confidence || 0) * 100)}%</span> confidence.
          </p>
          {classification && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DisasterIcon type={classification.type} size={24} />
                <span className="font-semibold capitalize">{classification.type} Alert</span>
              </div>
              <p className="text-sm text-gray-700">{classification.summary}</p>
            </div>
          )}
          <button
            onClick={resetForm}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors duration-200"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-600">DisasterLens</h1>
            <p className="text-sm text-gray-600">Citizen Reporting Portal</p>
          </div>
          <Link 
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report an Emergency</h2>
            <p className="text-gray-600">
              Help your community by reporting emergencies or disasters in your area.
              Our AI will analyze your report and alert the appropriate authorities.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                What&apos;s happening? <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're seeing or experiencing. Be as detailed as possible (e.g., 'Large fire with heavy smoke on Main Street near the post office')"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors duration-200"
                rows={4}
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Location
              </label>
              <div className="flex space-x-2">
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(location, coordinates) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      location,
                      userLocation: coordinates || prev.userLocation
                    }))
                  }}
                  placeholder="Street address, intersection, or landmark"
                  className="flex-1 p-4 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors duration-200"
                />
                <button
                  type="button"
                  onClick={getUserLocation}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                  title="Use my current location"
                >
                  <MapPin size={20} className="text-gray-600" />
                </button>
              </div>
              {formData.userLocation && (
                <p className="text-xs text-green-600 mt-1">
                  📍 Location detected: {formData.userLocation.lat.toFixed(4)}, {formData.userLocation.lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                <div className="mx-auto text-gray-400 mb-2 w-8 h-8 flex items-center justify-center">
                  📷
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Upload a photo to help authorities understand the situation
                </p>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL (for demo purposes)"
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  In a real app, this would be a file upload
                </p>
              </div>
            </div>

            {/* Classification Preview */}
            {classification && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">AI Classification Preview</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <DisasterIcon type={classification.type} className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {classification.type} - {classification.severity} severity
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.round(classification.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3">{classification.summary}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.description.trim()}
              className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing Report...</span>
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <div className="text-yellow-600 mt-1">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important:</p>
                <p>
                  This is for non-life-threatening emergencies. If this is a life-threatening emergency,
                  please call 911 immediately before submitting this report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}