"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/providers/app-state-provider";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  Shield,
  Camera,
  Bell,
  PieChart,
  FileText,
  Calendar,
  ChevronLeft,
  Activity,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Visão geral em tempo real",
  },
  {
    name: "Análises",
    href: "/analytics",
    icon: TrendingUp,
    description: "Relatórios e métricas",
    children: [
      { name: "Tráfego", href: "/analytics/traffic" },
      { name: "Vendas", href: "/analytics/sales" },
      { name: "Comparativos", href: "/analytics/comparisons" },
    ],
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: FileText,
    description: "Exportação de dados",
    children: [
      { name: "Diário", href: "/reports/daily" },
      { name: "Semanal", href: "/reports/weekly" },
      { name: "Mensal", href: "/reports/monthly" },
      { name: "Personalizado", href: "/reports/custom" },
    ],
  },
  {
    name: "Funcionários",
    href: "/employees",
    icon: Users,
    description: "Gestão de equipe",
  },
  {
    name: "Privacidade",
    href: "/privacy",
    icon: Shield,
    description: "LGPD e configurações",
    children: [
      { name: "Consentimentos", href: "/privacy/consents" },
      { name: "Dados", href: "/privacy/data" },
      { name: "Configurações", href: "/privacy/settings" },
    ],
  },
  {
    name: "Sistema",
    href: "/system",
    icon: Activity,
    description: "Status e configurações",
    children: [
      { name: "Câmeras", href: "/system/cameras" },
      { name: "Alertas", href: "/system/alerts" },
      { name: "Logs", href: "/system/logs" },
      { name: "Bridge", href: "/system/bridge" },
    ],
  },
  {
    name: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Preferências do sistema",
  },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { preferences, updatePreferences } = usePreferences();
  const { sidebarCollapsed } = preferences;

  const toggleSidebar = () => {
    updatePreferences({ sidebarCollapsed: !sidebarCollapsed });
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background-secondary border-r border-border transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">ShopFlow</h1>
              <p className="text-xs text-foreground-secondary">Analytics</p>
            </div>
          </div>
        )}
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-glass-light transition-colors",
            sidebarCollapsed && "mx-auto"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 text-foreground-secondary transition-transform duration-300",
              sidebarCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-foreground-secondary hover:bg-glass-light hover:text-foreground",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 w-5 h-5",
                    active ? "text-white" : "text-foreground-muted",
                    !sidebarCollapsed && "mr-3"
                  )}
                />
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-foreground-muted">
                      {item.description}
                    </div>
                  </div>
                )}
              </Link>

              {/* Subitens - apenas para sidebar expandida */}
              {!sidebarCollapsed && item.children && active && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "block px-3 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-glass-light rounded-lg transition-colors",
                        pathname === child.href && "text-primary bg-primary/10"
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Status Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-foreground-muted">
            <div className="flex items-center justify-between mb-2">
              <span>Status do Sistema</span>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Câmeras</span>
                <span className="text-success">Online</span>
              </div>
              <div className="flex justify-between">
                <span>IA</span>
                <span className="text-success">Ativa</span>
              </div>
              <div className="flex justify-between">
                <span>Bridge</span>
                <span className="text-success">Conectado</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}