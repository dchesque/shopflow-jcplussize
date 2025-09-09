import { lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy loading wrapper with loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
    <span className="ml-2 text-neutral-400">Carregando...</span>
  </div>
)

export { LoadingSpinner }