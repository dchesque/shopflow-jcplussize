'use client'

import * as React from 'react'
import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Types
interface RealtimeContextType {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  channels: Map<string, RealtimeChannel>
  subscribe: (channelName: string, config?: any) => RealtimeChannel | null
  unsubscribe: (channelName: string) => void
  broadcast: (channelName: string, event: string, payload: any) => void
  reconnect: () => void
  lastHeartbeat: Date | null
  reconnectAttempts: number
  maxReconnectAttempts: number
}

interface RealtimeProviderProps {
  children: React.ReactNode
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  enabled?: boolean
}

interface RealtimeState {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  channels: Map<string, RealtimeChannel>
  lastHeartbeat: Date | null
  reconnectAttempts: number
  reconnectTimeoutId: NodeJS.Timeout | null
  heartbeatIntervalId: NodeJS.Timeout | null
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export function RealtimeProvider({
  children,
  maxReconnectAttempts = 5,
  heartbeatInterval = 30000,
  enabled = true
}: RealtimeProviderProps) {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    channels: new Map(),
    lastHeartbeat: null,
    reconnectAttempts: 0,
    reconnectTimeoutId: null,
    heartbeatIntervalId: null
  })

  // WebSocket connection management
  const connect = useCallback(() => {
    if (!enabled || state.connectionStatus === 'connecting' || state.connectionStatus === 'connected') {
      return
    }

    setState(prev => ({
      ...prev,
      connectionStatus: 'connecting',
      reconnectAttempts: prev.reconnectAttempts + 1
    }))

    // Create a heartbeat channel for connection monitoring
    const heartbeatChannel = supabase.channel('realtime_heartbeat', {
      config: {
        presence: {
          key: `user_${Date.now()}`
        }
      }
    })

    heartbeatChannel
      .on('presence', { event: 'sync' }, () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          lastHeartbeat: new Date(),
          reconnectAttempts: 0
        }))
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Realtime: User joined', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Realtime: User left', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await heartbeatChannel.track({
            user_id: 'anonymous',
            online_at: new Date().toISOString(),
            page: 'dashboard'
          })
          
          setState(prev => ({
            ...prev,
            isConnected: true,
            connectionStatus: 'connected',
            lastHeartbeat: new Date()
          }))
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime: Connection error')
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionStatus: 'error'
          }))

          // Attempt reconnection if within limits
          if (state.reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000)
            const timeoutId = setTimeout(() => {
              connect()
            }, delay)
            
            setState(prev => ({
              ...prev,
              reconnectTimeoutId: timeoutId
            }))
          }
        } else if (status === 'CLOSED') {
          setState(prev => ({
            ...prev,
            isConnected: false,
            connectionStatus: 'disconnected'
          }))
        }
      })

    // Store heartbeat channel
    setState(prev => ({
      ...prev,
      channels: new Map(prev.channels.set('heartbeat', heartbeatChannel))
    }))
  }, [enabled, state.connectionStatus, state.reconnectAttempts, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    // Clear timeouts
    if (state.reconnectTimeoutId) {
      clearTimeout(state.reconnectTimeoutId)
    }
    if (state.heartbeatIntervalId) {
      clearInterval(state.heartbeatIntervalId)
    }

    // Unsubscribe all channels
    state.channels.forEach((channel) => {
      channel.unsubscribe()
    })

    setState({
      isConnected: false,
      connectionStatus: 'disconnected',
      channels: new Map(),
      lastHeartbeat: null,
      reconnectAttempts: 0,
      reconnectTimeoutId: null,
      heartbeatIntervalId: null
    })
  }, [state.channels, state.reconnectTimeoutId, state.heartbeatIntervalId])

  const subscribe = useCallback((channelName: string, config?: any) => {
    if (!enabled) return null

    // Don't create duplicate channels
    if (state.channels.has(channelName)) {
      return state.channels.get(channelName) || null
    }

    const channel = supabase.channel(channelName, config)
    
    setState(prev => ({
      ...prev,
      channels: new Map(prev.channels.set(channelName, channel))
    }))

    return channel
  }, [enabled, state.channels])

  const unsubscribe = useCallback((channelName: string) => {
    const channel = state.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      setState(prev => {
        const newChannels = new Map(prev.channels)
        newChannels.delete(channelName)
        return {
          ...prev,
          channels: newChannels
        }
      })
    }
  }, [state.channels])

  const broadcast = useCallback((channelName: string, event: string, payload: any) => {
    const channel = state.channels.get(channelName)
    if (channel && state.isConnected) {
      channel.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }, [state.channels, state.isConnected])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        reconnectAttempts: 0
      }))
      connect()
    }, 1000)
  }, [disconnect, connect])

  // Setup heartbeat monitoring
  useEffect(() => {
    if (state.isConnected && heartbeatInterval > 0) {
      const intervalId = setInterval(() => {
        setState(prev => ({
          ...prev,
          lastHeartbeat: new Date()
        }))
      }, heartbeatInterval)

      setState(prev => ({
        ...prev,
        heartbeatIntervalId: intervalId
      }))

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [state.isConnected, heartbeatInterval])

  // Auto-connect on mount
  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const contextValue: RealtimeContextType = {
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    channels: state.channels,
    subscribe,
    unsubscribe,
    broadcast,
    reconnect,
    lastHeartbeat: state.lastHeartbeat,
    reconnectAttempts: state.reconnectAttempts,
    maxReconnectAttempts
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

// Hook to use the realtime context
export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

// Higher-order hook for specific channel subscriptions
export function useRealtimeChannel(
  channelName: string,
  events: {
    onMessage?: (payload: any) => void
    onPresence?: (payload: any) => void
    onBroadcast?: (payload: any) => void
    onInsert?: (payload: any) => void
    onUpdate?: (payload: any) => void
    onDelete?: (payload: any) => void
  } = {},
  config?: any
) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const realtimeChannel = subscribe(channelName, config)
    if (!realtimeChannel) return

    // Setup event listeners
    if (events.onBroadcast) {
      realtimeChannel.on('broadcast', { event: '*' }, events.onBroadcast)
    }

    if (events.onPresence) {
      realtimeChannel.on(
        'presence' as any,
        { event: 'sync' },
        events.onPresence
      )
    }

    if (events.onInsert) {
      realtimeChannel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: channelName.replace('_changes', '')
      }, events.onInsert)
    }

    if (events.onUpdate) {
      realtimeChannel.on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: channelName.replace('_changes', '')
      }, events.onUpdate)
    }

    if (events.onDelete) {
      realtimeChannel.on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: channelName.replace('_changes', '')
      }, events.onDelete)
    }

    realtimeChannel.subscribe((status) => {
      setIsSubscribed(status === 'SUBSCRIBED')
    })

    setChannel(realtimeChannel)

    return () => {
      unsubscribe(channelName)
      setChannel(null)
      setIsSubscribed(false)
    }
  }, [channelName, subscribe, unsubscribe, config])

  return {
    channel,
    isSubscribed,
    isConnected
  }
}