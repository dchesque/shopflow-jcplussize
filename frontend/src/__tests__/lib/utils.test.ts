import { cn, formatNumber, formatPercentage, formatDuration, getTimeAgo } from '@/lib/utils'

describe('cn function', () => {
  it('combines class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles conditional classes', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'hidden')).toBe('bg-red-500 text-white')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2') // p-2 should override p-4
  })

  it('handles undefined and null values', () => {
    expect(cn('bg-red-500', undefined, null, 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles arrays of classes', () => {
    expect(cn(['bg-red-500', 'text-white'], 'p-4')).toBe('bg-red-500 text-white p-4')
  })
})

describe('formatNumber function', () => {
  beforeAll(() => {
    // Mock Intl.NumberFormat for consistent testing
    const mockFormat = jest.fn((num: number) => {
      if (num >= 1000) {
        return num.toLocaleString('pt-BR')
      }
      return num.toString()
    })
    
    jest.spyOn(Intl, 'NumberFormat').mockImplementation(() => ({
      format: mockFormat,
      formatToParts: jest.fn(),
      resolvedOptions: jest.fn(),
    }))
  })

  it('formats small numbers correctly', () => {
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(123)).toBe('123')
  })

  it('formats large numbers with Brazilian locale', () => {
    expect(formatNumber(1234)).toContain('1')
    expect(formatNumber(1000000)).toContain('1')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-123)).toBe('-123')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })
})

describe('formatPercentage function', () => {
  it('formats percentage with one decimal place', () => {
    expect(formatPercentage(12.345)).toBe('12.3%')
    expect(formatPercentage(0.123)).toBe('0.1%')
    expect(formatPercentage(100)).toBe('100.0%')
  })

  it('handles zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('handles negative percentages', () => {
    expect(formatPercentage(-5.67)).toBe('-5.7%')
  })

  it('rounds correctly', () => {
    expect(formatPercentage(12.35)).toBe('12.3%') // JavaScript banker's rounding
    expect(formatPercentage(12.36)).toBe('12.4%')
  })
})

describe('formatDuration function', () => {
  it('formats duration in minutes only', () => {
    expect(formatDuration(30)).toBe('30min')
    expect(formatDuration(1)).toBe('1min')
    expect(formatDuration(59)).toBe('59min')
  })

  it('formats duration with hours and minutes', () => {
    expect(formatDuration(60)).toBe('1h 0min')
    expect(formatDuration(90)).toBe('1h 30min')
    expect(formatDuration(125)).toBe('2h 5min')
  })

  it('handles zero minutes', () => {
    expect(formatDuration(0)).toBe('0min')
  })

  it('handles large durations', () => {
    expect(formatDuration(1440)).toBe('24h 0min') // 24 hours
    expect(formatDuration(1500)).toBe('25h 0min') // 25 hours
  })
})

describe('getTimeAgo function', () => {
  beforeEach(() => {
    // Mock current time to January 1, 2024, 12:00:00
    const mockDate = new Date('2024-01-01T12:00:00Z')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
    jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns "agora" for current time', () => {
    const now = new Date('2024-01-01T12:00:00Z')
    expect(getTimeAgo(now)).toBe('agora')
  })

  it('returns "agora" for very recent times', () => {
    const recent = new Date('2024-01-01T11:59:30Z') // 30 seconds ago
    expect(getTimeAgo(recent)).toBe('agora')
  })

  it('returns minutes ago for times within an hour', () => {
    const minutesAgo = new Date('2024-01-01T11:45:00Z') // 15 minutes ago
    expect(getTimeAgo(minutesAgo)).toBe('15min atrás')
    
    const oneMinuteAgo = new Date('2024-01-01T11:59:00Z') // 1 minute ago
    expect(getTimeAgo(oneMinuteAgo)).toBe('1min atrás')
  })

  it('returns hours ago for times within a day', () => {
    const hoursAgo = new Date('2024-01-01T09:00:00Z') // 3 hours ago
    expect(getTimeAgo(hoursAgo)).toBe('3h atrás')
    
    const oneHourAgo = new Date('2024-01-01T11:00:00Z') // 1 hour ago
    expect(getTimeAgo(oneHourAgo)).toBe('1h atrás')
  })

  it('returns days ago for older times', () => {
    const daysAgo = new Date('2023-12-30T12:00:00Z') // 2 days ago
    expect(getTimeAgo(daysAgo)).toBe('2d atrás')
    
    const oneDayAgo = new Date('2023-12-31T12:00:00Z') // 1 day ago
    expect(getTimeAgo(oneDayAgo)).toBe('1d atrás')
  })

  it('handles future dates gracefully', () => {
    const future = new Date('2024-01-01T13:00:00Z') // 1 hour in the future
    const result = getTimeAgo(future)
    expect(typeof result).toBe('string')
  })
})