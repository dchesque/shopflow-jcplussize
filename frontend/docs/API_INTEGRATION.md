# 🔌 API Integration Guide - ShopFlow Frontend

## Visão Geral

Este documento descreve como o frontend ShopFlow integra com as APIs do backend, incluindo endpoints, estrutura de dados e padrões de integração.

## 🏗️ Arquitetura de Integração

### Stack de Integração
- **HTTP Client**: Fetch API nativo
- **State Management**: TanStack Query (React Query)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth

### Estrutura de Hooks

```typescript
// Padrão para hooks de API
export function useResource(params?: ResourceParams) {
  return useQuery({
    queryKey: ['resource', params],
    queryFn: () => fetchResource(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
```

## 📡 Endpoints da API

### Base URL
- **Desenvolvimento**: `http://localhost:8001`
- **Produção**: `https://api.shopflow.com`

### Câmeras

#### `GET /api/camera/status`
Lista todas as câmeras e seu status atual.

**Response**:
```typescript
interface CameraStatusResponse {
  cameras: Camera[]
  total_count: number
  online_count: number
}

interface Camera {
  id: string
  name: string
  location: string
  rtsp_url: string
  ip_address: string
  port: number
  status: 'online' | 'offline' | 'error'
  fps: number
  resolution?: string
  created_at: string
  last_seen?: string
  stream_url?: string
  peopleCount: number
  customersCount: number
  employeesCount: number
  detections?: Detection[]
}
```

#### `POST /api/cameras`
Cria uma nova câmera.

**Request**:
```typescript
interface CreateCameraRequest {
  name: string
  location: string
  rtsp_url: string
  ip_address: string
  port: number
  username?: string
  password?: string
}
```

#### `PUT /api/cameras/{id}`
Atualiza configurações da câmera.

#### `DELETE /api/cameras/{id}`
Remove uma câmera.

### Funcionários

#### `GET /api/employees`
Lista todos os funcionários.

**Response**:
```typescript
interface Employee {
  id: string
  full_name: string
  email: string
  document_number: string
  position: string
  status: 'active' | 'inactive' | 'suspended'
  photo_url?: string
  created_at: string
  updated_at: string
}
```

#### `POST /api/employees/register`
Registra novo funcionário com foto para reconhecimento facial.

**Request**:
```typescript
interface RegisterEmployeeRequest {
  full_name: string
  email: string
  document_number: string
  position: string
  photo: File // Arquivo de imagem
}
```

### Analytics

#### `GET /api/analytics/metrics`
Métricas gerais do sistema.

**Response**:
```typescript
interface MetricsResponse {
  people_in_store: number
  conversion_rate: number
  avg_time_spent: number
  active_employees: number
  trends: {
    people_trend: 'up' | 'down' | 'neutral'
    conversion_trend: 'up' | 'down' | 'neutral'
    time_trend: 'up' | 'down' | 'neutral'
  }
}
```

#### `GET /api/analytics/flow`
Dados de fluxo temporal para gráficos.

#### `GET /api/analytics/heatmap`
Dados do mapa de calor da loja.

### Detecções

#### `GET /api/detections/recent`
Últimas detecções de pessoas.

**Response**:
```typescript
interface Detection {
  id: string
  camera_id: string
  person_type: 'customer' | 'employee'
  confidence: number
  timestamp: string
  bbox: {
    x: number
    y: number
    width: number
    height: number
  }
  employee_id?: string // Se reconhecido como funcionário
}
```

## 🔄 Hooks de Integração

### useCameras
```typescript
import { useCameras } from '@/hooks/useCameras'

function CameraList() {
  const { cameras, isLoading, error, refetch } = useCameras()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  return (
    <div>
      {cameras.map(camera => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  )
}
```

### useEmployees
```typescript
import { useEmployees } from '@/hooks/useEmployees'

function EmployeeTable() {
  const { 
    employees, 
    isLoading, 
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee 
  } = useEmployees()
  
  // Component implementation
}
```

### useMetrics
```typescript
import { useMetrics } from '@/hooks/useMetrics'

function Dashboard() {
  const { metrics, isLoading } = useMetrics({
    refreshInterval: 30000, // Auto-refresh a cada 30s
  })
  
  return <MetricCards metrics={metrics} />
}
```

## 🔐 Autenticação

### Token Management
```typescript
// lib/auth.ts
export async function getAuthToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

// Interceptor para adicionar token
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  })
}
```

## ⚡ Real-time com Supabase

### Configuração de Canais
```typescript
// providers/RealtimeProvider.tsx
const channel = supabase
  .channel('camera-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'cameras' },
    (payload) => {
      // Atualizar estado local
      queryClient.invalidateQueries(['cameras'])
    }
  )
  .subscribe()
```

### Eventos Monitorados
- **Detecções em tempo real**: Novas pessoas detectadas
- **Status das câmeras**: Online/offline
- **Métricas**: Atualizações de contadores
- **Funcionários**: Entradas/saídas

## 🚨 Tratamento de Erros

### Estratégias de Error Handling

```typescript
// lib/api.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function handleAPIResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new APIError(
      error.message || 'Erro na API',
      response.status,
      error.code
    )
  }
  return response.json()
}
```

### Retry e Fallbacks
```typescript
// hooks/useCameras.ts
export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: fetchCameras,
    retry: (failureCount, error) => {
      // Não retry em erros de autenticação
      if (error instanceof APIError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}
```

## 📊 Caching e Performance

### Estratégias de Cache
- **Dados estáticos**: `staleTime: Infinity`
- **Dados dinâmicos**: `staleTime: 5 * 60 * 1000` (5 min)
- **Métricas real-time**: `staleTime: 30 * 1000` (30 seg)

### Invalidação de Cache
```typescript
// Quando câmera muda de status
queryClient.setQueryData(['cameras'], (old) => 
  old?.map(camera => 
    camera.id === updatedCamera.id 
      ? { ...camera, status: updatedCamera.status }
      : camera
  )
)

// Invalidar queries relacionadas
queryClient.invalidateQueries(['metrics'])
```

## 🔄 WebSockets (Planejado)

### Integração com Bridge
```typescript
// Conexão WebSocket com o bridge
const ws = new WebSocket('ws://localhost:8002/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  switch (data.type) {
    case 'detection':
      // Atualizar detecções em tempo real
      break
    case 'camera_status':
      // Atualizar status das câmeras
      break
  }
}
```

## 📈 Monitoramento e Métricas

### Performance da API
- Tempo de resposta das chamadas
- Taxa de erro por endpoint
- Cache hit rate
- Uso de bandwidth

### Alertas
- APIs fora do ar
- Latência alta
- Erros de autenticação
- Falhas de WebSocket

## 🧪 Testing de Integração

### Mocking das APIs
```typescript
// __tests__/setup.ts
export function mockAPIResponse<T>(data: T) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

// Em testes
beforeEach(() => {
  fetch.mockImplementation(() => 
    mockAPIResponse({ cameras: mockCameras })
  )
})
```

## 📋 Troubleshooting

### Problemas Comuns

1. **Timeout de Requisições**
   - Verificar conectividade
   - Aumentar timeout se necessário
   - Implementar retry logic

2. **CORS Issues**
   - Configurar headers corretos no backend
   - Verificar whitelist de domínios

3. **Cache Issues**
   - Limpar cache manualmente: `queryClient.clear()`
   - Verificar keys de cache
   - Ajustar `staleTime`

4. **Real-time Não Funciona**
   - Verificar conexão WebSocket
   - Confirmar subscriptions ativas
   - Testar com Supabase Dashboard

## 🔧 Configuração de Desenvolvimento

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Proxy Setup (se necessário)
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8001/api/:path*',
      },
    ]
  },
}
```