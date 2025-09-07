'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Shield, 
  Download, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Clock,
  User
} from 'lucide-react'
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LGPDConsent } from '@/types/employee'

export default function EmployeePrivacyPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { employee, isLoading, error } = useEmployee(employeeId)
  const updateEmployeeMutation = useUpdateEmployee()
  
  const [isUpdating, setIsUpdating] = useState(false)
  const [dataProcessingRequest, setDataProcessingRequest] = useState('')
  const [consentUpdates, setConsentUpdates] = useState<Partial<LGPDConsent>>({})

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid gap-6">
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-48 bg-gray-200 rounded" />
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

  const handleConsentUpdate = async () => {
    if (Object.keys(consentUpdates).length === 0) return

    setIsUpdating(true)
    try {
      await updateEmployeeMutation.mutateAsync({
        id: employeeId,
        lgpd_consent: {
          ...employee.lgpd_consent,
          ...consentUpdates
        }
      })
      setConsentUpdates({})
      alert('Consentimentos atualizados com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar consentimentos:', error)
      alert('Erro ao atualizar consentimentos. Tente novamente.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDataExport = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/export-data`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Falha ao exportar dados')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${employee.full_name}_dados_pessoais.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    }
  }

  const handleDataDeletion = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/delete-personal-data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: dataProcessingRequest,
          requested_by: 'system_admin'
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao processar solicitação de exclusão')
      }

      alert('Solicitação de exclusão de dados processada com sucesso!')
      router.push('/employees')
    } catch (error) {
      console.error('Erro ao processar exclusão:', error)
      alert('Erro ao processar exclusão de dados. Tente novamente.')
    }
  }

  const updateConsent = (key: keyof LGPDConsent, value: boolean) => {
    setConsentUpdates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const getConsentValue = (key: keyof LGPDConsent): boolean => {
    const updateValue = consentUpdates[key]
    if (typeof updateValue === 'boolean') return updateValue
    const employeeValue = employee.lgpd_consent?.[key]
    return typeof employeeValue === 'boolean' ? employeeValue : false
  }

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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Privacidade LGPD
            </h1>
            <p className="text-gray-600">{employee.full_name} - {employee.position}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDataExport}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* LGPD Rights Overview */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="h-5 w-5" />
            Direitos do Titular (LGPD)
          </CardTitle>
          <CardDescription className="text-blue-700">
            Conforme a Lei Geral de Proteção de Dados (LGPD), o funcionário possui os seguintes direitos:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { icon: Eye, title: 'Acesso', desc: 'Consultar dados pessoais armazenados' },
              { icon: Download, title: 'Portabilidade', desc: 'Exportar dados em formato legível' },
              { icon: CheckCircle, title: 'Correção', desc: 'Solicitar correção de dados incorretos' },
              { icon: Trash2, title: 'Exclusão', desc: 'Solicitar remoção de dados pessoais' },
            ].map((right, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <right.icon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">{right.title}</p>
                  <p className="text-sm text-blue-600">{right.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Consents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Consentimentos Atuais
          </CardTitle>
          <CardDescription>
            Status atual dos consentimentos para tratamento de dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: 'data_processing' as keyof LGPDConsent,
                title: 'Processamento de Dados Pessoais',
                desc: 'Tratamento de dados básicos (nome, email, telefone, documento)',
                required: true
              },
              {
                key: 'facial_recognition' as keyof LGPDConsent,
                title: 'Reconhecimento Facial',
                desc: 'Uso de dados biométricos faciais para identificação automática',
                required: false
              },
              {
                key: 'analytics_tracking' as keyof LGPDConsent,
                title: 'Análise Comportamental',
                desc: 'Análise de padrões de comportamento e presença para insights',
                required: false
              },
              {
                key: 'marketing_communication' as keyof LGPDConsent,
                title: 'Comunicação de Marketing',
                desc: 'Envio de comunicações promocionais e informativas',
                required: false
              },
              {
                key: 'data_sharing' as keyof LGPDConsent,
                title: 'Compartilhamento de Dados',
                desc: 'Compartilhamento com parceiros para fins específicos',
                required: false
              }
            ].map((consent) => (
              <div key={consent.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={consent.key}
                    checked={getConsentValue(consent.key)}
                    disabled={consent.required}
                    onCheckedChange={(checked) => updateConsent(consent.key, checked as boolean)}
                  />
                  <div>
                    <label
                      htmlFor={consent.key}
                      className="font-medium flex items-center gap-2"
                    >
                      {consent.title}
                      {consent.required && (
                        <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                      )}
                    </label>
                    <p className="text-sm text-gray-600 mt-1">{consent.desc}</p>
                  </div>
                </div>
                <Badge 
                  variant={getConsentValue(consent.key) ? 'default' : 'secondary'}
                  className={getConsentValue(consent.key) ? 'bg-green-100 text-green-800' : ''}
                >
                  {getConsentValue(consent.key) ? 'Autorizado' : 'Não Autorizado'}
                </Badge>
              </div>
            ))}

            {Object.keys(consentUpdates).length > 0 && (
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleConsentUpdate}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdating ? 'Atualizando...' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Processing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Consentimentos
          </CardTitle>
          <CardDescription>
            Registro de alterações nos consentimentos de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Consentimento inicial concedido</p>
                <p className="text-sm text-gray-600">
                  {employee.lgpd_consent?.consent_date ? 
                    format(new Date(employee.lgpd_consent.consent_date), 'dd/MM/yyyy HH:mm', { locale: ptBR }) :
                    'Data não registrada'
                  }
                </p>
              </div>
              <Badge variant="outline">Sistema</Badge>
            </div>

            {employee.lgpd_consent?.withdrawal_date && (
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Revogação de consentimento</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(employee.lgpd_consent.withdrawal_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
                <Badge variant="secondary">Funcionário</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion Request */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Trash2 className="h-5 w-5" />
            Solicitação de Exclusão de Dados
          </CardTitle>
          <CardDescription className="text-red-700">
            ⚠️ Esta ação removerá permanentemente todos os dados pessoais do funcionário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da solicitação de exclusão
              </label>
              <Textarea
                placeholder="Descreva o motivo para a exclusão dos dados pessoais..."
                value={dataProcessingRequest}
                onChange={(e) => setDataProcessingRequest(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Atenção: Exclusão de Dados Pessoais
                  </h4>
                  <ul className="text-sm text-red-700 mt-2 space-y-1">
                    <li>• Todos os dados pessoais serão removidos permanentemente</li>
                    <li>• Dados biométricos e fotos serão excluídos</li>
                    <li>• Histórico de reconhecimento facial será apagado</li>
                    <li>• Esta ação não pode ser desfeita</li>
                    <li>• O funcionário será marcado como &quot;dados removidos&quot;</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="danger"
                  disabled={!dataProcessingRequest.trim()}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Processar Exclusão de Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar Exclusão de Dados LGPD</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover <strong>permanentemente</strong> todos os dados pessoais 
                    do funcionário <strong>{employee.full_name}</strong> do sistema.
                    <br /><br />
                    <strong>Dados que serão removidos:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Dados pessoais (nome, email, telefone, documentos)</li>
                      <li>Endereço e contatos de emergência</li>
                      <li>Foto e dados biométricos faciais</li>
                      <li>Histórico completo de reconhecimento facial</li>
                      <li>Dados de analytics comportamentais</li>
                    </ul>
                    <br />
                    Esta ação não pode ser desfeita e atende aos direitos de exclusão da LGPD.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDataDeletion}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}