"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { toast } from "react-hot-toast";

interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

interface MetricsData {
  current_people: number;
  total_entries: number;
  total_exits: number;
  conversion_rate: number;
  last_updated: string;
  [key: string]: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  metrics: MetricsData | null;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectDelay = 3000;

  const connect = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8001";
    const wsEndpoint = `${wsUrl}/ws/metrics`;
    
    try {
      wsRef.current = new WebSocket(wsEndpoint);

      wsRef.current.onopen = () => {
        console.log("🔌 WebSocket conectado");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Enviar mensagem de client info
        const clientInfo = {
          type: "client_info",
          data: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            page: window.location.pathname
          }
        };
        
        sendMessage(clientInfo);
        
        toast.success("Conectado ao sistema em tempo real", {
          id: "websocket-connected"
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Processar diferentes tipos de mensagem
          switch (message.type) {
            case "metrics_update":
              if (message.data) {
                setMetrics(message.data);
              }
              break;

            case "alert":
              const alertData = message as any;
              const severity = alertData.severity || "info";
              
              if (severity === "error" || severity === "critical") {
                toast.error(`${alertData.title}: ${alertData.message}`);
              } else if (severity === "warning") {
                toast.error(`${alertData.title}: ${alertData.message}`);
              } else {
                toast(`${alertData.title}: ${alertData.message}`);
              }
              break;

            case "event_notification":
              // Processar notificações de eventos (entrada/saída)
              if (message.data?.action) {
                const action = message.data.action;
                const icon = action === "ENTER" ? "👋" : "👋";
                toast(`${icon} Pessoa ${action === "ENTER" ? "entrou" : "saiu"}`, {
                  duration: 2000
                });
              }
              break;

            case "connection_established":
              console.log("✅ Conexão WebSocket estabelecida");
              break;

            case "pong":
              // Resposta ao ping - não fazer nada
              break;

            default:
              console.log("📨 Mensagem WebSocket:", message);
          }
        } catch (error) {
          console.error("❌ Erro ao processar mensagem WebSocket:", error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket desconectado", event.code, event.reason);
        setIsConnected(false);
        
        if (event.code !== 1000) { // Not a normal closure
          toast.error("Conexão perdida. Tentando reconectar...", {
            id: "websocket-disconnected"
          });
        }

        // Tentar reconectar automaticamente
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`🔄 Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
            connect();
          }, reconnectDelay * reconnectAttemptsRef.current); // Backoff exponencial
        } else {
          toast.error("Não foi possível reconectar. Recarregue a página.", {
            duration: 10000
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ Erro WebSocket:", error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error("❌ Erro ao conectar WebSocket:", error);
      setIsConnected(false);
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error("❌ Erro ao enviar mensagem WebSocket:", error);
      }
    } else {
      console.warn("⚠️ WebSocket não está conectado");
    }
  };

  const reconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    reconnectAttemptsRef.current = 0;
    connect();
  };

  // Conectar quando o componente for montado
  useEffect(() => {
    connect();

    // Cleanup ao desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  // Heartbeat/Ping a cada 30 segundos
  useEffect(() => {
    let pingInterval: NodeJS.Timeout;

    if (isConnected) {
      pingInterval = setInterval(() => {
        sendMessage({ type: "ping", timestamp: Date.now() });
      }, 30000);
    }

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [isConnected]);

  const contextValue: WebSocketContextType = {
    isConnected,
    metrics,
    lastMessage,
    sendMessage,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  
  return context;
}