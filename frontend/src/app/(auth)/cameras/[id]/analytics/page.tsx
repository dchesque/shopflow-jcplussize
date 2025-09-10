'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin,
  Download,
  Calendar,
  Activity,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';

// Temporary inline components for Docker build
const Button = ({ children, className = "", variant = "default", ...props }: any) => (
  <button className={`px-4 py-2 rounded-md font-medium ${className}`} {...props}>
    {children}
  </button>
)

const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "", ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "", ...props }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = "", ...props }: any) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
)

const CardContent = ({ children, className = "", ...props }: any) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)

const Badge = ({ children, variant = "default", className = "" }: any) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </div>
)

const Separator = ({ className = "" }: any) => (
  <div className={`shrink-0 bg-border h-[1px] w-full ${className}`} />
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

const Progress = ({ value, className = "" }: any) => (
  <div className={`w-full bg-secondary rounded-full h-2 ${className}`}>
    <div className="bg-primary h-2 rounded-full" style={{ width: `${value || 0}%` }}></div>
  </div>
)

// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
import { useCameras, useCameraAnalytics, useCameraExport } from '@/hooks/useCameras';
// import { PeopleFlowChart } from '@/components/charts/PeopleFlowChart';

const PeopleFlowChart = ({ data }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-gray-600">Gráfico de fluxo de pessoas em desenvolvimento.</p>
  </div>
)

const HeatmapChart = ({ data }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-gray-600">Gráfico de heatmap em desenvolvimento.</p>
  </div>
)

const BehaviorPatternsChart = ({ data }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-gray-600">Gráfico de padrões de comportamento em desenvolvimento.</p>
  </div>
)

const PredictionsChart = ({ data }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-gray-600">Gráfico de predições em desenvolvimento.</p>
  </div>
)

// import { HeatmapChart } from '@/components/charts/HeatmapChart';
// import { BehaviorPatternsChart } from '@/components/charts/BehaviorPatternsChart';
// import { PredictionsChart } from '@/components/charts/PredictionsChart';

interface CameraAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function CameraAnalyticsPage({ params }: CameraAnalyticsPageProps) {
  const { id } = use(params);
  const { cameras } = useCameras();
  const { analytics, isLoading: analyticsLoading } = useCameraAnalytics(id);
  const { exportSnapshot, exportVideoClip, exportReport } = useCameraExport();

  const camera = cameras?.find(c => c.id === id);

  const handleExport = async (type: 'snapshot' | 'clip' | 'report') => {
    try {
      let downloadUrl: string;
      let filename: string;

      switch (type) {
        case 'snapshot':
          downloadUrl = await exportSnapshot.mutateAsync(id);
          filename = `camera-${id}-snapshot-${new Date().toISOString().split('T')[0]}.jpg`;
          break;
        case 'clip':
          downloadUrl = await exportVideoClip.mutateAsync({ cameraId: id, duration: 60 });
          filename = `camera-${id}-clip-${new Date().toISOString().split('T')[0]}.mp4`;
          break;
        case 'report':
          const today = new Date().toISOString().split('T')[0];
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          downloadUrl = await exportReport.mutateAsync({
            cameraId: id,
            format: 'pdf',
            dateRange: { start: weekAgo, end: today }
          });
          filename = `camera-${id}-report-${today}.pdf`;
          break;
        default:
          return;
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(`Erro ao exportar ${type}:`, error);
    }
  };

  if (!camera) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Câmera não encontrada</h1>
        <p className="text-gray-600 mt-2">A câmera solicitada não existe ou foi removida.</p>
        <Link href="/cameras/settings">
          <Button className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Configurações
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const conversionRate = (analytics?.daily_metrics?.conversion_rate || 0) * 100;
  const anomalyScore = (analytics?.predictions?.anomaly_score || 0) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/cameras/settings">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{camera.name}</h1>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{camera.location}</span>
                <Badge className={getStatusColor(camera.status)}>
                  {camera.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('snapshot')}
            disabled={exportSnapshot.isPending}
          >
            <Download className="w-4 h-4 mr-1" />
            Snapshot
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('clip')}
            disabled={exportVideoClip.isPending}
          >
            <Download className="w-4 h-4 mr-1" />
            Clipe
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('report')}
            disabled={exportReport.isPending}
          >
            <Download className="w-4 h-4 mr-1" />
            Relatório
          </Button>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pessoas Detectadas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.daily_metrics?.people_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{analytics?.daily_metrics?.customers_count || 0} clientes hoje
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor((analytics?.daily_metrics?.avg_dwell_time || 0) / 60)}min
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Permanência na área
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {conversionRate.toFixed(1)}%
                  </div>
                  <Progress value={conversionRate} className="mt-2" />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score de Anomalia</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {anomalyScore.toFixed(1)}%
                  </div>
                  <Badge variant={anomalyScore > 50 ? 'destructive' : 'default'} className="mt-2">
                    {anomalyScore > 50 ? 'Atenção' : 'Normal'}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Tabs defaultValue="flow" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="flow">Fluxo</TabsTrigger>
                <TabsTrigger value="heatmap">Mapa de Calor</TabsTrigger>
                <TabsTrigger value="behavior">Comportamento</TabsTrigger>
                <TabsTrigger value="predictions">Predições</TabsTrigger>
              </TabsList>

              <TabsContent value="flow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Fluxo de Pessoas</CardTitle>
                    <CardDescription>
                      Análise temporal do movimento de pessoas na área de cobertura
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PeopleFlowChart 
                      data={analytics?.daily_metrics}
                    />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Picos de Atividade</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics?.daily_metrics?.peak_hours?.map((hour: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Activity className="w-3 h-3 text-blue-600" />
                            <span className="text-sm font-mono">{hour}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {analytics?.daily_metrics?.employees_count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Identificados hoje
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status da IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ativa
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="heatmap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mapa de Calor</CardTitle>
                    <CardDescription>
                      Visualização das zonas de maior atividade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HeatmapChart 
                      data={analytics?.behavior_patterns?.hotspots}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavior" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Padrões de Comportamento</CardTitle>
                    <CardDescription>
                      Análise dos padrões de movimento e grupos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BehaviorPatternsChart 
                      data={analytics?.behavior_patterns}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="predictions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Predições IA</CardTitle>
                    <CardDescription>
                      Insights preditivos baseados em análise temporal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PredictionsChart 
                      data={analytics?.predictions}
                    />
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Recomendação de Staff</h4>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-lg font-bold">
                            {analytics?.predictions?.staff_recommendation || 0}
                          </span>
                          <span className="text-sm text-gray-600">funcionários</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Fluxo Próxima Hora</h4>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold">
                            {analytics?.predictions?.next_hour_flow || 0}
                          </span>
                          <span className="text-sm text-gray-600">pessoas</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </div>
  );
}