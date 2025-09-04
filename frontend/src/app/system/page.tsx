"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChartCard } from "@/components/ui/chart-card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Activity,
  Camera,
  Wifi,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  Power,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Zap,
  Thermometer,
  Network,
} from "lucide-react";

export default function SystemPage() {
  const [refreshing, setRefreshing] = useState(false);

  const systemStats = {
    uptime: "15d 8h 32m",
    cpuUsage: 23.5,
    memoryUsage: 67.2,
    diskUsage: 45.8,
    networkIn: 1.2, // MB/s
    networkOut: 0.8, // MB/s
    temperature: 42, // Celsius
    powerConsumption: 85, // Watts
  };

  const services = [
    {
      name: "API Principal",
      status: "online",
      uptime: "99.98%",
      lastRestart: "2024-01-01 10:00",
      port: 8001,
      version: "v2.1.4",
    },
    {
      name: "Bridge de Câmeras",
      status: "online",
      uptime: "99.95%",
      lastRestart: "2024-01-10 14:30",
      port: 8002,
      version: "v1.8.2",
    },
    {
      name: "Engine de IA",
      status: "online",
      uptime: "99.92%",
      lastRestart: "2024-01-12 09:15",
      port: 8003,
      version: "v3.0.1",
    },
    {
      name: "WebSocket Server",
      status: "online",
      uptime: "99.99%",
      lastRestart: "2024-01-01 10:01",
      port: 8080,
      version: "v1.5.0",
    },
    {
      name: "Database",
      status: "warning",
      uptime: "99.85%",
      lastRestart: "2024-01-14 16:45",
      port: 5432,
      version: "PostgreSQL 14.2",
    },
    {
      name: "Redis Cache",
      status: "online",
      uptime: "99.97%",
      lastRestart: "2024-01-05 12:20",
      port: 6379,
      version: "v6.2.6",
    },
  ];

  const cameras = [
    {
      id: "cam-001",
      name: "Entrada Principal",
      status: "online",
      fps: 28.5,
      resolution: "1920x1080",
      lastSeen: "Agora",
      ip: "192.168.1.101",
      model: "Hikvision DS-2CD2086G2",
    },
    {
      id: "cam-002",
      name: "Saída Principal",
      status: "online",
      fps: 27.8,
      resolution: "1920x1080",
      lastSeen: "Agora",
      ip: "192.168.1.102",
      model: "Hikvision DS-2CD2086G2",
    },
    {
      id: "cam-003",
      name: "Área de Vendas",
      status: "warning",
      fps: 15.2,
      resolution: "1280x720",
      lastSeen: "5 min atrás",
      ip: "192.168.1.103",
      model: "Dahua IPC-HDW3449H",
    },
    {
      id: "cam-004",
      name: "Estoque",
      status: "offline",
      fps: 0,
      resolution: "N/A",
      lastSeen: "2 horas atrás",
      ip: "192.168.1.104",
      model: "Hikvision DS-2CD2043G0",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "offline":
        return <AlertCircle className="w-4 h-4 text-danger" />;
      default:
        return <AlertCircle className="w-4 h-4 text-foreground-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success/20 text-success";
      case "warning":
        return "bg-warning/20 text-warning";
      case "offline":
        return "bg-danger/20 text-danger";
      default:
        return "bg-glass-light text-foreground-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online";
      case "warning":
        return "Atenção";
      case "offline":
        return "Offline";
      default:
        return "Desconhecido";
    }
  };

  const refreshSystem = async () => {
    setRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sistema</h1>
            <p className="text-foreground-secondary mt-1">
              Monitoramento e configuração da infraestrutura
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={refreshSystem}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Uptime"
            value={systemStats.uptime}
            icon={Activity}
            description="tempo ativo"
          />
          
          <MetricCard
            title="CPU"
            value={`${systemStats.cpuUsage}%`}
            icon={Cpu}
            description="utilização"
            trend={systemStats.cpuUsage > 80 ? "up" : "neutral"}
          />
          
          <MetricCard
            title="Memória"
            value={`${systemStats.memoryUsage}%`}
            icon={MemoryStick}
            description="utilização"
            trend={systemStats.memoryUsage > 80 ? "up" : "neutral"}
          />
          
          <MetricCard
            title="Temperatura"
            value={`${systemStats.temperature}°C`}
            icon={Thermometer}
            description="sistema"
            trend={systemStats.temperature > 70 ? "up" : "neutral"}
          />
        </div>

        {/* Services Status */}
        <ChartCard
          title="Status dos Serviços"
          subtitle="Monitoramento de todos os componentes"
          icon={Activity}
          actions={
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">Todos os serviços operacionais</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 bg-glass-light border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-glass-light rounded-lg">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{service.name}</h3>
                      <p className="text-xs text-foreground-secondary">Porta: {service.port}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(service.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs text-foreground-muted">
                  <div>
                    <span className="block">Uptime</span>
                    <span className="font-medium text-foreground">{service.uptime}</span>
                  </div>
                  <div>
                    <span className="block">Versão</span>
                    <span className="font-medium text-foreground">{service.version}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-muted">Último restart: {service.lastRestart}</span>
                    <button className="text-primary hover:text-primary-light transition-colors">
                      Gerenciar →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Cameras Status */}
        <ChartCard
          title="Status das Câmeras"
          subtitle="Monitoramento das câmeras em tempo real"
          icon={Camera}
          actions={
            <button className="text-sm text-primary hover:text-primary-light transition-colors">
              Configurar Câmeras →
            </button>
          }
        >
          <div className="space-y-4">
            {cameras.map((camera) => (
              <div key={camera.id} className="p-4 bg-glass-light border border-border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-glass-light rounded-lg">
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{camera.name}</h3>
                      <p className="text-xs text-foreground-secondary">{camera.model}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(camera.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camera.status)}`}>
                      {getStatusText(camera.status)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-xs text-foreground-muted">
                  <div>
                    <span className="block">FPS</span>
                    <span className="font-medium text-foreground">
                      {camera.fps > 0 ? camera.fps.toFixed(1) : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block">Resolução</span>
                    <span className="font-medium text-foreground">{camera.resolution}</span>
                  </div>
                  <div>
                    <span className="block">IP</span>
                    <span className="font-medium text-foreground">{camera.ip}</span>
                  </div>
                  <div>
                    <span className="block">Última vez vista</span>
                    <span className="font-medium text-foreground">{camera.lastSeen}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                      <span>ID: {camera.id}</span>
                      <span>Stream: RTSP</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-1 rounded hover:bg-glass-medium transition-colors" title="Visualizar Stream">
                        <Monitor className="w-3 h-3 text-primary" />
                      </button>
                      <button className="p-1 rounded hover:bg-glass-medium transition-colors" title="Configurações">
                        <Settings className="w-3 h-3 text-foreground-muted" />
                      </button>
                      <button className="p-1 rounded hover:bg-glass-medium transition-colors" title="Reiniciar">
                        <RefreshCw className="w-3 h-3 text-foreground-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* System Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Recursos do Sistema"
            subtitle="Utilização em tempo real"
            icon={Cpu}
          >
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <Cpu className="w-4 h-4" />
                    <span>CPU</span>
                  </span>
                  <span className="text-sm text-foreground-secondary">{systemStats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemStats.cpuUsage > 80 ? 'bg-danger' : 
                      systemStats.cpuUsage > 60 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${systemStats.cpuUsage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4" />
                    <span>Memória</span>
                  </span>
                  <span className="text-sm text-foreground-secondary">{systemStats.memoryUsage}%</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemStats.memoryUsage > 80 ? 'bg-danger' : 
                      systemStats.memoryUsage > 60 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${systemStats.memoryUsage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <HardDrive className="w-4 h-4" />
                    <span>Disco</span>
                  </span>
                  <span className="text-sm text-foreground-secondary">{systemStats.diskUsage}%</span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      systemStats.diskUsage > 80 ? 'bg-danger' : 
                      systemStats.diskUsage > 60 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${systemStats.diskUsage}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-accent-cyan" />
                    <div>
                      <p className="text-foreground">Rede (In)</p>
                      <p className="text-foreground-secondary">{systemStats.networkIn} MB/s</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Network className="w-4 h-4 text-accent-purple" />
                    <div>
                      <p className="text-foreground">Rede (Out)</p>
                      <p className="text-foreground-secondary">{systemStats.networkOut} MB/s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard
            title="Status de Energia"
            subtitle="Consumo e temperatura"
            icon={Zap}
          >
            <div className="space-y-4">
              <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-90" />
                <p className="text-2xl font-bold">{systemStats.powerConsumption}W</p>
                <p className="text-sm opacity-75">Consumo Atual</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-glass-light rounded-lg text-center">
                  <Thermometer className="w-6 h-6 mx-auto mb-2 text-warning" />
                  <p className="font-semibold text-foreground">{systemStats.temperature}°C</p>
                  <p className="text-xs text-foreground-secondary">Temperatura</p>
                </div>
                
                <div className="p-3 bg-glass-light rounded-lg text-center">
                  <Power className="w-6 h-6 mx-auto mb-2 text-success" />
                  <p className="font-semibold text-foreground">Estável</p>
                  <p className="text-xs text-foreground-secondary">Fonte</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Consumo Médio (24h)</span>
                  <span className="text-foreground">78W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Pico Máximo</span>
                  <span className="text-foreground">145W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Eficiência</span>
                  <span className="text-success">94.2%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">Sistema Saudável</span>
                </div>
                <p className="text-xs text-success/80 mt-1">
                  Todos os parâmetros dentro da normalidade
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}