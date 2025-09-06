'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { RealtimeChannel, REALTIME_LISTEN_TYPES } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

// Types
interface RealtimeSubscription {
  channel: RealtimeChannel | null
  isConnected: boolean
  lastHeartbeat: Date | null
  reconnectAttempts: number
}

interface UseRealtimeOptions {
  enabled?: boolean
  reconnectOnError?: boolean
  maxReconnectAttempts?: number
  heartbeatInterval?: number
}

// Connection status hook
export function useRealtimeConnection(options: UseRealtimeOptions = {}) {
  const {
    enabled = true,
    reconnectOnError = true,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = options

  const [subscription, setSubscription] = useState<RealtimeSubscription>({
    channel: null,
    isConnected: false,
    lastHeartbeat: null,
    reconnectAttempts: 0
  })

  const heartbeatRef = useRef<NodeJS.Timeout>()
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    if (!enabled || subscription.channel) return

    const channel = supabase.channel('realtime-connection', {
      config: {
        presence: {
          key: `user_${Date.now()}`
        }
      }
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        setSubscription(prev => ({
          ...prev,
          isConnected: true,
          lastHeartbeat: new Date(),
          reconnectAttempts: 0
        }))
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: 'anonymous',
            online_at: new Date().toISOString()
          })
          
          setSubscription(prev => ({
            ...prev,
            channel,
            isConnected: true,
            lastHeartbeat: new Date()
          }))
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime connection error')
          setSubscription(prev => ({
            ...prev,
            isConnected: false
          }))

          if (reconnectOnError && subscription.reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, subscription.reconnectAttempts), 30000)
            reconnectTimeoutRef.current = setTimeout(() => {
              setSubscription(prev => ({
                ...prev,
                reconnectAttempts: prev.reconnectAttempts + 1
              }))
              connect()
            }, delay)
          }
        }
      })
  }, [enabled, reconnectOnError, maxReconnectAttempts, subscription.channel, subscription.reconnectAttempts])

  const disconnect = useCallback(() => {
    if (subscription.channel) {
      subscription.channel.unsubscribe()
      setSubscription({
        channel: null,
        isConnected: false,
        lastHeartbeat: null,
        reconnectAttempts: 0
      })
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
  }, [subscription.channel])

  // Heartbeat mechanism
  useEffect(() => {
    if (subscription.isConnected && heartbeatInterval > 0) {
      heartbeatRef.current = setInterval(() => {
        setSubscription(prev => ({
          ...prev,
          lastHeartbeat: new Date()
        }))
      }, heartbeatInterval)

      return () => {
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current)
        }
      }
    }
  }, [subscription.isConnected, heartbeatInterval])

  useEffect(() => {
    if (enabled) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [enabled, connect, disconnect])

  return {
    isConnected: subscription.isConnected,
    lastHeartbeat: subscription.lastHeartbeat,
    reconnectAttempts: subscription.reconnectAttempts,
    connect,
    disconnect
  }
}

// Database table subscription hook
export function useRealtimeSubscription<T = any>(
  table: string,
  options: {
    enabled?: boolean
    filter?: string
    onInsert?: (payload: T) => void
    onUpdate?: (payload: T) => void
    onDelete?: (payload: { old_record: T }) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    enabled = true,
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onError
  } = options

  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const subscribe = useCallback(() => {
    if (!enabled || channelRef.current) return

    const channelName = `${table}_changes_${Date.now()}`
    const channel = supabase.channel(channelName)

    // Setup event listeners
    if (onInsert) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          try {
            onInsert(payload.new as T)
          } catch (error) {
            onError?.(error as Error)
          }
        }
      )
    }

    if (onUpdate) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          try {
            onUpdate(payload.new as T)
          } catch (error) {
            onError?.(error as Error)
          }
        }
      )
    }

    if (onDelete) {
      channel.on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          try {
            onDelete({ old_record: payload.old as T })
          } catch (error) {
            onError?.(error as Error)
          }
        }
      )
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true)
        channelRef.current = channel
      } else if (status === 'CHANNEL_ERROR') {
        setIsSubscribed(false)
        onError?.(new Error(`Failed to subscribe to ${table} changes`))
      }
    })
  }, [enabled, table, filter, onInsert, onUpdate, onDelete, onError])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
      setIsSubscribed(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [enabled, subscribe, unsubscribe])

  return {
    isSubscribed,
    subscribe,
    unsubscribe
  }
}

// Broadcast channel hook for custom events
export function useBroadcast(
  channel: string,
  options: {
    enabled?: boolean
    onReceive?: (payload: any) => void
    onError?: (error: Error) => void
  } = {}
) {
  const { enabled = true, onReceive, onError } = options
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const broadcast = useCallback((event: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      })
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const realtimeChannel = supabase.channel(channel)

    if (onReceive) {
      realtimeChannel.on('broadcast', { event: '*' }, ({ payload }) => {
        try {
          onReceive(payload)
        } catch (error) {
          onError?.(error as Error)
        }
      })
    }

    realtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true)
        channelRef.current = realtimeChannel
      } else if (status === 'CHANNEL_ERROR') {
        setIsSubscribed(false)
        onError?.(new Error(`Failed to subscribe to broadcast channel: ${channel}`))
      }
    })

    return () => {
      realtimeChannel.unsubscribe()
      channelRef.current = null
      setIsSubscribed(false)
    }
  }, [channel, enabled, onReceive, onError])

  return {
    isSubscribed,
    broadcast
  }
}