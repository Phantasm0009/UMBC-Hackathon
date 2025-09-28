import { 
  Flame, 
  Waves, 
  Zap, 
  Cloud, 
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Filter,
  Plus,
  X,
  Menu,
  Bell,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'

interface DisasterIconProps {
  type: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter'
  className?: string
  size?: number
}

export const DisasterIcon = ({ type, className = '', size = 24 }: DisasterIconProps) => {
  const iconMap = {
    fire: Flame,
    flood: Waves,
    outage: Zap,
    storm: Cloud,
    shelter: Home
  }
  
  const Icon = iconMap[type]
  return <Icon className={className} size={size} />
}

// Export all commonly used icons
export {
  Flame,
  Waves,
  Zap,
  Cloud,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Filter,
  Plus,
  X,
  Menu,
  Bell,
  Eye,
  EyeOff,
  Trash2
}

// Utility function to get disaster colors
export const getDisasterColor = (type: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter') => {
  const colorMap = {
    fire: '#EF4444',
    flood: '#3B82F6', 
    outage: '#F59E0B',
    storm: '#8B5CF6',
    shelter: '#10B981'
  }
  return colorMap[type]
}

// Utility function to get disaster background class
export const getDisasterBgClass = (type: 'fire' | 'flood' | 'outage' | 'storm' | 'shelter') => {
  const classMap = {
    fire: 'alert-fire',
    flood: 'alert-flood',
    outage: 'alert-outage',
    storm: 'alert-storm',
    shelter: 'alert-shelter'
  }
  return classMap[type]
}