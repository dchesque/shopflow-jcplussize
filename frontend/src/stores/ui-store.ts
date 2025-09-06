import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UIStore } from '@/types'

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        theme: 'dark',
        setTheme: (theme: 'dark' | 'light') => set({ theme }),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
      }
    ),
    { name: 'ui-store' }
  )
)