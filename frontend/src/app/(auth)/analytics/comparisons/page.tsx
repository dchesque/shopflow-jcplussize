'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, TrendingUp, Target, Calculator, 
  Calendar, Building2, Zap, Crown
} from 'lucide-react'
import { PeriodComparison } from '@/components/analytics/PeriodComparison'
import { StoreBenchmarks } from '@/components/analytics/StoreBenchmarks'

// Temporary inline components for Docker build
const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const Tabs = ({ children, value, onValueChange, className = "" }: any) => (
  <div className={className}>
    {children}
  </div>
)

const TabsList = ({ children, className = "" }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ children, value, className = "" }: any) => (
  <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ${className}`}>
    {children}
  </button>
)

const TabsContent = ({ children, value, className = "" }: any) => (
  <div className={`mt-2 ${className}`}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default", className = "" }: any) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </div>
)

const CustomKPIBuilder = () => (
  <div className="p-4 border rounded-lg">
    <h3 className="text-lg font-semibold mb-4">Constructor de KPIs Customizados</h3>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">KPIs Ativos</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Taxa de Conversão por Zona</span>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tempo Médio por Seção</span>
              <Badge variant="outline">Ativo</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Eficiência de Layout</span>
              <Badge variant="outline">Ativo</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Templates Disponíveis</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              ROI por Metro Quadrado
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Índice de Satisfação Cliente
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Performance de Vendedores
            </Button>
          </div>
        </Card>
      </div>
      <Button className="w-full">
        <Calculator className="w-4 h-4 mr-2" />
        Criar Novo KPI Customizado
      </Button>
    </div>
  </div>
)

export default function ComparisonsPage() {
  const [activeTab, setActiveTab] = useState('periods')

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  const tabsData = [
    {
      id: 'periods',
      label: 'Períodos',
      icon: Calendar,
      description: 'Compare diferentes períodos com análise estatística',
      component: PeriodComparison
    },
    {
      id: 'benchmarks',
      label: 'Benchmarks',
      icon: Target,
      description: 'Compare com médias da indústria e melhores práticas',
      component: StoreBenchmarks
    },
    {
      id: 'custom',
      label: 'KPIs Custom',
      icon: Calculator,
      description: 'Crie e gerencie métricas personalizadas',
      component: CustomKPIBuilder
    }
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-6"
    >
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Comparações e Benchmarks</h1>
            <p className="text-muted-foreground">
              Análise comparativa avançada com métricas customizáveis e benchmarks da indústria
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Crescimento Geral</p>
                <p className="text-lg font-semibold text-green-600">+12.4%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">vs. Benchmarks</p>
                <p className="text-lg font-semibold text-blue-600">+8.7%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ranking</p>
                <p className="text-lg font-semibold text-yellow-600">Top 15%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">KPIs Ativos</p>
                <p className="text-lg font-semibold text-purple-600">12</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {tabsData.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Tab Content */}
        {tabsData.map((tab) => {
          const Component = tab.component
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Tab Header */}
                <Card className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-6 h-6 text-primary" />
                      <div>
                        <h2 className="text-xl font-semibold">{tab.label}</h2>
                        <p className="text-muted-foreground">{tab.description}</p>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="w-3 h-3" />
                      ShopFlow AI
                    </Badge>
                  </div>
                </Card>

                {/* Component */}
                <Component />
              </motion.div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Footer Info */}
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Dados atualizados em tempo real</span>
            <Badge variant="outline" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <span>Sprint 10: Comparações e Benchmarks</span>
            <Badge variant="default">
              Concluído
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}