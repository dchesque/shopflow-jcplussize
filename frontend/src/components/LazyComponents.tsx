import { lazy } from 'react'
import { Loader2 } from 'lucide-react'

// Lazy loading wrapper with loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
    <span className="ml-2 text-neutral-400">Carregando...</span>
  </div>
)

// Lazy load heavy components
export const LazyDashboard = lazy(() => import('../app/(auth)/dashboard/page'))
export const LazyCameraGrid = lazy(() => import('./cameras/CameraGrid'))
export const LazyEmployeeTable = lazy(() => import('./dashboard/EmployeeTable'))
export const LazyAnalytics = lazy(() => import('../app/(auth)/analytics/page'))

// Charts (heavy components)
export const LazyFlowChart = lazy(() => import('./charts/FlowChart'))
export const LazyPieChart = lazy(() => import('./charts/PieChart'))
export const LazyAreaChart = lazy(() => import('./charts/AreaChart'))

// Complex forms
export const LazyEmployeeForm = lazy(() => import('./dashboard/EmployeeForm'))
export const LazyCameraConfigForm = lazy(() => import('./cameras/CameraConfigForm'))

// Analytics components
export const LazyFlowVisualization = lazy(() => import('./analytics/FlowVisualization'))
export const LazyGroupAnalysis = lazy(() => import('./analytics/GroupAnalysis'))
export const LazyCustomerSegmentation = lazy(() => import('./analytics/CustomerSegmentation'))

// Settings components
export const LazyPrivacySettings = lazy(() => import('../app/(auth)/settings/privacy/page'))
export const LazyUserManagement = lazy(() => import('../app/(auth)/settings/users/page'))

export { LoadingSpinner }