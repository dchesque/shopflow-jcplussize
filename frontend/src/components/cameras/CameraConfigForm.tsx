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
  ip_address: z.string().ip('IP inválido'),
  port: z.number().min(1).max(65535, 'Porta deve estar entre 1 e 65535'),
  username: z.string().optional(),
  password: z.string().optional(),
  stream_url: z.string().url('URL inválida').optional().or(z.literal('')),
  rtsp_url: z.string().optional(),
  resolution: z.string().optional(),
  fps: z.number().min(1).max(60).optional(),
  quality: z.enum(['low', 'medium', 'high']).optional(),
  motion_detection: z.boolean().default(true),
  face_recognition: z.boolean().default(true),
  privacy_zones: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    name: z.string()
  })).optional(),
  recording_enabled: z.boolean().default(false),
  retention_days: z.number().min(1).max(90).optional(),
  notes: z.string().optional(),
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
  const [showPassword, setShowPassword] = useState(false);
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
      motion_detection: true,
      face_recognition: true,
      recording_enabled: false,
      quality: 'medium',
      fps: 30,
      retention_days: 30,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (camera) {
      reset({
        name: camera.name,
        location: camera.location,
        ip_address: camera.ip_address,
        port: camera.port,
        username: camera.username || '',
        password: '', // Don't populate password for security
        stream_url: camera.stream_url || '',
        rtsp_url: camera.rtsp_url || '',
        resolution: camera.resolution || '',
        fps: camera.fps || 30,
        quality: camera.quality || 'medium',
        motion_detection: camera.motion_detection ?? true,
        face_recognition: camera.face_recognition ?? true,
        recording_enabled: camera.recording_enabled ?? false,
        retention_days: camera.retention_days || 30,
        notes: camera.notes || '',
        privacy_zones: camera.privacy_zones || [],
      });
    }
  }, [camera, reset]);

  const handleTestConnection = async () => {
    const currentData = watchedValues;
    if (!currentData.ip_address || !currentData.port) {
      setConnectionStatus('error');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Simular teste de conexão - na implementação real, fazer chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const success = Math.random() > 0.3; // 70% chance de sucesso
      setConnectionStatus(success ? 'success' : 'error');
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

  const qualityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="ip_address">Endereço IP *</Label>
                      <Input
                        id="ip_address"
                        placeholder="192.168.1.100"
                        {...register('ip_address')}
                        className={errors.ip_address ? 'border-red-500' : ''}
                      />
                      {errors.ip_address && (
                        <p className="text-sm text-red-500">{errors.ip_address.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="port">Porta *</Label>
                      <Input
                        id="port"
                        type="number"
                        placeholder="554"
                        {...register('port', { valueAsNumber: true })}
                        className={errors.port ? 'border-red-500' : ''}
                      />
                      {errors.port && (
                        <p className="text-sm text-red-500">{errors.port.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testingConnection || !watchedValues.ip_address || !watchedValues.port}
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
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
                        placeholder="admin"
                        {...register('username')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream_url">URL do Stream</Label>
                    <Input
                      id="stream_url"
                      placeholder="http://192.168.1.100:8080/video"
                      {...register('stream_url')}
                      className={errors.stream_url ? 'border-red-500' : ''}
                    />
                    {errors.stream_url && (
                      <p className="text-sm text-red-500">{errors.stream_url.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtsp_url">URL RTSP</Label>
                    <Input
                      id="rtsp_url"
                      placeholder="rtsp://192.168.1.100:554/stream"
                      {...register('rtsp_url')}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resolution">Resolução</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fps">FPS</Label>
                      <Input
                        id="fps"
                        type="number"
                        min="1"
                        max="60"
                        placeholder="30"
                        {...register('fps', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quality">Qualidade</Label>
                      <Select
                        value={watchedValues.quality || 'medium'}
                        onValueChange={(value: 'low' | 'medium' | 'high') => setValue('quality', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recursos de IA</CardTitle>
                  <CardDescription>
                    Configure os recursos de inteligência artificial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="motion_detection" className="text-base">
                        Detecção de Movimento
                      </Label>
                      <p className="text-sm text-gray-500">
                        Detectar e alertar sobre movimento na área de cobertura
                      </p>
                    </div>
                    <Switch
                      id="motion_detection"
                      checked={watchedValues.motion_detection}
                      onCheckedChange={(checked) => setValue('motion_detection', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="face_recognition" className="text-base">
                        Reconhecimento Facial
                      </Label>
                      <p className="text-sm text-gray-500">
                        Identificar funcionários cadastrados (LGPD compliant)
                      </p>
                    </div>
                    <Switch
                      id="face_recognition"
                      checked={watchedValues.face_recognition}
                      onCheckedChange={(checked) => setValue('face_recognition', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gravação</CardTitle>
                  <CardDescription>
                    Configure as opções de gravação e armazenamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="recording_enabled" className="text-base">
                        Gravação Habilitada
                      </Label>
                      <p className="text-sm text-gray-500">
                        Gravar e armazenar o feed da câmera
                      </p>
                    </div>
                    <Switch
                      id="recording_enabled"
                      checked={watchedValues.recording_enabled}
                      onCheckedChange={(checked) => setValue('recording_enabled', checked)}
                    />
                  </div>

                  {watchedValues.recording_enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="retention_days">Retenção (dias)</Label>
                      <Input
                        id="retention_days"
                        type="number"
                        min="1"
                        max="90"
                        placeholder="30"
                        {...register('retention_days', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-gray-500">
                        Gravações serão automaticamente excluídas após este período
                      </p>
                    </motion.div>
                  )}
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