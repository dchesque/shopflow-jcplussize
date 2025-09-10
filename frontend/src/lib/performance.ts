import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Performance monitoring configuration
export interface PerformanceConfig {
  enableLogging: boolean
  enableAnalytics: boolean
  thresholds: {
    lcp: number // Largest Contentful Paint
    inp: number // Interaction to Next Paint
    cls: number // Cumulative Layout Shift
    fcp: number // First Contentful Paint
    ttfb: number // Time to First Byte
  }
}

const defaultConfig: PerformanceConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.NODE_ENV === 'production',
  thresholds: {
    lcp: 2500, // 2.5s
    inp: 200,  // 200ms
    cls: 0.1,  // 0.1
    fcp: 1800, // 1.8s
    ttfb: 800, // 800ms
  },
}

// Performance metrics store
class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map()
  private config: PerformanceConfig

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
    this.initWebVitals()
  }

  private initWebVitals() {
    onCLS(this.handleMetric.bind(this))
    onINP(this.handleMetric.bind(this))
    onFCP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))
  }

  private handleMetric(metric: Metric) {
    this.metrics.set(metric.name, metric)

    if (this.config.enableLogging) {
      this.logMetric(metric)
    }

    if (this.config.enableAnalytics) {
      this.sendToAnalytics(metric)
    }

    this.checkThresholds(metric)
  }

  private logMetric(metric: Metric) {
    const status = this.getMetricStatus(metric)
    const color = status === 'good' ? '🟢' : status === 'needs-improvement' ? '🟡' : '🔴'
    
    console.group(`${color} Performance Metric: ${metric.name}`)
    console.log('Value:', metric.value)
    console.log('Rating:', metric.rating)
    console.log('Delta:', metric.delta)
    console.log('Status:', status)
    console.groupEnd()
  }

  private sendToAnalytics(metric: Metric) {
    // Send to analytics service (Vercel Analytics, Google Analytics, etc.)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Google Analytics 4
      ;(window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }

    // Custom analytics endpoint
    this.sendToCustomEndpoint(metric)
  }

  private async sendToCustomEndpoint(metric: Metric) {
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      })
    } catch (error) {
      if (this.config.enableLogging) {
        console.warn('Failed to send performance metric:', error)
      }
    }
  }

  private getMetricStatus(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.config.thresholds[metric.name as keyof typeof this.config.thresholds]
    
    if (metric.name === 'CLS') {
      if (metric.value <= 0.1) return 'good'
      if (metric.value <= 0.25) return 'needs-improvement'
      return 'poor'
    }

    if (metric.name === 'INP') {
      if (metric.value <= 200) return 'good'
      if (metric.value <= 500) return 'needs-improvement'
      return 'poor'
    }

    if (metric.name === 'LCP') {
      if (metric.value <= 2500) return 'good'
      if (metric.value <= 4000) return 'needs-improvement'
      return 'poor'
    }

    if (metric.name === 'FCP') {
      if (metric.value <= 1800) return 'good'
      if (metric.value <= 3000) return 'needs-improvement'
      return 'poor'
    }

    if (metric.name === 'TTFB') {
      if (metric.value <= 800) return 'good'
      if (metric.value <= 1800) return 'needs-improvement'
      return 'poor'
    }

    return 'good'
  }

  private checkThresholds(metric: Metric) {
    const status = this.getMetricStatus(metric)
    
    if (status === 'poor' && this.config.enableLogging) {
      console.warn(`⚠️ Performance threshold exceeded for ${metric.name}:`, {
        value: metric.value,
        threshold: this.config.thresholds[metric.name as keyof typeof this.config.thresholds],
        rating: metric.rating,
      })
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  getMetric(name: string) {
    return this.metrics.get(name)
  }

  getSummary() {
    const metrics = this.getMetrics()
    const summary = {
      totalMetrics: Object.keys(metrics).length,
      goodMetrics: 0,
      needsImprovementMetrics: 0,
      poorMetrics: 0,
      averageScores: {} as Record<string, number>,
    }

    Object.values(metrics).forEach(metric => {
      const status = this.getMetricStatus(metric)
      summary[`${status}Metrics` as keyof typeof summary]++
      summary.averageScores[metric.name] = metric.value
    })

    return summary
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Hook for React components
export function usePerformanceMonitoring() {
  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getMetric: (name: string) => performanceMonitor.getMetric(name),
    getSummary: () => performanceMonitor.getSummary(),
  }
}

// Performance monitoring for route changes
export function trackPageView(url: string) {
  // Reset metrics for new page
  if (typeof window !== 'undefined') {
    console.log('🚀 Page view tracked:', url)
    
    // Optional: Send page view to analytics
    if ('gtag' in window) {
      ;(window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      })
    }
  }
}

// Component-level performance tracking
export function trackComponentRender(componentName: string, renderTime: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${componentName} render time:`, `${renderTime.toFixed(2)}ms`)
    
    if (renderTime > 16) {
      console.warn(`⚠️ Slow render detected in ${componentName}:`, `${renderTime.toFixed(2)}ms`)
    }
  }
}

export default performanceMonitor