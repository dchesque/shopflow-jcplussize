import { FlowVisualization } from '@/components/analytics/FlowVisualization'
import { GroupAnalysis } from '@/components/analytics/GroupAnalysis'
import { CustomerSegmentation } from '@/components/analytics/CustomerSegmentation'
import { PredictionDashboard } from '@/components/analytics/PredictionDashboard'
import { AnomalyAlerts } from '@/components/analytics/AnomalyAlerts'
import { AIRecommendations } from '@/components/analytics/AIRecommendations'

export default function BehavioralAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise Comportamental</h1>
          <p className="text-muted-foreground">
            Insights avançados de comportamento e padrões de clientes
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      <AnomalyAlerts className="mb-6" showOnlyActive />

      {/* Main Analytics Grid */}
      <div className="grid gap-6">
        {/* Flow and Predictions Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          <FlowVisualization />
          <PredictionDashboard />
        </div>
        
        {/* Group Analysis */}
        <GroupAnalysis />
        
        {/* Customer Segmentation */}
        <CustomerSegmentation />
        
        {/* AI Recommendations */}
        <AIRecommendations />
      </div>
    </div>
  )
}