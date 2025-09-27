'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus } from '@/components/Icons'

export const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/report', label: 'Report', icon: Plus },
    { href: '/admin', label: 'Admin', icon: Plus }
  ]

  return (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            pathname === href
              ? 'bg-red-600 text-white'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

export const MobileNavigation = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/report', label: 'Report', icon: Plus },
    { href: '/admin', label: 'Admin', icon: Plus }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 md:hidden">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors duration-200 ${
              pathname === href
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600'
            }`}
          >
            <Icon size={20} />
            <span className="mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}