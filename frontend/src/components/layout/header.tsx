"use client";

import React from "react";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { usePreferences, useNotifications, useSystemStatus } from "@/components/providers/app-state-provider";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import {
  Bell,
  Settings,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
} from "lucide-react";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { isConnected, metrics } = useWebSocket();
  const { preferences } = usePreferences();
  const { notifications } = useNotifications();
  const { systemStatus } = useSystemStatus();
  
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const currentTime = new Date();

  const getSystemStatusColor = () => {
    const statuses = Object.values(systemStatus);
    if (statuses.includes("error")) return "text-danger";
    if (statuses.includes("offline")) return "text-warning";
    return "text-success";
  };

  const getSystemStatusIcon = () => {
    const statuses = Object.values(systemStatus);
    if (statuses.includes("error")) return AlertCircle;
    if (statuses.includes("offline")) return AlertCircle;
    return CheckCircle;
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-background-secondary/95 backdrop-blur-md border-b border-border transition-all duration-300",
        preferences.sidebarCollapsed ? "left-16" : "left-64",
        className
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Page info and breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
            <p className="text-sm text-foreground-secondary">
              Análise em tempo real • {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Right: Status and actions */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-success" />
                <span className="text-sm text-success hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-danger" />
                <span className="text-sm text-danger hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Real-time Metrics */}
          {metrics && (
            <div className="hidden md:flex items-center space-x-4 px-3 py-1.5 bg-glass-light rounded-lg border border-border">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-sm text-foreground-secondary">
                  {metrics.current_people} pessoas
                </span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="text-sm text-foreground-secondary">
                {metrics.total_entries} entradas
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="flex items-center space-x-1">
            {React.createElement(getSystemStatusIcon(), {
              className: `w-4 h-4 ${getSystemStatusColor()}`,
            })}
            <span className={`text-sm ${getSystemStatusColor()} hidden lg:inline`}>
              Sistema
            </span>
          </div>

          {/* Notifications */}
          <button
            className="relative p-2 text-foreground-secondary hover:text-foreground hover:bg-glass-light rounded-lg transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            className="p-2 text-foreground-secondary hover:text-foreground hover:bg-glass-light rounded-lg transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-border">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">Administrador</p>
              <p className="text-xs text-foreground-secondary">Sistema</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}