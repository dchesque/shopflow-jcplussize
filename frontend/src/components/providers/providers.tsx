"use client";

import React from "react";
import { SupabaseProvider } from "./supabase-provider";
import { WebSocketProvider } from "./websocket-provider";
import { AppStateProvider } from "./app-state-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AppStateProvider>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </AppStateProvider>
    </SupabaseProvider>
  );
}