import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCameras } from '@/hooks/useCameras'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

describe('useCameras', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('returns initial loading state', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cameras: [] }),
    })

    const { result } = renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.cameras).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('fetches and returns camera data successfully', async () => {
    const mockCameras = [
      {
        id: '1',
        name: 'Camera 1',
        location: 'Entrance',
        rtsp_url: 'rtsp://example.com/stream1',
        ip_address: '192.168.1.100',
        port: 554,
        status: 'online',
        fps: 30,
        created_at: '2024-01-01T00:00:00Z',
        peopleCount: 5,
        customersCount: 3,
        employeesCount: 2,
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cameras: mockCameras }),
    })

    const { result } = renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.cameras).toEqual(mockCameras)
    expect(result.current.error).toBe(null)
  })

  it('handles fetch error correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.cameras).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
  })

  it('handles HTTP error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const { result } = renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('refetches data when refetch is called', async () => {
    const mockCameras = [
      {
        id: '1',
        name: 'Camera 1',
        location: 'Entrance',
        rtsp_url: 'rtsp://example.com/stream1',
        ip_address: '192.168.1.100',
        port: 554,
        status: 'online',
        fps: 30,
        created_at: '2024-01-01T00:00:00Z',
        peopleCount: 5,
        customersCount: 3,
        employeesCount: 2,
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cameras: mockCameras }),
    })

    const { result } = renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('calls correct API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cameras: [] }),
    })

    renderHook(() => useCameras(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cameras')
    })
  })
})