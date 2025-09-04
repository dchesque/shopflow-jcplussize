"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChartCard } from "@/components/ui/chart-card";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Shield,
  Eye,
  UserX,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  Settings,
  Lock,
  Users,
  Database,
  Camera,
} from "lucide-react";

export default function PrivacyPage() {
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDataDeletion, setShowDataDeletion] = useState(false);

  // Dados mock para demonstração
  const privacyStats = {
    totalDataSubjects: 15420,
    consentGiven: 14250,
    consentPending: 890,
    consentRevoked: 280,
    dataRequests: 23,
    deletionRequests: 8,
    exportRequests: 15,
  };

  const dataCategories = [
    {
      name: "Imagens de Câmera",
      description: "Dados biométricos para detecção de pessoas",
      retention: "7 dias",
      purpose: "Análise de tráfego",
      status: "active",
      dataSubjects: 15420,
      consent: "implicit",
    },
    {
      name: "Dados de Tráfego",
      description: "Contadores agregados de entrada e saída",
      retention: "2 anos",
      purpose: "Analytics e relatórios",
      status: "active", 
      dataSubjects: 15420,
      consent: "not_required",
    },
    {
      name: "Logs do Sistema",
      description: "Registros de atividade do sistema",
      retention: "90 dias",
      purpose: "Segurança e auditoria",
      status: "active",
      dataSubjects: 0,
      consent: "not_required",
    },
    {
      name: "Dados de Vendas",
      description: "Informações de transações (anonimizadas)",
      retention: "5 anos",
      purpose: "Análise de conversão",
      status: "active",
      dataSubjects: 0,
      consent: "not_required",
    },
  ];

  const recentRequests = [
    {
      id: "REQ-001",
      type: "access",
      requester: "João Silva",
      email: "joao@email.com",
      date: "2024-01-15",
      status: "completed",
      description: "Solicitação de acesso aos dados pessoais",
    },
    {
      id: "REQ-002",
      type: "deletion",
      requester: "Maria Santos",
      email: "maria@email.com",
      date: "2024-01-14",
      status: "pending",
      description: "Solicitação de exclusão de dados",
    },
    {
      id: "REQ-003",
      type: "export",
      requester: "Carlos Lima",
      email: "carlos@email.com",
      date: "2024-01-13",
      status: "processing",
      description: "Exportação de dados em formato JSON",
    },
  ];

  const getConsentBadge = (consent: string) => {
    switch (consent) {
      case "explicit":
        return "bg-success/20 text-success";
      case "implicit":
        return "bg-warning/20 text-warning";
      case "not_required":
        return "bg-glass-light text-foreground-secondary";
      default:
        return "bg-danger/20 text-danger";
    }
  };

  const getConsentText = (consent: string) => {
    switch (consent) {
      case "explicit":
        return "Consentimento Explícito";
      case "implicit":
        return "Consentimento Implícito";
      case "not_required":
        return "Não Requer Consentimento";
      default:
        return "Sem Consentimento";
    }
  };

  const getRequestIcon = (type: string) => {
    switch (type) {
      case "access":
        return <Eye className="w-4 h-4" />;
      case "deletion":
        return <Trash2 className="w-4 h-4" />;
      case "export":
        return <Download className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "access":
        return "Acesso";
      case "deletion":
        return "Exclusão";
      case "export":
        return "Exportação";
      default:
        return "Outro";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-warning/20 text-warning";
      case "processing":
        return "bg-primary/20 text-primary";
      default:
        return "bg-glass-light text-foreground-secondary";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      case "processing":
        return "Processando";
      default:
        return "Desconhecido";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Privacidade & LGPD</h1>
            <p className="text-foreground-secondary mt-1">
              Gestão de dados pessoais e conformidade regulatória
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors">
              <FileText className="w-4 h-4" />
              <span>Relatório LGPD</span>
            </button>
          </div>
        </div>

        {/* Privacy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Titulares de Dados"
            value={privacyStats.totalDataSubjects}
            icon={Users}
            description="pessoas identificadas"
          />
          
          <MetricCard
            title="Consentimentos"
            value={privacyStats.consentGiven}
            previousValue={13800}
            icon={CheckCircle}
            description="consentimentos ativos"
          />
          
          <MetricCard
            title="Solicitações"
            value={privacyStats.dataRequests}
            previousValue={18}
            icon={FileText}
            description="este mês"
          />
          
          <MetricCard
            title="Exclusões"
            value={privacyStats.deletionRequests}
            previousValue={5}
            icon={UserX}
            description="processadas"
          />
        </div>

        {/* Data Categories */}
        <ChartCard
          title="Categorias de Dados"
          subtitle="Tipos de dados processados e suas finalidades"
          icon={Database}
        >
          <div className="space-y-4">
            {dataCategories.map((category, index) => (
              <div key={index} className="p-4 bg-glass-light border border-border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{category.name}</h3>
                    <p className="text-sm text-foreground-secondary mb-2">{category.description}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center space-x-1 text-foreground-muted">
                        <Clock className="w-3 h-3" />
                        <span>Retenção: {category.retention}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-foreground-muted">
                        <Eye className="w-3 h-3" />
                        <span>Finalidade: {category.purpose}</span>
                      </span>
                      {category.dataSubjects > 0 && (
                        <span className="flex items-center space-x-1 text-foreground-muted">
                          <Users className="w-3 h-3" />
                          <span>{category.dataSubjects.toLocaleString()} pessoas</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConsentBadge(category.consent)}`}>
                      {getConsentText(category.consent)}
                    </span>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      category.status === "active" ? "bg-success animate-pulse" : "bg-danger"
                    }`}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center space-x-4 text-xs text-foreground-muted">
                    <span>Base Legal: Interesse Legítimo</span>
                    <span>Controlador: ShopFlow Analytics</span>
                  </div>
                  
                  <button className="text-xs text-primary hover:text-primary-light transition-colors">
                    Ver Detalhes →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Data Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Solicitações de Dados"
            subtitle="Requisições dos titulares (LGPD)"
            icon={FileText}
            actions={
              <button className="text-sm text-primary hover:text-primary-light transition-colors">
                Ver Todas
              </button>
            }
          >
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="p-3 bg-glass-light rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-glass-light rounded">
                        {getRequestIcon(request.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{request.requester}</h4>
                        <p className="text-xs text-foreground-secondary">{request.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                      <p className="text-xs text-foreground-muted mt-1">{request.date}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground-secondary mb-2">{request.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      Tipo: {getRequestTypeText(request.type)} • ID: {request.id}
                    </span>
                    
                    {request.status === "pending" && (
                      <button className="text-xs text-primary hover:text-primary-light transition-colors">
                        Processar →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Consentimentos"
            subtitle="Estado dos consentimentos coletados"
            icon={Shield}
          >
            <div className="space-y-4">
              {/* Consent Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{privacyStats.consentGiven}</p>
                  <p className="text-xs text-success">Ativos</p>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{privacyStats.consentPending}</p>
                  <p className="text-xs text-warning">Pendentes</p>
                </div>
                <div className="text-center p-3 bg-danger/10 rounded-lg">
                  <p className="text-2xl font-bold text-danger">{privacyStats.consentRevoked}</p>
                  <p className="text-xs text-danger">Revogados</p>
                </div>
              </div>

              {/* Consent Rate */}
              <div className="p-4 bg-glass-light rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">Taxa de Consentimento</span>
                  <span className="text-sm text-foreground-secondary">
                    {((privacyStats.consentGiven / privacyStats.totalDataSubjects) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-glass-light rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(privacyStats.consentGiven / privacyStats.totalDataSubjects) * 100}%` }}
                  />
                </div>
              </div>

              {/* Consent Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowDataExport(!showDataExport)}
                  className="w-full p-3 bg-glass-light rounded-lg text-left hover:bg-glass-medium transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Exportar Dados</span>
                    </div>
                    <span className="text-xs text-foreground-secondary">LGPD Art. 15</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowDataDeletion(!showDataDeletion)}
                  className="w-full p-3 bg-glass-light rounded-lg text-left hover:bg-glass-medium transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trash2 className="w-4 h-4 text-danger" />
                      <span className="text-sm font-medium text-foreground">Exclusão de Dados</span>
                    </div>
                    <span className="text-xs text-foreground-secondary">LGPD Art. 18</span>
                  </div>
                </button>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Compliance Status */}
        <ChartCard
          title="Status de Conformidade"
          subtitle="Indicadores de aderência à LGPD"
          icon={CheckCircle}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Medidas Técnicas</h4>
              {[
                { name: "Criptografia", status: true, description: "Dados em trânsito e repouso" },
                { name: "Anonimização", status: true, description: "Remoção de identificadores" },
                { name: "Backup Seguro", status: true, description: "Cópias protegidas" },
                { name: "Controle de Acesso", status: false, description: "2FA pendente" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-glass-light rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground-secondary">{item.description}</p>
                  </div>
                  {item.status ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Medidas Organizacionais</h4>
              {[
                { name: "Política de Privacidade", status: true, description: "Atualizada e publicada" },
                { name: "Treinamento Equipe", status: true, description: "100% da equipe treinada" },
                { name: "Registro de Atividades", status: true, description: "Documentação completa" },
                { name: "DPO Designado", status: false, description: "Ainda não designado" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-glass-light rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground-secondary">{item.description}</p>
                  </div>
                  {item.status ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Processos</h4>
              {[
                { name: "Notificação de Incidentes", status: true, description: "Processo definido" },
                { name: "Gestão de Consentimento", status: true, description: "Sistema implementado" },
                { name: "Resposta a Solicitações", status: true, description: "SLA de 15 dias" },
                { name: "Auditoria Externa", status: false, description: "Aguardando agenda" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-glass-light rounded">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground-secondary">{item.description}</p>
                  </div>
                  {item.status ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-success" />
              <div>
                <h4 className="font-medium text-foreground">Conformidade LGPD: 85%</h4>
                <p className="text-sm text-foreground-secondary">
                  Bom nível de aderência. 3 itens precisam de atenção.
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}