'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Mail, 
  Phone, 
  IdCard, 
  Briefcase, 
  MapPin, 
  Camera,
  Shield,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'
import { EmployeeCreateRequest, LGPDConsent } from '@/types/employee'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import { motion, AnimatePresence } from 'framer-motion'

interface EmployeeFormProps {
  onSuccess: (employee: any) => void
  initialData?: Partial<EmployeeCreateRequest>
  isEdit?: boolean
}

type FormStep = 'personal' | 'professional' | 'address' | 'emergency' | 'photo' | 'permissions' | 'lgpd'

const STEPS: { key: FormStep; title: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'personal',
    title: 'Dados Pessoais',
    description: 'Informações básicas do funcionário',
    icon: <User className="h-5 w-5" />
  },
  {
    key: 'professional',
    title: 'Dados Profissionais',
    description: 'Cargo e informações de trabalho',
    icon: <Briefcase className="h-5 w-5" />
  },
  {
    key: 'address',
    title: 'Endereço',
    description: 'Endereço residencial (opcional)',
    icon: <MapPin className="h-5 w-5" />
  },
  {
    key: 'emergency',
    title: 'Contato de Emergência',
    description: 'Pessoa para contato em emergências',
    icon: <Phone className="h-5 w-5" />
  },
  {
    key: 'photo',
    title: 'Foto do Funcionário',
    description: 'Foto para reconhecimento facial',
    icon: <Camera className="h-5 w-5" />
  },
  {
    key: 'permissions',
    title: 'Permissões',
    description: 'Controle de acesso ao sistema',
    icon: <Shield className="h-5 w-5" />
  },
  {
    key: 'lgpd',
    title: 'Consentimento LGPD',
    description: 'Autorização para uso de dados',
    icon: <FileText className="h-5 w-5" />
  }
]

export function EmployeeForm({ onSuccess, initialData, isEdit = false }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<EmployeeCreateRequest>({
    full_name: '',
    email: '',
    phone: '',
    document_number: '',
    document_type: 'cpf',
    position: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postal_code: ''
    },
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    },
    permissions: [],
    lgpd_consent: {
      data_processing: false,
      facial_recognition: false,
      analytics_tracking: false,
      marketing_communication: false,
      data_sharing: false
    },
    ...initialData
  })

  const updateFormData = (updates: Partial<EmployeeCreateRequest>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateNestedData = (key: keyof EmployeeCreateRequest, updates: Record<string, any>) => {
    setFormData(prev => {
      const currentValue = prev[key]
      const isObject = currentValue && typeof currentValue === 'object'
      return {
        ...prev,
        [key]: isObject ? { ...currentValue, ...updates } : { ...updates }
      }
    })
  }

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep)
  const isLastStep = currentStepIndex === STEPS.length - 1
  const isFirstStep = currentStepIndex === 0

  const canProceed = () => {
    switch (currentStep) {
      case 'personal':
        return formData.full_name && formData.email && formData.document_number
      case 'professional':
        return formData.position && formData.hire_date
      case 'lgpd':
        return formData.lgpd_consent.data_processing
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].key)
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) return

    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo_file' && value) {
          formDataToSend.append('photo', value as File)
        } else if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value))
        } else if (value !== undefined && value !== '') {
          formDataToSend.append(key, String(value))
        }
      })

      const url = isEdit ? `/api/employees/${(initialData as any)?.id}` : '/api/employees/register'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao salvar funcionário')
      }

      const employee = await response.json()
      onSuccess(employee)
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      alert(`Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} funcionário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateFormData({ full_name: e.target.value })}
                placeholder="Digite o nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="email@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document_type">Tipo de Documento</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value: 'cpf' | 'rg' | 'passport') => 
                    updateFormData({ document_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="rg">RG</SelectItem>
                    <SelectItem value="passport">Passaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="document_number">Número do Documento *</Label>
                <Input
                  id="document_number"
                  value={formData.document_number}
                  onChange={(e) => updateFormData({ document_number: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>
        )

      case 'professional':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => updateFormData({ position: e.target.value })}
                placeholder="Ex: Vendedor, Gerente, Caixa"
              />
            </div>

            <div>
              <Label htmlFor="department">Departamento</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => updateFormData({ department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendas">Vendas</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="gerencia">Gerência</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="limpeza">Limpeza</SelectItem>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hire_date">Data de Contratação *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => updateFormData({ hire_date: e.target.value })}
              />
            </div>
          </div>
        )

      case 'address':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  value={formData.address?.street}
                  onChange={(e) => updateNestedData('address', { street: e.target.value })}
                  placeholder="Nome da rua"
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.address?.number}
                  onChange={(e) => updateNestedData('address', { number: e.target.value })}
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.address?.complement}
                onChange={(e) => updateNestedData('address', { complement: e.target.value })}
                placeholder="Apto, sala, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={formData.address?.neighborhood}
                  onChange={(e) => updateNestedData('address', { neighborhood: e.target.value })}
                  placeholder="Nome do bairro"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">CEP</Label>
                <Input
                  id="postal_code"
                  value={formData.address?.postal_code}
                  onChange={(e) => updateNestedData('address', { postal_code: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.address?.city}
                  onChange={(e) => updateNestedData('address', { city: e.target.value })}
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={formData.address?.state}
                  onValueChange={(value) => updateNestedData('address', { state: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'emergency':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergency_name">Nome do Contato</Label>
              <Input
                id="emergency_name"
                value={formData.emergency_contact?.name}
                onChange={(e) => updateNestedData('emergency_contact', { name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="emergency_phone">Telefone</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency_contact?.phone}
                onChange={(e) => updateNestedData('emergency_contact', { phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="emergency_relationship">Parentesco</Label>
              <Select
                value={formData.emergency_contact?.relationship}
                onValueChange={(value) => updateNestedData('emergency_contact', { relationship: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parentesco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pai">Pai</SelectItem>
                  <SelectItem value="mae">Mãe</SelectItem>
                  <SelectItem value="conjuge">Cônjuge</SelectItem>
                  <SelectItem value="irmao">Irmão/Irmã</SelectItem>
                  <SelectItem value="filho">Filho/Filha</SelectItem>
                  <SelectItem value="amigo">Amigo</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-4">
            <PhotoUpload
              onPhotoSelected={(file) => updateFormData({ photo_file: file })}
              currentPhotoUrl={(initialData as any)?.photo_url}
              employeeName={formData.full_name}
            />
            <p className="text-sm text-gray-600">
              A foto será utilizada para reconhecimento facial nos sistemas de câmera.
              É importante que a foto seja clara e frontal.
            </p>
          </div>
        )

      case 'permissions':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Selecione as permissões que este funcionário terá no sistema:
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'dashboard_view', label: 'Visualizar Dashboard', desc: 'Acesso ao painel principal' },
                { id: 'cameras_view', label: 'Visualizar Câmeras', desc: 'Ver feeds e configurações de câmera' },
                { id: 'analytics_view', label: 'Visualizar Analytics', desc: 'Acessar relatórios e estatísticas' },
                { id: 'employees_view', label: 'Visualizar Funcionários', desc: 'Ver lista de funcionários' },
                { id: 'employees_manage', label: 'Gerenciar Funcionários', desc: 'Criar, editar e excluir funcionários' },
                { id: 'settings_manage', label: 'Gerenciar Configurações', desc: 'Alterar configurações do sistema' },
                { id: 'admin_access', label: 'Acesso Administrativo', desc: 'Acesso completo ao sistema' },
              ].map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData({ 
                          permissions: [...formData.permissions, permission.id] 
                        })
                      } else {
                        updateFormData({ 
                          permissions: formData.permissions.filter(p => p !== permission.id) 
                        })
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                    <p className="text-xs text-gray-500">
                      {permission.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'lgpd':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Consentimento LGPD Obrigatório
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    É necessário obter o consentimento explícito do funcionário para o tratamento 
                    de dados pessoais conforme a Lei Geral de Proteção de Dados.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data_processing"
                  checked={formData.lgpd_consent.data_processing}
                  onCheckedChange={(checked) => 
                    updateNestedData('lgpd_consent', { data_processing: checked })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="data_processing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Processamento de Dados Pessoais *
                  </label>
                  <p className="text-xs text-gray-500">
                    Autoriza o tratamento de dados pessoais básicos (nome, email, telefone, documento)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="facial_recognition"
                  checked={formData.lgpd_consent.facial_recognition}
                  onCheckedChange={(checked) => 
                    updateNestedData('lgpd_consent', { facial_recognition: checked })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="facial_recognition"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Reconhecimento Facial
                  </label>
                  <p className="text-xs text-gray-500">
                    Autoriza o uso de dados biométricos faciais para identificação automática
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="analytics_tracking"
                  checked={formData.lgpd_consent.analytics_tracking}
                  onCheckedChange={(checked) => 
                    updateNestedData('lgpd_consent', { analytics_tracking: checked })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="analytics_tracking"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Análise Comportamental
                  </label>
                  <p className="text-xs text-gray-500">
                    Permite análise de padrões de comportamento e presença para insights de negócio
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="data_sharing"
                  checked={formData.lgpd_consent.data_sharing}
                  onCheckedChange={(checked) => 
                    updateNestedData('lgpd_consent', { data_sharing: checked })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="data_sharing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Compartilhamento de Dados
                  </label>
                  <p className="text-xs text-gray-500">
                    Autoriza o compartilhamento de dados com parceiros para fins específicos
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${currentStep === step.key 
                ? 'border-primary bg-primary text-white' 
                : index < currentStepIndex 
                  ? 'border-green-500 bg-green-500 text-white' 
                  : 'border-gray-300 bg-white text-gray-500'
              }
            `}>
              {index < currentStepIndex ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`
                w-16 h-0.5 transition-colors
                ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {STEPS[currentStepIndex].icon}
            {STEPS[currentStepIndex].title}
          </CardTitle>
          <CardDescription>
            {STEPS[currentStepIndex].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              'Salvando...'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {isEdit ? 'Atualizar Funcionário' : 'Cadastrar Funcionário'}
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}