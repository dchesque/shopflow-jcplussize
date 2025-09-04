"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Types
interface AppSettings {
  refreshInterval: number;
  enableNotifications: boolean;
  enableAnimations: boolean;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  language: "pt-BR" | "en-US";
  theme: "nexus-dark" | "nexus-light";
  dashboardLayout: "grid" | "list";
}

interface UserPreferences {
  sidebarCollapsed: boolean;
  favoriteMetrics: string[];
  defaultDateRange: string;
  autoRefresh: boolean;
}

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // User preferences
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;

  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  selectedDateRange: {
    start: Date;
    end: Date;
  };
  setDateRange: (start: Date, end: Date) => void;

  // Modal/Dialog states
  modals: {
    cameraConfig: boolean;
    salesImport: boolean;
    exportData: boolean;
    settings: boolean;
  };
  openModal: (modal: keyof AppState["modals"]) => void;
  closeModal: (modal: keyof AppState["modals"]) => void;
  closeAllModals: () => void;

  // Notifications
  notifications: Array<{
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  addNotification: (notification: Omit<AppState["notifications"][0], "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // System status
  systemStatus: {
    camera: "online" | "offline" | "error";
    database: "online" | "offline" | "error";
    ai: "online" | "offline" | "error";
    bridge: "online" | "offline" | "error";
  };
  updateSystemStatus: (status: Partial<AppState["systemStatus"]>) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default settings
      settings: {
        refreshInterval: 2000,
        enableNotifications: true,
        enableAnimations: true,
        dateFormat: "dd/MM/yyyy",
        timeFormat: "24h",
        language: "pt-BR",
        theme: "nexus-dark",
        dashboardLayout: "grid",
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Default preferences
      preferences: {
        sidebarCollapsed: false,
        favoriteMetrics: ["current_people", "total_entries", "conversion_rate"],
        defaultDateRange: "today",
        autoRefresh: true,
      },
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      selectedDateRange: {
        start: new Date(),
        end: new Date(),
      },
      setDateRange: (start, end) =>
        set({ selectedDateRange: { start, end } }),

      // Modals
      modals: {
        cameraConfig: false,
        salesImport: false,
        exportData: false,
        settings: false,
      },
      openModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: true },
        })),
      closeModal: (modal) =>
        set((state) => ({
          modals: { ...state.modals, [modal]: false },
        })),
      closeAllModals: () =>
        set({
          modals: {
            cameraConfig: false,
            salesImport: false,
            exportData: false,
            settings: false,
          },
        }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: new Date(),
              read: false,
            },
            ...state.notifications.slice(0, 49), // Keep only 50 notifications
          ],
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif.id === id ? { ...notif, read: true } : notif
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // System status
      systemStatus: {
        camera: "offline",
        database: "offline",
        ai: "offline",
        bridge: "offline",
      },
      updateSystemStatus: (status) =>
        set((state) => ({
          systemStatus: { ...state.systemStatus, ...status },
        })),
    }),
    {
      name: "shopflow-app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        preferences: state.preferences,
        notifications: state.notifications.slice(0, 10), // Persist only recent notifications
      }),
    }
  )
);

// Context for dependency injection if needed
const AppStateContext = createContext<typeof useAppStore | null>(null);

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  return (
    <AppStateContext.Provider value={useAppStore}>
      {children}
    </AppStateContext.Provider>
  );
}

// Custom hooks
export function useAppState() {
  return useAppStore();
}

export function useSettings() {
  return useAppStore((state) => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
  }));
}

export function usePreferences() {
  return useAppStore((state) => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
  }));
}

export function useModals() {
  return useAppStore((state) => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals,
  }));
}

export function useNotifications() {
  return useAppStore((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    markNotificationRead: state.markNotificationRead,
    clearNotifications: state.clearNotifications,
  }));
}

export function useSystemStatus() {
  return useAppStore((state) => ({
    systemStatus: state.systemStatus,
    updateSystemStatus: state.updateSystemStatus,
  }));
}