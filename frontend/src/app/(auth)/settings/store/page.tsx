'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Store, 
  Clock, 
  Users, 
  MapPin, 
  Zap,
  Save,
  Plus,
  X,
  Edit3
} from 'lucide-react'

interface StoreInfo {
  name: string
  address: string
  phone: string
  email: string
  cnpj: string
  maxCapacity: number
  operatingHours: OperatingHours
  zones: Zone[]
}

interface OperatingHours {
  [key: string]: {
    open: string
    close: string
    enabled: boolean
  }
}

interface Zone {
  id: string
  name: string
  description: string
  color: string
  coordinates?: {
    x: number
    y: number
    width: number
    height: number
  }
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

const ZONE_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

const INITIAL_STORE_DATA: StoreInfo = {
  name: 'Loja ShopFlow Centro',
  address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
  phone: '(11) 98765-4321',
  email: 'contato@shopflow-centro.com.br',
  cnpj: '12.345.678/0001-90',
  maxCapacity: 150,
  operatingHours: {
    monday: { open: '09:00', close: '19:00', enabled: true },
    tuesday: { open: '09:00', close: '19:00', enabled: true },
    wednesday: { open: '09:00', close: '19:00', enabled: true },
    thursday: { open: '09:00', close: '19:00', enabled: true },
    friday: { open: '09:00', close: '20:00', enabled: true },
    saturday: { open: '09:00', close: '18:00', enabled: true },
    sunday: { open: '10:00', close: '16:00', enabled: false },
  },
  zones: [
    {
      id: '1',
      name: 'Entrada Principal',
      description: 'Área de entrada e recepção de clientes',
      color: '#ef4444'
    },
    {
      id: '2',
      name: 'Seção Eletrônicos',
      description: 'Produtos eletrônicos e tecnologia',
      color: '#3b82f6'
    },
    {
      id: '3',
      name: 'Seção Roupas',
      description: 'Vestuário e acessórios',
      color: '#10b981'
    },
    {
      id: '4',
      name: 'Caixa',
      description: 'Área de checkout e pagamento',
      color: '#f59e0b'
    }
  ]
}

export default function StoreSettingsPage() {
  const [storeData, setStoreData] = useState<StoreInfo>(INITIAL_STORE_DATA)
  const [hasChanges, setHasChanges] = useState(false)
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)

  const updateStoreData = (field: keyof StoreInfo, value: any) => {
    setStoreData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const updateOperatingHours = (day: string, field: string, value: string | boolean) => {
    setStoreData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const addZone = () => {
    const newZone: Zone = {
      id: Date.now().toString(),
      name: '',
      description: '',
      color: ZONE_COLORS[storeData.zones.length % ZONE_COLORS.length]
    }
    setEditingZone(newZone)
    setShowZoneModal(true)
  }

  const saveZone = (zone: Zone) => {
    if (storeData.zones.find(z => z.id === zone.id)) {
      // Edit existing
      setStoreData(prev => ({
        ...prev,
        zones: prev.zones.map(z => z.id === zone.id ? zone : z)
      }))
    } else {
      // Add new
      setStoreData(prev => ({
        ...prev,
        zones: [...prev.zones, zone]
      }))
    }
    setHasChanges(true)
    setShowZoneModal(false)
    setEditingZone(null)
  }

  const removeZone = (zoneId: string) => {
    setStoreData(prev => ({
      ...prev,
      zones: prev.zones.filter(z => z.id !== zoneId)
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Integração com backend aqui
    console.log('Saving store data:', storeData)
    setHasChanges(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-green-500" />
            Configurações da Loja
          </h2>
          <p className="text-neutral-400 mt-1">
            Dados básicos, horários de funcionamento e configuração de zonas
          </p>
        </div>
        
        {hasChanges && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </motion.button>
        )}
      </motion.div>

      {/* Store Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Store className="w-5 h-5 text-green-500" />
          Informações Básicas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Nome da Loja
            </label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => updateStoreData('name', e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={storeData.cnpj}
              onChange={(e) => updateStoreData('cnpj', e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Endereço
            </label>
            <textarea
              value={storeData.address}
              onChange={(e) => updateStoreData('address', e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={storeData.phone}
              onChange={(e) => updateStoreData('phone', e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={storeData.email}
              onChange={(e) => updateStoreData('email', e.target.value)}
              className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Capacity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          Capacidade da Loja
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Capacidade Máxima de Pessoas
            </label>
            <input
              type="number"
              value={storeData.maxCapacity}
              onChange={(e) => updateStoreData('maxCapacity', parseInt(e.target.value))}
              className="w-full max-w-xs px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{storeData.maxCapacity}</div>
              <div className="text-xs text-blue-500/80">Pessoas</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Operating Hours */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-500" />
          Horários de Funcionamento
        </h3>
        
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const hours = storeData.operatingHours[day.key]
            
            return (
              <div key={day.key} className="flex items-center gap-4 p-4 bg-neutral-800/30 rounded-xl">
                <div className="w-32">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.enabled}
                      onChange={(e) => updateOperatingHours(day.key, 'enabled', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-neutral-700 border-neutral-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-neutral-300">
                      {day.label}
                    </span>
                  </label>
                </div>
                
                {hours.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) => updateOperatingHours(day.key, 'open', e.target.value)}
                      className="px-3 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-neutral-400">até</span>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) => updateOperatingHours(day.key, 'close', e.target.value)}
                      className="px-3 py-1.5 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="text-sm text-neutral-500 italic">Fechado</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Zones Configuration */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Zonas da Loja
          </h3>
          <button
            onClick={addZone}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Zona
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeData.zones.map((zone, index) => (
            <motion.div
              key={zone.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-700/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: zone.color }}
                  />
                  <div>
                    <h4 className="font-medium text-white">{zone.name}</h4>
                    <p className="text-xs text-neutral-400">{zone.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingZone(zone)
                      setShowZoneModal(true)
                    }}
                    className="p-1.5 hover:bg-neutral-700 rounded text-neutral-400 hover:text-white transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeZone(zone.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Zone Modal */}
      {showZoneModal && editingZone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowZoneModal(false)
            setEditingZone(null)
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md"
          >
            <h4 className="text-lg font-semibold text-white mb-4">
              {editingZone.id === Date.now().toString() ? 'Nova Zona' : 'Editar Zona'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Nome da Zona
                </label>
                <input
                  type="text"
                  value={editingZone.name}
                  onChange={(e) => setEditingZone(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Ex: Seção de Eletrônicos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editingZone.description}
                  onChange={(e) => setEditingZone(prev => prev ? { ...prev, description: e.target.value } : prev)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  placeholder="Descrição opcional da zona"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Cor
                </label>
                <div className="flex gap-2">
                  {ZONE_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditingZone(prev => prev ? { ...prev, color } : prev)}
                      className={`w-8 h-8 rounded border-2 ${
                        editingZone.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowZoneModal(false)
                  setEditingZone(null)
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => saveZone(editingZone)}
                disabled={!editingZone.name.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}