'use client'

import { DisasterIcon, Filter } from './Icons'

interface FilterControlsProps {
  filters: {
    fire: boolean
    flood: boolean
    outage: boolean
    storm: boolean
    shelter: boolean
  }
  onFilterChange: (filter: keyof FilterControlsProps['filters'], value: boolean) => void
  className?: string
}

export const FilterControls = ({ filters, onFilterChange, className = '' }: FilterControlsProps) => {
  const filterTypes = [
    { key: 'fire' as const, label: 'Fire', color: '#EF4444' },
    { key: 'flood' as const, label: 'Flood', color: '#3B82F6' },
    { key: 'outage' as const, label: 'Power', color: '#F59E0B' },
    { key: 'storm' as const, label: 'Storm', color: '#8B5CF6' },
    { key: 'shelter' as const, label: 'Shelter', color: '#10B981' }
  ]

  return (
    <div className={className || `bg-white rounded-2xl border-2 border-gray-200 p-4`}>
      {/* Only show header if not using custom className */}
      {!className && (
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
      )}
      
      <div className="space-y-2 lg:space-y-3">
        {filterTypes.map((filter) => (
          <label
            key={filter.key}
            className="flex items-center space-x-2 lg:space-x-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={filters[filter.key]}
              onChange={(e) => onFilterChange(filter.key, e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                filters[filter.key]
                  ? 'border-transparent text-white'
                  : 'border-gray-300 text-transparent group-hover:border-gray-400'
              }`}
              style={{
                backgroundColor: filters[filter.key] ? filter.color : 'transparent'
              }}
            >
              <DisasterIcon type={filter.key} size={12} className="lg:w-4 lg:h-4" />
            </div>
            <span className="text-xs lg:text-sm font-medium text-gray-900">
              {filter.label}
            </span>
          </label>
        ))}
      </div>
      
      <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const allActive = Object.values(filters).every(Boolean)
            filterTypes.forEach(({ key }) => {
              onFilterChange(key, !allActive)
            })
          }}
          className="w-full text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          {Object.values(filters).every(Boolean) ? 'Hide All' : 'Show All'}
        </button>
      </div>
    </div>
  )
}