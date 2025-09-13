'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import dynamic from 'next/dynamic'

// Lazy load heavy chart components
const FlowChart = dynamic(() => import('@/components/charts/FlowChart').then(mod => ({ default: mod.FlowChart })), {
  loading: () => <div className="h-[350px] bg-neutral-900/30 rounded-lg animate-pulse" />
})

const PieChart = dynamic(() => import('@/components/charts/PieChart').then(mod => ({ default: mod.PieChart })), {
  loading: () => <div className="h-[350px] bg-neutral-900/30 rounded-lg animate-pulse" />
})
import { ConnectionStatus, ConnectionBanner } from '@/components/ui/connection-status'
import { useRealTimeMetrics, useRealTimeFlowData } from '@/hooks/useRealTimeMetrics'
// import { useRealtime } from '@/components/providers/RealtimeProvider' // Disabled for demo
import { 
  Users, 
  Camera, 
  TrendingUp, 
  Activity,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  Download,
  Plus,
  ChevronRight
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data for demo (realtime disabled)
  const isConnected = false
  const lastHeartbeat = null
  const connectionStatus = 'disconnected'
  
  const { metrics, isLoading, lastUpdate, isLive } = useRealTimeMetrics({
    enabled: true,
    refreshInterval: 30000,
    enableRealtime: false // Disabled to prevent errors
  })
  const { flowData } = useRealTimeFlowData('24h')

  // Connection banner state
  const [showBanner, setShowBanner] = React.useState(false)
  const [bannerDismissed, setBannerDismissed] = React.useState(false)

  // Show connection banner when status changes
  React.useEffect(() => {
    if (!bannerDismissed) {
      if (!isConnected) {
        setShowBanner(true)
      } else {
        // Show connected banner briefly
        setShowBanner(true)
        setTimeout(() => setShowBanner(false), 3000)
      }
    }
  }, [isConnected, bannerDismissed])

  // Icon mapping for metrics
  const iconMap = {
    'people-in-store': Users,
    'conversion-rate': TrendingUp,
    'average-time': Clock,
    'active-employees': UserCheck
  }

  const colorMap = {
    'people-in-store': 'red' as const,
    'conversion-rate': 'green' as const,
    'average-time': 'purple' as const,
    'active-employees': 'blue' as const
  }

  // Mock data for distribution pie chart
  const distributionData = [
    {
      name: 'Clientes',
      value: 182,
      color: '#10b981'
    },
    {
      name: 'Funcionários',
      value: 28,
      color: '#a855f7'
    },
    {
      name: 'Visitantes',
      value: 45,
      color: '#f59e0b'
    },
    {
      name: 'Fornecedores',
      value: 12,
      color: '#3b82f6'
    }
  ]

  const cameraStatus = [
    { name: 'Entrada Principal', status: 'online', people: 12 },
    { name: 'Seção Eletrônicos', status: 'online', people: 8 },
    { name: 'Caixas', status: 'online', people: 15 },
    { name: 'Saída Fundos', status: 'online', people: 12 }
  ]

  const recentEvents = [
    { id: 1, type: 'entry', message: 'Nova pessoa detectada na entrada', time: '2 min atrás' },
    { id: 2, type: 'exit', message: 'Pessoa saiu pela entrada principal', time: '5 min atrás' },
    { id: 3, type: 'alert', message: 'Movimento suspeito na seção eletrônicos', time: '8 min atrás' },
    { id: 4, type: 'entry', message: 'Grupo de 3 pessoas entrou', time: '12 min atrás' }
  ]

  return (
    <div className="space-y-6">
      {/* Connection Banner */}
      <ConnectionBanner
        show={showBanner}
        status={isConnected ? 'connected' : 'disconnected'}
        onDismiss={() => {
          setShowBanner(false)
          setBannerDismissed(true)
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-neutral-400"
          >
            Visão geral das atividades em tempo real
          </motion.p>
        </div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ConnectionStatus
            status={connectionStatus === 'connected' ? 'connected' : 
                    connectionStatus === 'connecting' ? 'connecting' : 'disconnected'}
            lastHeartbeat={lastHeartbeat}
            showLabel={true}
            showLastUpdate={true}
          />
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              icon={iconMap[metric.id as keyof typeof iconMap] || Users}
              color={colorMap[metric.id as keyof typeof colorMap] || 'red'}
              sparklineData={metric.sparklineData}
              isLoading={isLoading}
              isLive={metric.isLive}
              lastUpdate={metric.lastUpdate}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <FlowChart
            data={flowData}
            title="Fluxo de Pessoas"
            subtitle="Últimas 24 horas"
            timeRange="24h"
            height={350}
          />
        </motion.div>
        
        {/* Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PieChart
            data={distributionData}
            title="Distribuição"
            subtitle="Hoje"
            showLegend={true}
            height={350}
          />
        </motion.div>
      </div>

      {/* Camera Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Status das Câmeras</h3>
              <Link href="/cameras">
                <Button variant="ghost" size="sm" className="text-neutral-400">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todas
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameraStatus.map((camera, index) => (
                <motion.div
                  key={camera.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{camera.name}</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-300">{camera.people} pessoas</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-neutral-900/50 border-neutral-800/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Eventos Recentes</h3>
              <Link href="/analytics">
                <Button variant="ghost" size="sm" className="text-neutral-400">
                  Ver Todos
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-neutral-800/20 rounded-lg"
                >
                  <div className={`p-2 rounded-lg ${
                    event.type === 'entry' ? 'bg-green-500/10 text-green-500' :
                    event.type === 'exit' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {event.type === 'alert' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{event.message}</p>
                    <p className="text-xs text-neutral-500 mt-1">{event.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}