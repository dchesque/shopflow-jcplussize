'use client';

import { useState } from 'react';
import { Plus, Settings, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { CameraSettingsTable } from '@/components/cameras/CameraSettingsTable';
// import { CameraConfigForm } from '@/components/cameras/CameraConfigForm';
// import { useCameras, useCameraConnection } from '@/hooks/useCameras';

// Temporary inline components for Docker build
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

const Button = ({ children, className = "", onClick, ...props }: any) => (
  <button className={`px-4 py-2 rounded-md font-medium ${className}`} onClick={onClick} {...props}>
    {children}
  </button>
)

const Badge = ({ children, variant = "default", className = "" }: any) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </div>
)

// Mock components
const CameraSettingsTable = ({ cameras, isLoading, onEdit, onDelete, onTestConnection, getStatusBadge }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-gray-600">Tabela de configurações de câmeras em desenvolvimento.</p>
    {cameras?.length > 0 && (
      <div className="mt-4 space-y-2">
        {cameras.map((camera: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span>Câmera {index + 1} - {camera.name || 'Sem nome'}</span>
            {getStatusBadge(camera.status || 'unknown')}
          </div>
        ))}
      </div>
    )}
  </div>
)

const CameraConfigForm = ({ camera, onSubmit, onCancel, isLoading }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">
        {camera ? 'Editar Câmera' : 'Adicionar Câmera'}
      </h3>
      <p className="text-gray-600 mb-4">Formulário de configuração em desenvolvimento.</p>
      <div className="flex gap-2">
        <Button onClick={() => onSubmit({})}>Salvar</Button>
        <Button onClick={onCancel}>Cancelar</Button>
      </div>
    </div>
  </div>
)

// Mock hooks
const useCameras = () => ({
  cameras: [] as any[],
  isLoading: false,
  createCamera: {
    mutateAsync: async (data: any) => {},
    isPending: false
  },
  updateCamera: {
    mutateAsync: async ({ id, data }: any) => {},
    isPending: false
  },
  deleteCamera: {
    mutateAsync: async (id: string) => {}
  }
});

const useCameraConnection = () => ({
  testConnection: {
    mutateAsync: async (cameraId: string) => ({ success: true })
  }
});

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
      await deleteCamera.mutateAsync(cameraId);
    }
  };

  const handleTestConnection = async (cameraId: string) => {
    const result = await testConnection.mutateAsync(cameraId);
    return result.success;
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingCamera) {
        await updateCamera.mutateAsync({ id: editingCamera.id, data });
      } else {
        await createCamera.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingCamera(null);
    } catch (error) {
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