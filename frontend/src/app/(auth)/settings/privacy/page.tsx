'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Database, 
  Clock, 
  Download, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Save,
  RotateCcw
} from 'lucide-react'

interface PrivacySetting {
  id: string
  title: string
  description: string
  enabled: boolean
  category: 'recognition' | 'data' | 'compliance' | 'audit'
  required?: boolean
  warning?: string
}

const PRIVACY_SETTINGS: PrivacySetting[] = [
  // Reconhecimento e Biometria
  {
    id: 'face_recognition',
    title: 'Reconhecimento Facial',
    description: 'Ativar detecção e reconhecimento de funcionários',
    enabled: true,
    category: 'recognition',
    warning: 'Dados biométricos são protegidos pela LGPD'
  },
  {
    id: 'biometric_consent',
    title: 'Consentimento Biométrico',
    description: 'Requerer consentimento explícito para captura biométrica',
    enabled: true,
    category: 'recognition',
    required: true
  },
  {
    id: 'face_blur',
    title: 'Desfoque de Faces',
    description: 'Desfocar faces não autorizadas em gravações',
    enabled: true,
    category: 'recognition'
  },
  
  // Retenção de Dados
  {
    id: 'data_retention',
    title: 'Retenção Automática',
    description: 'Excluir dados automaticamente após período configurado',
    enabled: true,
    category: 'data',
    required: true
  },
  {
    id: 'anonymize_old_data',
    title: 'Anonimização de Dados',
    description: 'Anonimizar dados pessoais após período determinado',
    enabled: true,
    category: 'data'
  },
  {
    id: 'encrypted_storage',
    title: 'Armazenamento Criptografado',
    description: 'Criptografar dados sensíveis no banco de dados',
    enabled: true,
    category: 'data',
    required: true
  },
  
  // Conformidade LGPD
  {
    id: 'lgpd_compliance',
    title: 'Modo Conformidade LGPD',
    description: 'Ativar todas as proteções exigidas pela LGPD',
    enabled: true,
    category: 'compliance',
    required: true
  },
  {
    id: 'gdpr_compliance',
    title: 'Conformidade GDPR',
    description: 'Ativar proteções adicionais para GDPR (UE)',
    enabled: false,
    category: 'compliance'
  },
  {
    id: 'consent_tracking',
    title: 'Rastreamento de Consentimento',
    description: 'Registrar e rastrear todos os consentimentos dados',
    enabled: true,
    category: 'compliance'
  },
  
  // Auditoria e Logs
  {
    id: 'audit_logging',
    title: 'Logs de Auditoria',
    description: 'Registrar todas as operações com dados pessoais',
    enabled: true,
    category: 'audit',
    required: true
  },
  {
    id: 'access_logging',
    title: 'Log de Acesso',
    description: 'Registrar todos os acessos aos dados pessoais',
    enabled: true,
    category: 'audit'
  },
  {
    id: 'export_logging',
    title: 'Log de Exportação',
    description: 'Registrar todas as exportações de dados',
    enabled: true,
    category: 'audit'
  },
]

const RETENTION_PERIODS = [
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
  { value: 180, label: '6 meses' },
  { value: 365, label: '1 ano' },
  { value: 730, label: '2 anos' },
]

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState(PRIVACY_SETTINGS)
  const [retentionPeriod, setRetentionPeriod] = useState(90)
  const [hasChanges, setHasChanges] = useState(false)

  const toggleSetting = (settingId: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Aqui faria a integração com o backend
    console.log('Saving privacy settings:', settings, retentionPeriod)
    setHasChanges(false)
  }

  const handleReset = () => {
    setSettings(PRIVACY_SETTINGS)
    setRetentionPeriod(90)
    setHasChanges(false)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recognition': return Eye
      case 'data': return Database
      case 'compliance': return Shield
      case 'audit': return Clock
      default: return Info
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recognition': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'data': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'compliance': return 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      case 'audit': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      default: return 'text-neutral-500 bg-neutral-500/10 border-neutral-500/20'
    }
  }

  const groupedSettings = settings.reduce((groups, setting) => {
    if (!groups[setting.category]) {
      groups[setting.category] = []
    }
    groups[setting.category].push(setting)
    return groups
  }, {} as Record<string, PrivacySetting[]>)

  const categoryTitles = {
    recognition: 'Reconhecimento e Biometria',
    data: 'Retenção e Armazenamento',
    compliance: 'Conformidade Legal',
    audit: 'Auditoria e Logs'
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-500" />
            Privacidade e LGPD
          </h2>
          <p className="text-neutral-400 mt-1">
            Configure proteções de dados e conformidade legal
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {hasChanges && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </motion.button>
          )}
          
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </motion.button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <div className="text-sm font-medium text-green-400">LGPD Compliant</div>
              <div className="text-xs text-green-500/80">Todas as proteções ativas</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-blue-400">2.3GB Protegidos</div>
              <div className="text-xs text-blue-500/80">Dados criptografados</div>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-orange-400">{retentionPeriod} dias</div>
              <div className="text-xs text-orange-500/80">Período de retenção</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Retention Period */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Período de Retenção de Dados
        </h3>
        
        <div className="grid grid-cols-5 gap-3 mb-4">
          {RETENTION_PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => {
                setRetentionPeriod(period.value)
                setHasChanges(true)
              }}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all duration-200
                ${retentionPeriod === period.value
                  ? 'bg-orange-500 text-white' 
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }
              `}
            >
              {period.label}
            </button>
          ))}
        </div>
        
        <p className="text-xs text-neutral-500">
          Dados pessoais serão automaticamente excluídos após {retentionPeriod} dias. 
          Esta configuração segue as diretrizes da LGPD.
        </p>
      </motion.div>

      {/* Settings Groups */}
      {Object.entries(groupedSettings).map(([category, categorySettings], groupIndex) => {
        const CategoryIcon = getCategoryIcon(category)
        
        return (
          <motion.div
            key={category}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + groupIndex * 0.1 }}
            className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CategoryIcon className={`w-5 h-5 ${getCategoryColor(category).split(' ')[0]}`} />
              {categoryTitles[category as keyof typeof categoryTitles]}
            </h3>
            
            <div className="space-y-4">
              {categorySettings.map((setting, index) => (
                <motion.div
                  key={setting.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + groupIndex * 0.1 + index * 0.05 }}
                  className="flex items-start justify-between p-4 rounded-xl bg-neutral-800/30 border border-neutral-700/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-white">
                        {setting.title}
                      </h4>
                      {setting.required && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-2">
                      {setting.description}
                    </p>
                    {setting.warning && (
                      <div className="flex items-center gap-2 text-xs text-orange-400">
                        <AlertCircle className="w-3 h-3" />
                        {setting.warning}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => !setting.required && toggleSetting(setting.id)}
                    disabled={setting.required}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
                      ${setting.enabled 
                        ? 'bg-green-500 focus:ring-green-500' 
                        : 'bg-neutral-600 focus:ring-neutral-500'
                      }
                      ${setting.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <motion.div
                      animate={{
                        x: setting.enabled ? 24 : 2
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })}

      {/* Data Management Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Gerenciamento de Dados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Exportar Dados</div>
              <div className="text-xs text-blue-500/80">Download completo LGPD</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Limpar Dados Antigos</div>
              <div className="text-xs text-red-500/80">Executar limpeza manual</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  )
}