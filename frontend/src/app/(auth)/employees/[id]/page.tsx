'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Shield, 
  Camera, 
  Clock, 
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  IdCard,
  Briefcase,
  Users,
  Activity,
  Eye,
  Download
} from 'lucide-react'
import { useEmployee, useEmployeeAnalytics } from '@/hooks/useEmployees'
import { EmployeeAnalyticsChart } from '@/components/dashboard/EmployeeAnalyticsChart'
import { format, differenceInMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { employee, isLoading, error } = useEmployee(employeeId)
  const { analytics, isLoading: analyticsLoading } = useEmployeeAnalytics(employeeId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="md:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="container mx-auto py-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Funcionário não encontrado</p>
            <Button 
              variant="outline" 
              onClick={() => router.back()} 
              className="mt-4"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspenso</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const workMonths = differenceInMonths(new Date(), new Date(employee.hire_date))

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.full_name}
            </h1>
            <p className="text-gray-600">{employee.position}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/employees/${employeeId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/employees/${employeeId}/privacy`)}
          >
            <Shield className="h-4 w-4 mr-2" />
            LGPD
          </Button>
        </div>
      </div>

      {/* Employee Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Photo and Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={employee.photo_url} 
                  alt={employee.full_name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(employee.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h3 className="font-semibold text-lg">{employee.full_name}</h3>
                <p className="text-gray-600">{employee.position}</p>
                {getStatusBadge(employee.status)}
              </div>

              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{employee.email}</span>
                </div>
                
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-500" />
                  <span>{employee.document_number}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Desde {format(new Date(employee.hire_date), 'MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="md:col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tempo de Casa</p>
                  <p className="text-2xl font-bold">
                    {workMonths < 12 ? `${workMonths}m` : `${Math.floor(workMonths / 12)}a`}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Detecções Hoje</p>
                  <p className="text-2xl font-bold">
                    {analytics?.total_detections || 0}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Horas Este Mês</p>
                  <p className="text-2xl font-bold">
                    {analytics?.monthly_hours?.[0]?.total_hours || 0}h
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Permissões</p>
                  <p className="text-2xl font-bold">
                    {employee.permissions?.length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="lgpd">LGPD</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Informações Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cargo</label>
                  <p className="text-sm">{employee.position}</p>
                </div>
                
                {employee.department && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Departamento</label>
                    <p className="text-sm">{employee.department}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Contratação</label>
                  <p className="text-sm">
                    {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(employee.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            {employee.address && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>
                      {employee.address.street}, {employee.address.number}
                      {employee.address.complement && ` - ${employee.address.complement}`}
                    </p>
                    <p>{employee.address.neighborhood}</p>
                    <p>
                      {employee.address.city} - {employee.address.state}
                    </p>
                    <p>{employee.address.postal_code}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contact */}
            {employee.emergency_contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome</label>
                    <p className="text-sm">{employee.emergency_contact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Telefone</label>
                    <p className="text-sm">{employee.emergency_contact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parentesco</label>
                    <p className="text-sm">{employee.emergency_contact.relationship}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EmployeeAnalyticsChart 
            employeeId={employeeId}
            analytics={analytics}
            isLoading={analyticsLoading}
          />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Permissões do Sistema
              </CardTitle>
              <CardDescription>
                Controle de acesso às funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {employee.permissions?.map((permission, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{permission.resource}</p>
                      <p className="text-xs text-gray-600">{permission.action}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 col-span-2">Nenhuma permissão específica configurada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lgpd" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Consentimentos LGPD
              </CardTitle>
              <CardDescription>
                Status dos consentimentos para tratamento de dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { 
                      key: 'data_processing', 
                      label: 'Processamento de Dados Pessoais',
                      desc: 'Tratamento de dados básicos (nome, email, telefone, documento)'
                    },
                    { 
                      key: 'facial_recognition', 
                      label: 'Reconhecimento Facial',
                      desc: 'Uso de dados biométricos faciais para identificação automática'
                    },
                    { 
                      key: 'analytics_tracking', 
                      label: 'Análise Comportamental',
                      desc: 'Análise de padrões de comportamento e presença'
                    },
                    { 
                      key: 'data_sharing', 
                      label: 'Compartilhamento de Dados',
                      desc: 'Compartilhamento com parceiros para fins específicos'
                    }
                  ].map((consent) => (
                    <div key={consent.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{consent.label}</p>
                        <p className="text-sm text-gray-600">{consent.desc}</p>
                      </div>
                      <Badge variant={employee.lgpd_consent?.[consent.key as keyof typeof employee.lgpd_consent] ? 'default' : 'secondary'}>
                        {employee.lgpd_consent?.[consent.key as keyof typeof employee.lgpd_consent] ? 'Autorizado' : 'Não Autorizado'}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <strong>Consentimento dado em:</strong>{' '}
                    {employee.lgpd_consent?.consent_date ? 
                      format(new Date(employee.lgpd_consent.consent_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) :
                      'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}