'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  Trash2,
  TestTube2,
  Eye,
  MoreVertical,
  Loader2,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Camera {
  id: string;
  name: string;
  location: string;
  ip_address: string;
  port: number;
  username?: string;
  status: 'online' | 'offline' | 'error';
  last_seen?: string;
  created_at: string;
  stream_url?: string;
  resolution?: string;
  fps?: number;
}

interface CameraSettingsTableProps {
  cameras: Camera[];
  isLoading: boolean;
  onEdit: (camera: Camera) => void;
  onDelete: (cameraId: string) => void;
  onTestConnection: (cameraId: string) => Promise<boolean>;
  onViewStream?: (camera: Camera) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function CameraSettingsTable({
  cameras,
  isLoading,
  onEdit,
  onDelete,
  onTestConnection,
  onViewStream,
  getStatusBadge,
}: CameraSettingsTableProps) {
  const [testingCameras, setTestingCameras] = useState<Set<string>>(new Set());

  const handleTestConnection = async (camera: Camera) => {
    setTestingCameras(prev => new Set(prev).add(camera.id));
    try {
      const success = await onTestConnection(camera.id);
      // Feedback visual será tratado pelo hook useCameras
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
    } finally {
      setTestingCameras(prev => {
        const newSet = new Set(prev);
        newSet.delete(camera.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="space-y-4 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cameras || cameras.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Activity className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma câmera configurada
        </h3>
        <p className="text-gray-500 mb-4">
          Configure sua primeira câmera para começar o monitoramento
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Câmera</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Configurações</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {cameras.map((camera, index) => (
                <motion.tr
                  key={camera.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-gray-50/50"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{camera.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {camera.location}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {camera.ip_address}:{camera.port}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(camera.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3" />
                      {formatLastSeen(camera.last_seen)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500 space-y-1">
                      {camera.resolution && (
                        <div>Resolução: {camera.resolution}</div>
                      )}
                      {camera.fps && (
                        <div>FPS: {camera.fps}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(camera)}
                        disabled={testingCameras.has(camera.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {testingCameras.has(camera.id) ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <TestTube2 className="w-3 h-3" />
                        )}
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          {onViewStream && (
                            <DropdownMenuItem
                              onClick={() => onViewStream(camera)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-3 h-3" />
                              Ver Stream
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => onEdit(camera)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-3 h-3" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(camera.id)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {cameras.length} câmera{cameras.length !== 1 ? 's' : ''}
        </span>
      </div>
    </motion.div>
  );
}