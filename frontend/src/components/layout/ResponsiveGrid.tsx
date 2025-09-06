'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useDeviceCapabilities } from '@/hooks/usePerformance'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  minItemWidth?: number
  gap?: number
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  enableAnimations?: boolean
}

export function ResponsiveGrid({
  children,
  className,
  minItemWidth = 280,
  gap = 24,
  breakpoints = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  enableAnimations = true
}: ResponsiveGridProps) {
  const [columns, setColumns] = React.useState(1)
  const [isMounted, setIsMounted] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { isLowEndDevice } = useDeviceCapabilities()

  // Disable animations on low-end devices
  const shouldAnimate = enableAnimations && !isLowEndDevice

  React.useEffect(() => {
    setIsMounted(true)
    
    const updateColumns = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const availableWidth = containerWidth - gap * 2 // Account for container padding

      // Calculate optimal columns based on available width
      const maxColumns = Math.floor((availableWidth + gap) / (minItemWidth + gap))
      
      // Apply breakpoint constraints
      const width = window.innerWidth
      let breakpointColumns = breakpoints.xl || 4

      if (width < 640) {
        breakpointColumns = breakpoints.sm || 1
      } else if (width < 768) {
        breakpointColumns = breakpoints.md || 2
      } else if (width < 1024) {
        breakpointColumns = breakpoints.lg || 3
      }

      const finalColumns = Math.min(maxColumns, breakpointColumns)
      setColumns(Math.max(1, finalColumns))
    }

    updateColumns()

    const resizeObserver = new ResizeObserver(updateColumns)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener('resize', updateColumns)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateColumns)
    }
  }, [minItemWidth, gap, breakpoints])

  if (!isMounted) {
    return (
      <div className={cn('w-full', className)}>
        {children}
      </div>
    )
  }

  const childrenArray = React.Children.toArray(children)

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        alignItems: 'start'
      }}
    >
      <AnimatePresence mode="wait">
        {childrenArray.map((child, index) => (
          <motion.div
            key={`grid-item-${index}`}
            initial={shouldAnimate ? { 
              opacity: 0, 
              y: 20,
              scale: 0.95
            } : undefined}
            animate={shouldAnimate ? { 
              opacity: 1, 
              y: 0,
              scale: 1
            } : undefined}
            exit={shouldAnimate ? { 
              opacity: 0, 
              y: -20,
              scale: 0.95
            } : undefined}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: shouldAnimate ? index * 0.1 : 0
            }}
            layout={shouldAnimate}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Masonry-style responsive grid for variable height items
interface ResponsiveMasonryProps {
  children: React.ReactNode
  className?: string
  columnWidth?: number
  gap?: number
  enableAnimations?: boolean
}

export function ResponsiveMasonry({
  children,
  className,
  columnWidth = 320,
  gap = 16,
  enableAnimations = true
}: ResponsiveMasonryProps) {
  const [columns, setColumns] = React.useState<React.ReactNode[][]>([])
  const [columnCount, setColumnCount] = React.useState(1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { isLowEndDevice } = useDeviceCapabilities()

  const shouldAnimate = enableAnimations && !isLowEndDevice

  React.useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.offsetWidth
      const newColumnCount = Math.max(1, Math.floor(containerWidth / columnWidth))
      
      if (newColumnCount !== columnCount) {
        setColumnCount(newColumnCount)
      }

      // Distribute children across columns
      const childrenArray = React.Children.toArray(children)
      const newColumns: React.ReactNode[][] = Array.from(
        { length: newColumnCount }, 
        () => []
      )

      childrenArray.forEach((child, index) => {
        const columnIndex = index % newColumnCount
        newColumns[columnIndex].push(child)
      })

      setColumns(newColumns)
    }

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [children, columnWidth, columnCount])

  return (
    <div
      ref={containerRef}
      className={cn('w-full', className)}
      style={{
        display: 'flex',
        gap: `${gap}px`,
        alignItems: 'flex-start'
      }}
    >
      {columns.map((column, columnIndex) => (
        <div
          key={`column-${columnIndex}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${gap}px`
          }}
        >
          {column.map((child, itemIndex) => (
            <motion.div
              key={`masonry-item-${columnIndex}-${itemIndex}`}
              initial={shouldAnimate ? { 
                opacity: 0, 
                y: 20 
              } : false}
              animate={shouldAnimate ? { 
                opacity: 1, 
                y: 0 
              } : false}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: shouldAnimate ? (columnIndex * 0.1 + itemIndex * 0.05) : 0
              }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}

// Responsive container with breakpoint utilities
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  maxWidth?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  padding?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = {
    sm: '100%',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  padding = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40
  }
}: ResponsiveContainerProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('sm')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= 1536) {
        setCurrentBreakpoint('2xl')
      } else if (width >= 1280) {
        setCurrentBreakpoint('xl')
      } else if (width >= 1024) {
        setCurrentBreakpoint('lg')
      } else if (width >= 768) {
        setCurrentBreakpoint('md')
      } else {
        setCurrentBreakpoint('sm')
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  const currentMaxWidth = maxWidth[currentBreakpoint] || '100%'
  const currentPadding = padding[currentBreakpoint] || 16

  return (
    <div
      className={cn('mx-auto w-full', className)}
      style={{
        maxWidth: currentMaxWidth,
        padding: `0 ${currentPadding}px`
      }}
    >
      {children}
    </div>
  )
}

// Hook for responsive utilities
export function useResponsive() {
  const [breakpoint, setBreakpoint] = React.useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'>('xs')
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 })
  const [isMobile, setIsMobile] = React.useState(false)
  const [isTablet, setIsTablet] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)

  React.useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setScreenSize({ width, height })

      // Update breakpoint
      if (width >= 1536) {
        setBreakpoint('2xl')
      } else if (width >= 1280) {
        setBreakpoint('xl')
      } else if (width >= 1024) {
        setBreakpoint('lg')
      } else if (width >= 768) {
        setBreakpoint('md')
      } else if (width >= 640) {
        setBreakpoint('sm')
      } else {
        setBreakpoint('xs')
      }

      // Update device type flags
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)

    return () => window.removeEventListener('resize', updateScreenInfo)
  }, [])

  const isBreakpoint = React.useCallback((bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
    return breakpoint === bp
  }, [breakpoint])

  const isBreakpointUp = React.useCallback((bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpoints.indexOf(breakpoint)
    const targetIndex = breakpoints.indexOf(bp)
    return currentIndex >= targetIndex
  }, [breakpoint])

  const isBreakpointDown = React.useCallback((bp: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = breakpoints.indexOf(breakpoint)
    const targetIndex = breakpoints.indexOf(bp)
    return currentIndex <= targetIndex
  }, [breakpoint])

  return {
    breakpoint,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown
  }
}