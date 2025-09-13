'use client';

import { useState } from 'react';
import { Plus, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CameraSettingsTable } from '@/components/cameras/CameraSettingsTable';
import { CameraConfigForm } from '@/components/cameras/CameraConfigForm';
import { useCameras, useCameraConnection } from '@/hooks/useCameras';
import { toast } from 'sonner';


export default function CameraSettingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const { cameras, isLoading, createCamera, updateCamera, deleteCamera } = useCameras();
  const { testConnection } = useCameraConnection();

  const handleAddCamera = () => {
    setEditingCamera(null);
    setIsFormOpen(true);
  };

  const handleEditCamera = (camera: any) => {
    setEditingCamera(camera);
    setIsFormOpen(true);
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (confirm('Tem certeza que deseja remover esta câmera?')) {
      try {
        await deleteCamera.mutateAsync(cameraId);
        toast.success('Câmera removida com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover câmera');
      }
    }
  };

  const handleTestConnection = async (cameraId: string) => {
    try {
      const result = await testConnection.mutateAsync(cameraId);
      return result.success;
    } catch (error) {
      return false;
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCamera) {
        await updateCamera.mutateAsync({ id: editingCamera.id, data });
        toast.success('Câmera atualizada com sucesso!');
      } else {
        await createCamera.mutateAsync(data);
        toast.success('Câmera criada com sucesso!');
      }
      setIsFormOpen(false);
      setEditingCamera(null);
    } catch (error) {
      toast.error('Erro ao salvar câmera');
      console.error('Erro ao salvar câmera:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Desconhecido
          </Badge>
        );
    }
  };

  const totalCameras = cameras?.length || 0;
  const onlineCameras = cameras?.filter(c => c.status === 'online').length || 0;
  const offlineCameras = cameras?.filter(c => c.status === 'offline').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de Câmeras</h1>
          <p className="text-gray-600">
            Gerencie suas câmeras, configurações e monitoramento
          </p>
        </div>
        <Button onClick={handleAddCamera} className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Câmera
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Câmeras</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCameras}</div>
            <p className="text-xs text-muted-foreground">
              Câmeras configuradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCameras}</div>
            <p className="text-xs text-muted-foreground">
              Funcionando normalmente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineCameras}</div>
            <p className="text-xs text-muted-foreground">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Camera Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Câmeras Configuradas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas câmeras em um só lugar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CameraSettingsTable
            cameras={cameras || []}
            isLoading={isLoading}
            onEdit={handleEditCamera}
            onDelete={handleDeleteCamera}
            onTestConnection={handleTestConnection}
            getStatusBadge={getStatusBadge}
          />
        </CardContent>
      </Card>

      {/* Camera Config Form Modal */}
      {isFormOpen && (
        <CameraConfigForm
          camera={editingCamera}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCamera(null);
          }}
          isLoading={createCamera.isPending || updateCamera.isPending}
        />
      )}
    </div>
  );
}