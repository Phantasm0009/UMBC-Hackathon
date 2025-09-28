'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, AlertTriangle } from '@/components/Icons'

interface AdminPasswordGateProps {
  onAuthenticated: () => void
  children: React.ReactNode
}

export const AdminPasswordGate = ({ onAuthenticated, children }: AdminPasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already authenticated from session storage
  useEffect(() => {
    const authToken = sessionStorage.getItem('admin_authenticated')
    if (authToken === 'true') {
      setIsAuthenticated(true)
      onAuthenticated()
    }
  }, [onAuthenticated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    setError('')

    // Simulate loading for UX
    setTimeout(() => {
      if (password === 'test') {
        sessionStorage.setItem('admin_authenticated', 'true')
        setIsAuthenticated(true)
        onAuthenticated()
      } else {
        setError('Invalid password. Please try again.')
        setPassword('')
      }
      setLoading(false)
    }, 800)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    setIsAuthenticated(false)
    setPassword('')
    setError('')
  }

  if (isAuthenticated) {
    return (
      <div>
        {/* Admin Header with Logout */}
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">Admin Panel - Authenticated</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-700 hover:bg-red-800 px-3 py-1 rounded transition-colors duration-200"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-red-200 shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Enter the password to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium">Demo Password:</p>
            <p className="text-xs mt-1">For demonstration purposes, the password is &quot;test&quot;</p>
          </div>
        </div>
      </div>
    </div>
  )
}