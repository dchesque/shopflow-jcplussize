"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { useWebSocket } from "@/components/providers/websocket-provider";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Download,
} from "lucide-react";

export default function AnalyticsPage() {
  const { metrics, isConnected } = useWebSocket();
  const [dateRange, setDateRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("traffic");

  // Dados mock para demonstração
  const mockAnalytics = {
    totalVisitors: 12543,
    avgVisitDuration: "14min 32s",
    peakHour: "15:00",
    conversionRate: 8.7,
    totalSales: 1089,
    totalRevenue: 45678.90,
    returnVisitors: 23.4,
    bounceRate: 12.8,
  };

  const trafficData = [
    { hour: "09:00", visitors: 45, entries: 48, exits: 42 },
    { hour: "10:00", visitors: 67, entries: 69, exits: 65 },
    { hour: "11:00", visitors: 89, entries: 92, exits: 87 },
    { hour: "12:00", visitors: 156, entries: 159, exits: 151 },
    { hour: "13:00", visitors: 234, entries: 238, exits: 229 },
    { hour: "14:00", visitors: 298, entries: 305, exits: 291 },
    { hour: "15:00", visitors: 345, entries: 352, exits: 338 },
    { hour: "16:00", visitors: 312, entries: 318, exits: 306 },
    { hour: "17:00", visitors: 278, entries: 285, exits: 271 },
    { hour: "18:00", visitors: 189, entries: 194, exits: 184 },
  ];

  const salesData = [
    { day: "Seg", sales: 89, revenue: 3456 },
    { day: "Ter", sales: 123, revenue: 4789 },
    { day: "Qua", sales: 156, revenue: 6234 },
    { day: "Qui", sales: 198, revenue: 7890 },
    { day: "Sex", sales: 234, revenue: 9123 },
    { day: "Sáb", sales: 289, revenue: 11567 },
    { day: "Dom", sales: 178, revenue: 6789 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Análises</h1>
            <p className="text-foreground-secondary mt-1">
              Relatórios detalhados e métricas de performance
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="1d">Hoje</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
              <option value="90d">90 dias</option>
            </select>
            
            <button className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total de Visitantes"
            value={mockAnalytics.totalVisitors}
            previousValue={11234}
            icon={Users}
            description="últimos 7 dias"
          />
          
          <MetricCard
            title="Tempo Médio"
            value={mockAnalytics.avgVisitDuration}
            icon={Activity}
            description="de permanência"
            trend="up"
            trendValue={8.3}
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value={`${mockAnalytics.conversionRate}%`}
            previousValue={7.9}
            icon={Target}
            description="vendas/visitas"
          />
          
          <MetricCard
            title="Receita Total"
            value={`R$ ${mockAnalytics.totalRevenue.toLocaleString('pt-BR')}`}
            previousValue={42340}
            icon={TrendingUp}
            description="últimos 7 dias"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Overview */}
          <ChartCard
            title="Tráfego por Horário"
            subtitle="Entradas e saídas durante o dia"
            icon={BarChart3}
            actions={
              <select
                className="bg-background-secondary border border-border rounded px-3 py-1 text-sm text-foreground"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="traffic">Tráfego</option>
                <option value="entries">Entradas</option>
                <option value="exits">Saídas</option>
              </select>
            }
          >
            <div className="h-64 flex items-end space-x-2">
              {trafficData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full bg-glass-light rounded-t-lg relative overflow-hidden">
                    <div 
                      className="bg-primary rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${(item.visitors / 345) * 160}px`,
                        minHeight: '2px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-foreground-muted transform -rotate-45 origin-center">
                    {item.hour}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-foreground-secondary">Visitantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-cyan rounded-full"></div>
                <span className="text-foreground-secondary">Entradas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-orange rounded-full"></div>
                <span className="text-foreground-secondary">Saídas</span>
              </div>
            </div>
          </ChartCard>

          {/* Sales Overview */}
          <ChartCard
            title="Vendas Semanais"
            subtitle="Vendas e receita por dia"
            icon={ShoppingBag}
          >
            <div className="h-64 flex items-end space-x-3">
              {salesData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full bg-glass-light rounded-t-lg relative overflow-hidden">
                    <div 
                      className="bg-accent-cyan rounded-t-lg transition-all duration-500"
                      style={{ 
                        height: `${(item.sales / 289) * 160}px`,
                        minHeight: '2px'
                      }}
                    />
                  </div>
                  <span className="text-xs text-foreground-muted">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-foreground-muted">Total de Vendas</p>
                <p className="text-lg font-semibold text-foreground">
                  {salesData.reduce((sum, item) => sum + item.sales, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-foreground-muted">Receita Total</p>
                <p className="text-lg font-semibold text-foreground">
                  R$ {salesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Peak Hours */}
          <ChartCard
            title="Horários de Pico"
            subtitle="Momentos de maior movimento"
            icon={Calendar}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div>
                  <p className="font-medium text-foreground">15:00 - 16:00</p>
                  <p className="text-sm text-foreground-secondary">Horário principal</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">345</p>
                  <p className="text-xs text-foreground-muted">visitantes</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div>
                  <p className="font-medium text-foreground">14:00 - 15:00</p>
                  <p className="text-sm text-foreground-secondary">Segundo pico</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent-cyan">298</p>
                  <p className="text-xs text-foreground-muted">visitantes</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div>
                  <p className="font-medium text-foreground">13:00 - 14:00</p>
                  <p className="text-sm text-foreground-secondary">Terceiro pico</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent-purple">234</p>
                  <p className="text-xs text-foreground-muted">visitantes</p>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Conversion Funnel */}
          <ChartCard
            title="Funil de Conversão"
            subtitle="Jornada do visitante"
            icon={PieChart}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Visitantes</span>
                  <span className="text-foreground">12,543</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Interessados</span>
                  <span className="text-foreground">3,891 (31%)</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div className="bg-accent-cyan h-2 rounded-full" style={{width: '31%'}}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Compradores</span>
                  <span className="text-foreground">1,089 (8.7%)</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{width: '8.7%'}}></div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-glass-light rounded-lg">
                <p className="text-sm text-foreground-secondary mb-1">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-success">8.7%</p>
                <p className="text-xs text-foreground-muted">↑ 12% vs período anterior</p>
              </div>
            </div>
          </ChartCard>

          {/* Top Performance */}
          <ChartCard
            title="Performance Diária"
            subtitle="Indicadores principais"
            icon={TrendingUp}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-foreground">Pico de Vendas</p>
                    <p className="text-sm text-foreground-secondary">Hoje às 15:30</p>
                  </div>
                </div>
                <p className="font-semibold text-success">R$ 1,234</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Maior Tráfego</p>
                    <p className="text-sm text-foreground-secondary">Hoje às 15:00</p>
                  </div>
                </div>
                <p className="font-semibold text-primary">345 pessoas</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-accent-purple rounded-full"></div>
                  <div>
                    <p className="font-medium text-foreground">Tempo Recorde</p>
                    <p className="text-sm text-foreground-secondary">Maior permanência</p>
                  </div>
                </div>
                <p className="font-semibold text-accent-purple">28min</p>
              </div>
              
              <div className="mt-4 p-3 bg-gradient-primary rounded-lg text-white">
                <p className="text-sm opacity-90 mb-1">Score de Performance</p>
                <p className="text-2xl font-bold">94/100</p>
                <p className="text-xs opacity-75">Excelente desempenho!</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}