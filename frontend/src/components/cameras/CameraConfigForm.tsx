'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Video,
  Settings,
  Shield,
  TestTube2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cameraSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  location: z.string().min(1, 'Localização é obrigatória'),
  rtsp_url: z.string().min(1, 'URL RTSP é obrigatória'),
  fps: z.number().min(1).max(60, 'FPS deve estar entre 1 e 60'),
  resolution: z.string().min(1, 'Resolução é obrigatória'),
  confidence_threshold: z.number().min(0.1).max(1.0, 'Threshold deve estar entre 0.1 e 1.0'),
  line_position: z.number().min(0).max(100, 'Posição da linha deve estar entre 0 e 100'),
  detection_zone: z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    width: z.number().min(1).max(100),
    height: z.number().min(1).max(100),
  }),
  is_active: z.boolean(),
});

type CameraFormData = z.infer<typeof cameraSchema>;

interface CameraConfigFormProps {
  camera?: any;
  onSubmit: (data: CameraFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function CameraConfigForm({
  camera,
  onSubmit,
  onCancel,
  isLoading,
}: CameraConfigFormProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('basic');

  const isEditing = !!camera;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CameraFormData>({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: camera?.name || '',
      location: camera?.location || '',
      rtsp_url: camera?.rtsp_url || '',
      fps: camera?.fps || 30,
      resolution: camera?.resolution || '1920x1080',
      confidence_threshold: camera?.confidence_threshold || 0.5,
      line_position: camera?.line_position || 50,
      detection_zone: camera?.detection_zone || { x: 0, y: 0, width: 100, height: 100 },
      is_active: camera?.is_active ?? true,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (camera) {
      reset({
        name: camera.name,
        location: camera.location,
        rtsp_url: camera.rtsp_url,
        fps: camera.fps || 30,
        resolution: camera.resolution || '1920x1080',
        confidence_threshold: camera.confidence_threshold || 0.5,
        line_position: camera.line_position || 50,
        detection_zone: camera.detection_zone || { x: 0, y: 0, width: 100, height: 100 },
        is_active: camera.is_active ?? true,
      });
    }
  }, [camera, reset]);

  const handleTestConnection = async () => {
    const currentData = watchedValues;
    if (!currentData.rtsp_url) {
      setConnectionStatus('error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // In production, this would call the backend API to test camera connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Real connection test (assuming API validates connection)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/cameras/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      setConnectionStatus(response.ok ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const onFormSubmit = async (data: CameraFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Erro ao salvar câmera:', error);
    }
  };

  const resolutionOptions = [
    { value: '640x480', label: '640x480 (VGA)' },
    { value: '1280x720', label: '1280x720 (HD)' },
    { value: '1920x1080', label: '1920x1080 (Full HD)' },
    { value: '2560x1440', label: '2560x1440 (2K)' },
    { value: '3840x2160', label: '3840x2160 (4K)' },
  ];


  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            {isEditing ? 'Editar Câmera' : 'Adicionar Nova Câmera'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize as configurações da câmera selecionada'
              : 'Configure uma nova câmera para monitoramento'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="stream">Stream</TabsTrigger>
              <TabsTrigger value="features">Recursos</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações Básicas</CardTitle>
                  <CardDescription>
                    Configure as informações essenciais da câmera
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Câmera *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Entrada Principal"
                        {...register('name')}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Localização *</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Recepção - Térreo"
                        {...register('location')}
                        className={errors.location ? 'border-red-500' : ''}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500">{errors.location.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtsp_url">URL RTSP *</Label>
                    <Input
                      id="rtsp_url"
                      placeholder="rtsp://192.168.1.100:554/stream1"
                      {...register('rtsp_url')}
                      className={errors.rtsp_url ? 'border-red-500' : ''}
                    />
                    {errors.rtsp_url && (
                      <p className="text-sm text-red-500">{errors.rtsp_url.message}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !watchedValues.rtsp_url}
                      className="flex items-center gap-2"
                    >
                      {testingConnection ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube2 className="w-4 h-4" />
                      )}
                      Testar Conexão
                    </Button>

                    <AnimatePresence>
                      {connectionStatus !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                        >
                          {connectionStatus === 'success' ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Conexão OK
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Conexão Falhou
                            </Badge>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Informações adicionais sobre a câmera..."
                      rows={3}
                      {...register('notes')}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stream" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações de Stream</CardTitle>
                  <CardDescription>
                    Configure as propriedades de transmissão da câmera
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolução *</Label>
                      <Select
                        value={watchedValues.resolution || ''}
                        onValueChange={(value) => setValue('resolution', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {resolutionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.resolution && (
                        <p className="text-sm text-red-500">{errors.resolution.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fps">FPS *</Label>
                      <Input
                        id="fps"
                        type="number"
                        min="1"
                        max="60"
                        placeholder="30"
                        {...register('fps', { valueAsNumber: true })}
                        className={errors.fps ? 'border-red-500' : ''}
                      />
                      {errors.fps && (
                        <p className="text-sm text-red-500">{errors.fps.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidence_threshold">Limiar de Confiança *</Label>
                    <div className="space-y-2">
                      <Input
                        id="confidence_threshold"
                        type="number"
                        min="0.1"
                        max="1.0"
                        step="0.01"
                        placeholder="0.5"
                        {...register('confidence_threshold', { valueAsNumber: true })}
                        className={errors.confidence_threshold ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-gray-500">
                        Nível mínimo de confiança para detectar pessoas (0.1 a 1.0)
                      </p>
                      {errors.confidence_threshold && (
                        <p className="text-sm text-red-500">{errors.confidence_threshold.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="line_position">Posição da Linha (%)</Label>
                    <div className="space-y-2">
                      <Input
                        id="line_position"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="50"
                        {...register('line_position', { valueAsNumber: true })}
                        className={errors.line_position ? 'border-red-500' : ''}
                      />
                      <p className="text-xs text-gray-500">
                        Posição da linha de contagem na tela (0% = topo, 100% = base)
                      </p>
                      {errors.line_position && (
                        <p className="text-sm text-red-500">{errors.line_position.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações da Câmera</CardTitle>
                  <CardDescription>
                    Configure as opções da câmera e zona de detecção
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_active" className="text-base">
                        Câmera Ativa
                      </Label>
                      <p className="text-sm text-gray-500">
                        Habilitar ou desabilitar o processamento desta câmera
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={watchedValues.is_active}
                      onCheckedChange={(checked) => setValue('is_active', checked)}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base">Zona de Detecção (%)</Label>
                    <p className="text-sm text-gray-500">
                      Configure a área da imagem onde as detecções serão processadas
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="detection_zone_x">X (posição horizontal)</Label>
                        <Input
                          id="detection_zone_x"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={watchedValues.detection_zone?.x || 0}
                          onChange={(e) => setValue('detection_zone', {
                            ...watchedValues.detection_zone,
                            x: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="detection_zone_y">Y (posição vertical)</Label>
                        <Input
                          id="detection_zone_y"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          value={watchedValues.detection_zone?.y || 0}
                          onChange={(e) => setValue('detection_zone', {
                            ...watchedValues.detection_zone,
                            y: parseInt(e.target.value) || 0
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="detection_zone_width">Largura</Label>
                        <Input
                          id="detection_zone_width"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="100"
                          value={watchedValues.detection_zone?.width || 100}
                          onChange={(e) => setValue('detection_zone', {
                            ...watchedValues.detection_zone,
                            width: parseInt(e.target.value) || 100
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="detection_zone_height">Altura</Label>
                        <Input
                          id="detection_zone_height"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="100"
                          value={watchedValues.detection_zone?.height || 100}
                          onChange={(e) => setValue('detection_zone', {
                            ...watchedValues.detection_zone,
                            height: parseInt(e.target.value) || 100
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações Avançadas</CardTitle>
                  <CardDescription>
                    Opções avançadas para usuários experientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      As configurações desta seção são para usuários avançados.
                      Modificações incorretas podem afetar o funcionamento da câmera.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Salvando...' : 'Criando...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Salvar Alterações' : 'Criar Câmera'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}