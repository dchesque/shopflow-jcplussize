"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ChartCard } from "@/components/ui/chart-card";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  lastAccess: string;
  permissions: string[];
  avatar?: string;
}

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const employees: Employee[] = [
    {
      id: "emp-001",
      name: "Maria Silva Santos",
      email: "maria.santos@shopflow.com",
      phone: "+55 11 99999-0001",
      role: "Gerente",
      department: "Administração",
      status: "active",
      joinDate: "2023-03-15",
      lastAccess: "2024-01-15 14:30",
      permissions: ["analytics", "reports", "settings", "employees"],
    },
    {
      id: "emp-002", 
      name: "João Carlos Oliveira",
      email: "joao.oliveira@shopflow.com",
      phone: "+55 11 99999-0002",
      role: "Analista",
      department: "Análise de Dados",
      status: "active",
      joinDate: "2023-06-20",
      lastAccess: "2024-01-15 16:45",
      permissions: ["analytics", "reports"],
    },
    {
      id: "emp-003",
      name: "Ana Paula Costa",
      email: "ana.costa@shopflow.com",
      phone: "+55 11 99999-0003",
      role: "Operador",
      department: "Monitoramento",
      status: "active",
      joinDate: "2023-08-10",
      lastAccess: "2024-01-15 12:15",
      permissions: ["analytics"],
    },
    {
      id: "emp-004",
      name: "Carlos Eduardo Lima",
      email: "carlos.lima@shopflow.com",
      phone: "+55 11 99999-0004",
      role: "Técnico",
      department: "TI",
      status: "pending",
      joinDate: "2024-01-10",
      lastAccess: "Nunca",
      permissions: ["settings"],
    },
    {
      id: "emp-005",
      name: "Fernanda Reis",
      email: "fernanda.reis@shopflow.com",
      phone: "+55 11 99999-0005",
      role: "Analista",
      department: "Análise de Dados", 
      status: "inactive",
      joinDate: "2023-04-12",
      lastAccess: "2024-01-05 09:20",
      permissions: ["analytics", "reports"],
    },
  ];

  const roles = ["Gerente", "Analista", "Operador", "Técnico"];
  const departments = ["Administração", "Análise de Dados", "Monitoramento", "TI"];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || employee.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getStatusIcon = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "inactive":
        return <XCircle className="w-4 h-4 text-danger" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusText = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "pending":
        return "Pendente";
    }
  };

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return "bg-success/20 text-success";
      case "inactive":
        return "bg-danger/20 text-danger";
      case "pending":
        return "bg-warning/20 text-warning";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Funcionários</h1>
            <p className="text-foreground-secondary mt-1">
              Gerencie equipe e permissões de acesso
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo Funcionário</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Total</p>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Ativos</p>
                <p className="text-2xl font-bold text-success">
                  {employees.filter(e => e.status === "active").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Pendentes</p>
                <p className="text-2xl font-bold text-warning">
                  {employees.filter(e => e.status === "pending").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Departamentos</p>
                <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              </div>
              <Shield className="w-8 h-8 text-accent-purple" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <ChartCard title="Lista de Funcionários" icon={Users}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-background-secondary border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">Todos os Cargos</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <button className="flex items-center space-x-2 bg-glass-light border border-border rounded-lg px-4 py-2 text-foreground hover:bg-glass-medium transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Funcionário</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Cargo</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Departamento</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Último Acesso</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-border hover:bg-glass-light transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium">
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{employee.name}</p>
                          <p className="text-sm text-foreground-secondary flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{employee.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-foreground">{employee.role}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground-secondary">{employee.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(employee.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                          {getStatusText(employee.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1 text-foreground-secondary text-sm">
                        <Clock className="w-3 h-3" />
                        <span>{employee.lastAccess}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="p-2 rounded-lg hover:bg-glass-medium transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-glass-medium transition-colors"
                          title="Mais opções"
                        >
                          <MoreVertical className="w-4 h-4 text-foreground-muted" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
              <p className="text-foreground-secondary">Nenhum funcionário encontrado</p>
            </div>
          )}
        </ChartCard>

        {/* Department Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Por Departamento"
            subtitle="Distribuição de funcionários"
            icon={Shield}
          >
            <div className="space-y-3">
              {departments.map((dept) => {
                const count = employees.filter(e => e.department === dept).length;
                const percentage = (count / employees.length) * 100;
                
                return (
                  <div key={dept} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">{dept}</span>
                        <span className="text-sm text-foreground-secondary">{count} pessoas</span>
                      </div>
                      <div className="w-full bg-glass-light rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard
            title="Atividade Recente"
            subtitle="Últimos acessos e alterações"
            icon={Clock}
          >
            <div className="space-y-3">
              {[
                {
                  user: "Maria Silva Santos",
                  action: "Acessou o sistema",
                  time: "há 2 horas",
                  type: "access"
                },
                {
                  user: "João Carlos Oliveira",
                  action: "Gerou relatório de vendas",
                  time: "há 4 horas",
                  type: "report"
                },
                {
                  user: "Ana Paula Costa",
                  action: "Visualizou analytics",
                  time: "há 6 horas",
                  type: "view"
                },
                {
                  user: "Carlos Eduardo Lima",
                  action: "Conta criada",
                  time: "há 3 dias",
                  type: "create"
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-glass-light rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    activity.type === "access" ? "bg-success/20 text-success" :
                    activity.type === "report" ? "bg-primary/20 text-primary" :
                    activity.type === "view" ? "bg-accent-cyan/20 text-accent-cyan" :
                    "bg-warning/20 text-warning"
                  }`}>
                    {activity.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.user}</p>
                    <p className="text-xs text-foreground-secondary">{activity.action}</p>
                  </div>
                  <span className="text-xs text-foreground-muted">{activity.time}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </DashboardLayout>
  );
}