"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChartCard } from "@/components/ui/chart-card";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Mail,
  Clock,
  BarChart3,
  FileSpreadsheet,
  FileImage,
  Settings,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  frequency: string;
  lastGenerated: string;
  format: string[];
  status: "active" | "inactive" | "generating";
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedFormat, setSelectedFormat] = useState("pdf");

  const reportTemplates: ReportTemplate[] = [
    {
      id: "daily-traffic",
      name: "Relatório Diário de Tráfego",
      description: "Métricas diárias de entrada, saída e ocupação",
      frequency: "Diário às 23:00",
      lastGenerated: "2024-01-15 23:00",
      format: ["pdf", "excel", "csv"],
      status: "active",
    },
    {
      id: "weekly-sales",
      name: "Relatório Semanal de Vendas",
      description: "Análise semanal de conversão e receita",
      frequency: "Segundas às 08:00",
      lastGenerated: "2024-01-15 08:00",
      format: ["pdf", "excel"],
      status: "active",
    },
    {
      id: "monthly-performance",
      name: "Performance Mensal",
      description: "Relatório completo de métricas mensais",
      frequency: "Todo dia 1º às 09:00",
      lastGenerated: "2024-01-01 09:00",
      format: ["pdf"],
      status: "inactive",
    },
    {
      id: "custom-analytics",
      name: "Análise Personalizada",
      description: "Relatório customizável com métricas específicas",
      frequency: "Manual",
      lastGenerated: "2024-01-10 14:30",
      format: ["pdf", "excel", "csv", "json"],
      status: "generating",
    },
  ];

  const quickReports = [
    { name: "Hoje", period: "today", icon: Calendar },
    { name: "Ontem", period: "yesterday", icon: Calendar },
    { name: "Esta Semana", period: "week", icon: Calendar },
    { name: "Mês Atual", period: "month", icon: Calendar },
  ];

  const formatIcons = {
    pdf: FileImage,
    excel: FileSpreadsheet,
    csv: FileText,
    json: FileText,
  };

  const generateQuickReport = (period: string) => {
    console.log(`Gerando relatório para: ${period}`);
    // Aqui seria a lógica para gerar o relatório
  };

  const toggleReportStatus = (reportId: string) => {
    console.log(`Alternando status do relatório: ${reportId}`);
    // Aqui seria a lógica para ativar/desativar relatório
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-foreground-secondary mt-1">
              Gere e agende relatórios automáticos
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configurar</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors">
              <FileText className="w-4 h-4" />
              <span>Novo Relatório</span>
            </button>
          </div>
        </div>

        {/* Quick Reports */}
        <ChartCard
          title="Relatórios Rápidos"
          subtitle="Gere relatórios instantâneos"
          icon={BarChart3}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report) => (
              <button
                key={report.period}
                onClick={() => generateQuickReport(report.period)}
                className="p-4 bg-glass-light border border-border rounded-lg hover:bg-glass-medium transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <report.icon className="w-5 h-5 text-primary group-hover:text-primary-light transition-colors" />
                  <h3 className="font-medium text-foreground">{report.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm text-foreground-secondary">Gerar PDF</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">Relatório Personalizado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="quarter">Este Trimestre</option>
                    <option value="custom">Período Personalizado</option>
                  </select>

                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="bg-background-secondary border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>

                  <button
                    onClick={() => generateQuickReport(selectedPeriod)}
                    className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Gerar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Scheduled Reports */}
        <ChartCard
          title="Relatórios Agendados"
          subtitle="Geração automática de relatórios"
          icon={Clock}
        >
          <div className="space-y-4">
            {reportTemplates.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-glass-light border border-border rounded-lg hover:bg-glass-medium transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-foreground">{report.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "active"
                          ? "bg-success/20 text-success"
                          : report.status === "generating"
                          ? "bg-warning/20 text-warning"
                          : "bg-danger/20 text-danger"
                      }`}
                    >
                      {report.status === "active"
                        ? "Ativo"
                        : report.status === "generating"
                        ? "Gerando"
                        : "Inativo"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-secondary mb-2">
                    {report.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{report.frequency}</span>
                    </span>
                    <span>Último: {report.lastGenerated}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Format Icons */}
                  <div className="flex items-center space-x-1">
                    {report.format.map((format) => {
                      const IconComponent = formatIcons[format as keyof typeof formatIcons];
                      return (
                        <div
                          key={format}
                          className="p-1 bg-glass-light rounded border border-border"
                          title={format.toUpperCase()}
                        >
                          <IconComponent className="w-3 h-3 text-foreground-muted" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleReportStatus(report.id)}
                      className="p-2 rounded-lg hover:bg-glass-medium transition-colors"
                      title={report.status === "active" ? "Pausar" : "Ativar"}
                    >
                      {report.status === "active" ? (
                        <PauseCircle className="w-4 h-4 text-warning" />
                      ) : (
                        <PlayCircle className="w-4 h-4 text-success" />
                      )}
                    </button>

                    <button
                      className="p-2 rounded-lg hover:bg-glass-medium transition-colors"
                      title="Gerar agora"
                    >
                      <Download className="w-4 h-4 text-primary" />
                    </button>

                    <button
                      className="p-2 rounded-lg hover:bg-glass-medium transition-colors"
                      title="Configurações"
                    >
                      <Settings className="w-4 h-4 text-foreground-muted" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Configurações de E-mail</h4>
                <p className="text-sm text-foreground-secondary">
                  Receba relatórios automaticamente por e-mail
                </p>
              </div>
              <button className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors">
                <Mail className="w-4 h-4" />
                <span>Configurar E-mails</span>
              </button>
            </div>
          </div>
        </ChartCard>

        {/* Recent Reports */}
        <ChartCard
          title="Relatórios Recentes"
          subtitle="Últimos relatórios gerados"
          icon={FileText}
        >
          <div className="space-y-3">
            {[
              {
                name: "Relatório Diário - 15/01/2024",
                type: "Tráfego Diário",
                size: "2.4 MB",
                format: "PDF",
                generatedAt: "15/01/2024 23:05",
              },
              {
                name: "Relatório Semanal - 08-14/01/2024",
                type: "Vendas Semanais",
                size: "1.8 MB",
                format: "Excel",
                generatedAt: "15/01/2024 08:15",
              },
              {
                name: "Análise Personalizada - Q4 2023",
                type: "Análise Trimestral",
                size: "5.1 MB",
                format: "PDF",
                generatedAt: "10/01/2024 14:30",
              },
              {
                name: "Dados Brutos - Janeiro",
                type: "Exportação CSV",
                size: "12.7 MB",
                format: "CSV",
                generatedAt: "05/01/2024 16:20",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-glass-light rounded-lg hover:bg-glass-medium transition-colors group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-glass-light rounded-lg">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {report.name}
                    </h4>
                    <p className="text-sm text-foreground-secondary">
                      {report.type} • {report.size} • {report.generatedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-glass-light rounded text-xs text-foreground-muted">
                    {report.format}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-glass-medium transition-colors opacity-0 group-hover:opacity-100">
                    <Download className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:text-primary-light transition-colors">
              Ver todos os relatórios →
            </button>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}