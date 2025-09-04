"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MetricCard } from "@/components/ui/metric-card";
// import { useWebSocket } from "@/components/providers/websocket-provider";
import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
} from "lucide-react";

export default function HomePage() {
  // const { metrics, isConnected } = useWebSocket();
  const metrics = null;
  const isConnected = false;

  // Dados de exemplo para demonstração
  const mockMetrics = {
    current_people: 42,
    total_entries: 347,
    total_exits: 305,
    sales_today: 28,
    revenue_today: 4250.75,
    conversion_rate: 8.1,
    avg_time_spent: "12min 30s",
    peak_hour: 14,
    peak_count: 65,
  };

  const displayMetrics = metrics || mockMetrics;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 bg-blue-900 min-h-screen text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Principal
            </h1>
            <p className="text-foreground-secondary mt-1">
              Visão geral do tráfego e vendas em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                isConnected ? "bg-success" : "bg-danger"
              }`}
            ></div>
            <span
              className={`text-sm font-medium ${
                isConnected ? "text-success" : "text-danger"
              }`}
            >
              {isConnected ? "Sistema Online" : "Sistema Offline"}
            </span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Pessoas Atuais"
            value={displayMetrics.current_people}
            icon={Users}
            description="no estabelecimento"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Entradas Hoje"
            value={displayMetrics.total_entries}
            previousValue={320}
            icon={UserPlus}
            description="vs ontem"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Saídas Hoje"
            value={displayMetrics.total_exits}
            previousValue={285}
            icon={UserMinus}
            description="vs ontem"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Taxa de Conversão"
            value={`${displayMetrics.conversion_rate}%`}
            previousValue={7.2}
            icon={Target}
            description="vendas/visitas"
            loading={!displayMetrics && !metrics}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vendas Hoje"
            value={displayMetrics.sales_today}
            previousValue={24}
            icon={DollarSign}
            description="transações"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Receita Hoje"
            value={`R$ ${displayMetrics.revenue_today?.toLocaleString('pt-BR') || '0'}`}
            previousValue={3850}
            icon={TrendingUp}
            description="faturamento"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Tempo Médio"
            value={displayMetrics.avg_time_spent}
            icon={Clock}
            description="permanência"
            loading={!displayMetrics && !metrics}
          />

          <MetricCard
            title="Pico do Dia"
            value={`${displayMetrics.peak_count} pessoas`}
            icon={TrendingUp}
            description={`às ${displayMetrics.peak_hour}h`}
            loading={!displayMetrics && !metrics}
          />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Status do Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Câmeras</span>
                <span className="text-success font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">IA</span>
                <span className="text-success font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Bridge</span>
                <span className="text-success font-medium">Conectado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Database</span>
                <span className="text-success font-medium">Online</span>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Performance Hoje
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Uptime</span>
                <span className="text-success font-medium">99.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">FPS Médio</span>
                <span className="text-foreground font-medium">28.5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Precisão IA</span>
                <span className="text-success font-medium">94.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-secondary">Latência</span>
                <span className="text-foreground font-medium">45ms</span>
              </div>
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Alertas Recentes
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-foreground">Alta ocupação</p>
                  <p className="text-xs text-foreground-muted">há 15min</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-foreground">Backup concluído</p>
                  <p className="text-xs text-foreground-muted">há 2h</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-foreground">Sistema iniciado</p>
                  <p className="text-xs text-foreground-muted">há 8h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}