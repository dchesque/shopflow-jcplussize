import { useEffect, useState } from 'react'

interface BreakpointValues {
  sm: boolean
  md: boolean
  lg: boolean
  xl: boolean
  '2xl': boolean
}

interface ResponsiveHookReturn extends BreakpointValues {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeScreen: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'large'
  orientation: 'portrait' | 'landscape'
  touchDevice: boolean
  preferredColorScheme: 'light' | 'dark'
  reducedMotion: boolean
  highContrast: boolean
}

// Breakpoint values (Tailwind CSS defaults)
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useResponsive(): ResponsiveHookReturn {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  })

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [touchDevice, setTouchDevice] = useState(false)
  const [preferredColorScheme, setPreferredColorScheme] = useState<'light' | 'dark'>('dark')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait')
    }

    function detectCapabilities() {
      // Touch device detection
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      setTouchDevice(hasTouch)

      // Color scheme detection
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setPreferredColorScheme(darkModeQuery.matches ? 'dark' : 'light')
      
      // Reduced motion detection
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(reducedMotionQuery.matches)
      
      // High contrast detection
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      setHighContrast(highContrastQuery.matches)

      // Listen for changes
      darkModeQuery.addEventListener('change', (e) => {
        setPreferredColorScheme(e.matches ? 'dark' : 'light')
      })

      reducedMotionQuery.addEventListener('change', (e) => {
        setReducedMotion(e.matches)
      })

      highContrastQuery.addEventListener('change', (e) => {
        setHighContrast(e.matches)
      })
    }

    // Initial setup
    handleResize()
    detectCapabilities()

    // Event listeners
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  // Calculate breakpoint values
  const { width } = windowSize
  const breakpointValues: BreakpointValues = {
    sm: width >= breakpoints.sm,
    md: width >= breakpoints.md,
    lg: width >= breakpoints.lg,
    xl: width >= breakpoints.xl,
    '2xl': width >= breakpoints['2xl'],
  }

  // Convenience properties
  const isMobile = width < breakpoints.md
  const isTablet = width >= breakpoints.md && width < breakpoints.lg
  const isDesktop = width >= breakpoints.lg && width < breakpoints.xl
  const isLargeScreen = width >= breakpoints.xl

  const screenSize: 'mobile' | 'tablet' | 'desktop' | 'large' = 
    isMobile ? 'mobile' : isTablet ? 'tablet' : isDesktop ? 'desktop' : 'large'

  return {
    ...breakpointValues,
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    screenSize,
    orientation,
    touchDevice,
    preferredColorScheme,
    reducedMotion,
    highContrast,
  }
}

// Hook for specific breakpoint
export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const responsive = useResponsive()
  return responsive[breakpoint]
}

// Hook for media query
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Hook for viewport dimensions
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
    scrollY: 0,
  })

  useEffect(() => {
    function updateViewport() {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        scrollY: window.scrollY,
      })
    }

    updateViewport()
    
    window.addEventListener('resize', updateViewport)
    window.addEventListener('scroll', updateViewport, { passive: true })

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('scroll', updateViewport)
    }
  }, [])

  return viewport
}

// Custom hook for safe area insets (for mobile PWA)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', updateSafeArea)

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}

// Hook for device capabilities
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    online: true,
    connectionType: 'unknown' as 'slow-2g' | '2g' | '3g' | '4g' | 'unknown',
    battery: null as number | null,
    charging: false,
    memory: null as number | null,
  })

  useEffect(() => {
    function updateOnlineStatus() {
      setCapabilities(prev => ({ ...prev, online: navigator.onLine }))
    }

    function updateConnection() {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (connection) {
        setCapabilities(prev => ({
          ...prev,
          connectionType: connection.effectiveType || 'unknown'
        }))
      }
    }

    async function updateBattery() {
      try {
        const battery = await (navigator as any).getBattery?.()
        if (battery) {
          setCapabilities(prev => ({
            ...prev,
            battery: Math.round(battery.level * 100),
            charging: battery.charging
          }))
        }
      } catch (error) {
        // Battery API not supported
      }
    }

    function updateMemory() {
      const memory = (navigator as any).deviceMemory
      if (memory) {
        setCapabilities(prev => ({ ...prev, memory }))
      }
    }

    // Initial setup
    updateOnlineStatus()
    updateConnection()
    updateBattery()
    updateMemory()

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateConnection)
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      
      if (connection) {
        connection.removeEventListener('change', updateConnection)
      }
    }
  }, [])

  return capabilities
}