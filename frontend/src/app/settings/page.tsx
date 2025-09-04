"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChartCard } from "@/components/ui/chart-card";
import { useSettings } from "@/components/providers/app-state-provider";
import {
  Settings,
  Bell,
  Monitor,
  Clock,
  Globe,
  Palette,
  Database,
  Mail,
  Shield,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
    setHasChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    setHasChanges(false);
  };

  const resetSettings = () => {
    // Reset para configurações padrão
    updateSettings({
      refreshInterval: 2000,
      enableNotifications: true,
      enableAnimations: true,
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      language: "pt-BR",
      theme: "nexus-dark",
      dashboardLayout: "grid",
    });
    setHasChanges(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-foreground-secondary mt-1">
              Personalize a experiência do sistema
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-warning">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Alterações não salvas</span>
              </div>
            )}
            
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restaurar</span>
            </button>
            
            <button
              onClick={saveSettings}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </div>

        {/* General Settings */}
        <ChartCard
          title="Configurações Gerais"
          subtitle="Preferências básicas do sistema"
          icon={Settings}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Intervalo de Atualização
                </label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleSettingChange("refreshInterval", parseInt(e.target.value))}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={1000}>1 segundo</option>
                  <option value={2000}>2 segundos</option>
                  <option value={5000}>5 segundos</option>
                  <option value={10000}>10 segundos</option>
                </select>
                <p className="text-xs text-foreground-muted mt-1">
                  Frequência de atualização dos dados em tempo real
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Idioma
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange("language", e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Layout do Dashboard
                </label>
                <select
                  value={settings.dashboardLayout}
                  onChange={(e) => handleSettingChange("dashboardLayout", e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="grid">Grade</option>
                  <option value="list">Lista</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Formato de Data
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange("dateFormat", e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                  <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Formato de Hora
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => handleSettingChange("timeFormat", e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="24h">24 horas</option>
                  <option value="12h">12 horas (AM/PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tema
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange("theme", e.target.value)}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="nexus-dark">Nexus Dark</option>
                  <option value="nexus-light">Nexus Light</option>
                </select>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Interface Settings */}
        <ChartCard
          title="Interface"
          subtitle="Personalização da experiência visual"
          icon={Monitor}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-glass-light rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Notificações</h3>
                  <p className="text-sm text-foreground-secondary">
                    Receba alertas sobre eventos importantes
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange("enableNotifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-glass-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-glass-light rounded-lg">
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-medium text-foreground">Animações</h3>
                  <p className="text-sm text-foreground-secondary">
                    Ative transições e efeitos visuais
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableAnimations}
                  onChange={(e) => handleSettingChange("enableAnimations", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-glass-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </ChartCard>

        {/* Notification Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Configurações de Alerta"
            subtitle="Personalize quando ser notificado"
            icon={Bell}
          >
            <div className="space-y-4">
              {[
                {
                  name: "Alta ocupação",
                  description: "Quando o número de pessoas exceder o limite",
                  enabled: true,
                  threshold: "90%"
                },
                {
                  name: "Câmera offline",
                  description: "Quando uma câmera parar de responder",
                  enabled: true,
                  threshold: "Imediato"
                },
                {
                  name: "Erro de sistema",
                  description: "Problemas técnicos nos serviços",
                  enabled: true,
                  threshold: "Imediato"
                },
                {
                  name: "Backup concluído",
                  description: "Confirmação de backups automáticos",
                  enabled: false,
                  threshold: "Diário"
                },
              ].map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{alert.name}</h4>
                    <p className="text-sm text-foreground-secondary">{alert.description}</p>
                    <span className="text-xs text-foreground-muted">Limite: {alert.threshold}</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={alert.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-glass-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Integração de E-mail"
            subtitle="Configure notificações por e-mail"
            icon={Mail}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Porta
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Segurança
                  </label>
                  <select className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option>TLS</option>
                    <option>SSL</option>
                    <option>Nenhum</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mail do Remetente
                </label>
                <input
                  type="email"
                  placeholder="sistema@shopflow.com"
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  E-mails de Destino
                </label>
                <textarea
                  placeholder="admin@empresa.com, gerente@empresa.com"
                  rows={3}
                  className="w-full bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Separar múltiplos e-mails com vírgula
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-sm text-foreground">Status: Não configurado</span>
                <button className="text-sm text-primary hover:text-primary-light transition-colors">
                  Testar Conexão
                </button>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Data & Privacy */}
        <ChartCard
          title="Dados e Privacidade"
          subtitle="Configurações de retenção e backup"
          icon={Database}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Retenção de Dados</span>
              </h4>

              {[
                { name: "Imagens de Câmeras", current: "7 dias", max: "30 dias" },
                { name: "Dados de Tráfego", current: "2 anos", max: "5 anos" },
                { name: "Logs do Sistema", current: "90 dias", max: "1 ano" },
                { name: "Relatórios", current: "5 anos", max: "Indefinido" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground-secondary">Máximo: {item.max}</p>
                  </div>
                  <select className="bg-background-secondary border border-border rounded px-2 py-1 text-sm text-foreground">
                    <option>{item.current}</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Backup e Segurança</span>
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Backup Automático</p>
                    <p className="text-xs text-foreground-secondary">Diário às 02:00</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>

                <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Criptografia</p>
                    <p className="text-xs text-foreground-secondary">AES-256</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>

                <div className="flex items-center justify-between p-3 bg-glass-light rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Auditoria</p>
                    <p className="text-xs text-foreground-secondary">Logs de acesso</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <button className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors">
                  Executar Backup Manual
                </button>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Save Confirmation */}
        {!hasChanges && (
          <div className="flex items-center justify-center p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-success mr-2" />
            <span className="text-success">Todas as configurações estão salvas</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}