# 🔗 ShopFlow Backend - Exemplos de Uso da API

Este documento contém exemplos práticos de como usar a API do ShopFlow Backend em diferentes cenários e linguagens de programação.

## 📋 Índice

- [🔧 Configuração Inicial](#-configuração-inicial)
- [🏥 Health Check](#-health-check)
- [🎥 Processamento de Câmera](#-processamento-de-câmera)
- [👥 Gerenciamento de Funcionários](#-gerenciamento-de-funcionários)
- [📊 Analytics e Métricas](#-analytics-e-métricas)
- [🔄 WebSocket Tempo Real](#-websocket-tempo-real)
- [🔒 Privacidade e Conformidade](#-privacidade-e-conformidade)
- [🐍 Bibliotecas Python](#-bibliotecas-python)
- [🌐 JavaScript/Node.js](#-javascriptnodejs)
- [📱 Exemplo de Integração](#-exemplo-de-integração)

---

## 🔧 Configuração Inicial

### Base URL
```
# Desenvolvimento
http://localhost:8001

# Produção EasyPanel  
https://seu-app.easypanel.host

# Produção Customizada
https://api.suaempresa.com
```

### Headers Obrigatórios
```http
Authorization: Bearer SUA_BRIDGE_API_KEY
Content-Type: application/json
```

---

## 🏥 Health Check

### Verificar Status do Sistema

**cURL:**
```bash
curl -X GET "http://localhost:8001/api/health" \
  -H "accept: application/json"
```

**Python:**
```python
import requests

response = requests.get('http://localhost:8001/api/health')
health = response.json()

if health['status'] == 'healthy':
    print("✅ Sistema saudável!")
    print(f"Versão: {health['version']}")
    print(f"Componentes ativos: {sum(health['components'].values())}")
else:
    print("❌ Sistema com problemas")
```

**JavaScript:**
```javascript
async function checkHealth() {
    try {
        const response = await fetch('http://localhost:8001/api/health');
        const health = await response.json();
        
        console.log('Status:', health.status);
        console.log('Componentes:', health.components);
        return health.status === 'healthy';
    } catch (error) {
        console.error('Erro no health check:', error);
        return false;
    }
}
```

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T10:30:00.000Z",
  "version": "2.0.0",
  "components": {
    "database": true,
    "detector": true,
    "tracker": true,
    "smart_engine": true,
    "privacy_manager": true,
    "face_recognition": true,
    "behavior_analyzer": true,
    "customer_segmentation": true,
    "predictive_insights": true
  }
}
```

---

## 🎥 Processamento de Câmera

### Enviar Frame para Processamento

**cURL:**
```bash
curl -X POST "http://localhost:8001/api/camera/process" \
  -H "Authorization: Bearer SUA_BRIDGE_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "frame=@/path/to/frame.jpg" \
  -F "timestamp=2025-01-04T10:30:00Z" \
  -F "camera_id=cam_001"
```

**Python:**
```python
import requests
from datetime import datetime
import base64

def process_camera_frame(image_path, camera_id="cam_001", api_key="SUA_API_KEY"):
    """Processar frame da câmera com IA"""
    
    url = "http://localhost:8001/api/camera/process"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # Preparar dados
    timestamp = datetime.now().isoformat() + "Z"
    
    with open(image_path, 'rb') as f:
        files = {
            'frame': ('frame.jpg', f, 'image/jpeg')
        }
        
        data = {
            'timestamp': timestamp,
            'camera_id': camera_id
        }
        
        response = requests.post(url, headers=headers, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"✅ Frame processado com sucesso!")
        print(f"👥 Pessoas detectadas: {result['people_count']}")
        print(f"👤 Funcionários: {result['employees_detected']}")
        print(f"🛒 Clientes: {result['customers_count']}")
        print(f"👨‍👩‍👧‍👦 Grupos: {result['groups_detected']}")
        print(f"⏱️ Tempo de processamento: {result['processing_time_ms']}ms")
        
        return result
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
        return None

# Exemplo de uso
result = process_camera_frame("./exemplo_frame.jpg")
```

**JavaScript (Node.js):**
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function processCameraFrame(imagePath, cameraId = 'cam_001', apiKey = 'SUA_API_KEY') {
    const form = new FormData();
    
    form.append('frame', fs.createReadStream(imagePath));
    form.append('timestamp', new Date().toISOString());
    form.append('camera_id', cameraId);
    
    try {
        const response = await axios.post(
            'http://localhost:8001/api/camera/process',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    ...form.getHeaders()
                }
            }
        );
        
        const result = response.data;
        console.log('✅ Frame processado:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
        return null;
    }
}

// Usar
processCameraFrame('./exemplo_frame.jpg');
```

### Status da Câmera

**Python:**
```python
def get_camera_status():
    """Verificar status dos serviços de câmera"""
    response = requests.get('http://localhost:8001/api/camera/status')
    
    if response.status_code == 200:
        status = response.json()
        
        print(f"🎯 Detector carregado: {status['detector_loaded']}")
        print(f"🧠 Analytics inicializado: {status['analytics_initialized']}")
        
        modules = status['modules']
        print(f"👤 Reconhecimento facial: {modules['face_recognition']}")
        print(f"🎭 Análise comportamental: {modules['behavior_analysis']}")
        print(f"👨‍👩‍👧‍👦 Detecção de grupos: {modules['group_detection']}")
        
        return status
    else:
        print(f"❌ Erro: {response.status_code}")
        return None
```

---

## 👥 Gerenciamento de Funcionários

### Registrar Funcionário

**Python:**
```python
def register_employee(name, photo_path, employee_id=None, department=None, position=None, api_key="SUA_API_KEY"):
    """Registrar funcionário com reconhecimento facial"""
    
    url = "http://localhost:8001/api/employees/register"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    with open(photo_path, 'rb') as f:
        files = {
            'file': ('photo.jpg', f, 'image/jpeg')
        }
        
        data = {
            'name': name,
            'employee_id': employee_id or '',
            'department': department or '',
            'position': position or ''
        }
        
        response = requests.post(url, headers=headers, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"✅ Funcionário {name} registrado!")
        print(f"🆔 ID: {result['data']['employee_id']}")
        print(f"👤 Reconhecimento facial: {result['data']['face_recognition_enabled']}")
        print(f"🔒 LGPD compliant: {result['data']['privacy_compliant']}")
        
        return result['data']
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
        return None

# Exemplo de uso
employee = register_employee(
    name="João Silva",
    photo_path="./joao_foto.jpg",
    department="Vendas",
    position="Vendedor"
)
```

### Listar Funcionários

**Python:**
```python
def list_employees(active_only=True):
    """Listar funcionários registrados"""
    
    url = f"http://localhost:8001/api/employees/list?active_only={active_only}&include_last_seen=true"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        
        employees = result['data']['employees']
        stats = result['data']['statistics']
        
        print(f"📊 Estatísticas:")
        print(f"   Total registrados: {stats['total_registered']}")
        print(f"   Funcionários ativos: {stats['active_employees']}")
        print(f"   Reconhecimento facial: {stats['face_recognition_enabled']}")
        
        print(f"\n👥 Funcionários:")
        for emp in employees:
            status = "🟢 Ativo" if emp['is_active'] else "🔴 Inativo"
            last_seen = emp.get('last_seen', 'Nunca visto')
            
            print(f"   • {emp['name']} ({emp['employee_id']}) - {status}")
            print(f"     Departamento: {emp.get('department', 'N/A')}")
            print(f"     Último avistamento: {last_seen}")
        
        return employees
    else:
        print(f"❌ Erro: {response.status_code}")
        return []
```

### Remover Funcionário (Direito ao Esquecimento)

**Python:**
```python
def remove_employee(employee_id, api_key="SUA_API_KEY"):
    """Remover funcionário (LGPD compliance)"""
    
    url = f"http://localhost:8001/api/employees/{employee_id}"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"✅ Funcionário {employee_id} removido com sucesso")
        print(f"🗑️ Dados faciais deletados: {result['data']['face_data_deleted']}")
        print(f"🗄️ Banco desativado: {result['data']['database_deactivated']}")
        
        return True
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
        return False

# Exemplo
success = remove_employee("emp_12345678")
```

---

## 📊 Analytics e Métricas

### Métricas Inteligentes

**Python:**
```python
def get_smart_metrics():
    """Obter métricas inteligentes do sistema"""
    
    response = requests.get('http://localhost:8001/api/analytics/smart-metrics')
    
    if response.status_code == 200:
        result = response.json()
        
        if result['data']:
            data = result['data']
            
            # Contagem
            counting = data['counting']
            print(f"👥 Total de pessoas: {counting['total_people']}")
            print(f"🛒 Clientes: {counting['customers']}")
            print(f"👤 Funcionários: {counting['employees']}")
            print(f"🎯 Confiança: {counting['confidence_score']:.2f}")
            
            # Comportamento
            behavior = data['behavior']
            print(f"\n🎭 Comportamento:")
            print(f"   ⏱️ Tempo médio permanência: {behavior['avg_dwell_time']:.1f}min")
            print(f"   🔥 Zonas quentes: {', '.join(behavior['hot_zones'])}")
            print(f"   🌊 Padrão de fluxo: {behavior['flow_pattern']}")
            
            # Predições
            predictions = data['predictions']
            print(f"\n🔮 Predições:")
            print(f"   📈 Próxima hora: {predictions['next_hour']} pessoas")
            print(f"   💰 Prob. conversão: {predictions['conversion_probability']:.2f}")
            print(f"   👨‍💼 Staff ideal: {predictions['optimal_staff']} funcionários")
            
            # Insights
            insights = data['insights']
            if insights['recommendations']:
                print(f"\n💡 Recomendações:")
                for rec in insights['recommendations']:
                    print(f"   • {rec}")
        else:
            print("ℹ️ Nenhuma métrica disponível ainda")
            
        return result
    else:
        print(f"❌ Erro: {response.status_code}")
        return None
```

### Padrões Comportamentais

**Python:**
```python
def get_behavior_patterns(days=7):
    """Obter padrões comportamentais detalhados"""
    
    url = f"http://localhost:8001/api/analytics/behavior-patterns?hours={days * 24}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        data = result['data']
        
        print(f"📊 Análise de {days} dias:")
        print(f"   📈 Total registros: {data['total_records']}")
        print(f"   ⏱️ Tempo médio permanência: {data['avg_dwell_time']:.1f}min")
        
        # Zonas mais visitadas
        if data['summary']['most_visited_zones']:
            print(f"\n🔥 Zonas mais visitadas:")
            for zone in data['summary']['most_visited_zones']:
                print(f"   • {zone['zone']}: {zone['visits']} visitas")
        
        # Padrões de fluxo
        flow_patterns = data['flow_patterns']
        if flow_patterns:
            print(f"\n🌊 Padrões de fluxo:")
            for pattern, count in flow_patterns.items():
                print(f"   • {pattern}: {count} ocorrências")
        
        return data
    else:
        print(f"❌ Erro: {response.status_code}")
        return None
```

### Segmentação de Clientes

**Python:**
```python
def get_customer_segmentation(days=30):
    """Análise de segmentação de clientes"""
    
    url = f"http://localhost:8001/api/analytics/segmentation?days={days}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        result = response.json()
        data = result['data']
        
        print(f"🎯 Segmentação ({days} dias):")
        print(f"   👥 Total clientes: {data['total_customers']}")
        
        segments = data['segments']
        percentages = data['percentages']
        
        print(f"\n📊 Segmentos:")
        for segment, count in segments.items():
            percent = percentages.get(segment, 0)
            print(f"   • {segment.title()}: {count} clientes ({percent}%)")
        
        insights = data['insights']
        print(f"\n💡 Insights:")
        print(f"   🏆 Segmento dominante: {insights['dominant_segment']}")
        print(f"   📈 Crescimento: {', '.join(insights['growth_segments'])}")
        print(f"   ⚠️ Em risco: {', '.join(insights['at_risk_segments'])}")
        
        return data
    else:
        print(f"❌ Erro: {response.status_code}")
        return None
```

---

## 🔄 WebSocket Tempo Real

### Python com WebSocket

```python
import asyncio
import websockets
import json

async def listen_smart_metrics():
    """Ouvir métricas inteligentes em tempo real"""
    
    uri = "ws://localhost:8001/ws/smart-metrics"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("🔄 Conectado ao WebSocket de métricas")
            
            async for message in websocket:
                data = json.loads(message)
                
                if data['type'] == 'smart_metrics_update':
                    metrics = data['data']
                    timestamp = data['timestamp']
                    
                    print(f"\n📊 Métricas atualizadas ({timestamp}):")
                    
                    if 'status' in metrics and metrics['status'] == 'no_metrics_available':
                        print("   ℹ️ Nenhuma métrica disponível")
                    else:
                        print(f"   👥 Pessoas: {metrics.get('total_people', 0)}")
                        print(f"   👤 Funcionários: {metrics.get('employees', 0)}")
                        print(f"   🛒 Clientes: {metrics.get('customers', 0)}")
                        
    except websockets.exceptions.ConnectionClosed:
        print("❌ Conexão WebSocket fechada")
    except Exception as e:
        print(f"❌ Erro WebSocket: {e}")

# Executar
asyncio.run(listen_smart_metrics())
```

### JavaScript WebSocket

```javascript
class ShopFlowWebSocket {
    constructor(baseUrl = 'ws://localhost:8001') {
        this.baseUrl = baseUrl;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    
    connect() {
        this.ws = new WebSocket(`${this.baseUrl}/ws/smart-metrics`);
        
        this.ws.onopen = () => {
            console.log('🔄 WebSocket conectado');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMetricsUpdate(data);
        };
        
        this.ws.onclose = () => {
            console.log('❌ WebSocket desconectado');
            this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('❌ Erro WebSocket:', error);
        };
    }
    
    handleMetricsUpdate(data) {
        if (data.type === 'smart_metrics_update') {
            const metrics = data.data;
            const timestamp = new Date(data.timestamp);
            
            console.log('📊 Métricas atualizadas:', timestamp.toLocaleTimeString());
            
            // Atualizar interface
            this.updateDashboard(metrics);
        }
    }
    
    updateDashboard(metrics) {
        // Implementar atualização da interface
        if (metrics.status === 'no_metrics_available') {
            document.getElementById('status').textContent = 'Aguardando dados...';
        } else {
            document.getElementById('people-count').textContent = metrics.total_people || 0;
            document.getElementById('employees-count').textContent = metrics.employees || 0;
            document.getElementById('customers-count').textContent = metrics.customers || 0;
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            
            console.log(`🔄 Reconectando em ${delay/1000}s (tentativa ${this.reconnectAttempts})`);
            
            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
        }
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Usar
const wsClient = new ShopFlowWebSocket();
wsClient.connect();
```

---

## 🔒 Privacidade e Conformidade

### Configurações de Privacidade

**Python:**
```python
def get_privacy_settings():
    """Obter configurações de privacidade"""
    
    response = requests.get('http://localhost:8001/api/privacy/settings')
    
    if response.status_code == 200:
        settings = response.json()
        
        print("🔒 Configurações de Privacidade:")
        print(f"   👤 Reconhecimento facial: {settings.get('face_recognition', False)}")
        print(f"   🎭 Análise comportamental: {settings.get('behavior_analysis', False)}")
        print(f"   📅 Retenção de dados: {settings.get('data_retention_days', 30)} dias")
        print(f"   🔐 Anonimização: {settings.get('anonymize_data', False)}")
        print(f"   📋 Logs auditoria: {settings.get('audit_logging', False)}")
        print(f"   🇪🇺 GDPR compliant: {settings.get('gdpr_compliant', False)}")
        print(f"   🇧🇷 LGPD compliant: {settings.get('lgpd_compliant', False)}")
        
        return settings
    else:
        print(f"❌ Erro: {response.status_code}")
        return None

def update_privacy_settings(settings):
    """Atualizar configurações de privacidade"""
    
    url = 'http://localhost:8001/api/privacy/settings'
    
    response = requests.put(url, json=settings)
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Configurações de privacidade atualizadas")
        return True
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
        return False

# Exemplo: Desabilitar reconhecimento facial
success = update_privacy_settings({
    'face_recognition': False,
    'data_retention_days': 15
})
```

### Relatório de Conformidade

**Python:**
```python
def get_compliance_report():
    """Obter relatório de conformidade LGPD/GDPR"""
    
    response = requests.get('http://localhost:8001/api/privacy/compliance-report')
    
    if response.status_code == 200:
        report = response.json()
        
        print("📋 Relatório de Conformidade:")
        
        compliance = report.get('compliance_status', {})
        print(f"\n✅ Status de Conformidade:")
        print(f"   🇧🇷 LGPD: {'✅' if compliance.get('lgpd_compliant') else '❌'}")
        print(f"   🇪🇺 GDPR: {'✅' if compliance.get('gdpr_compliant') else '❌'}")
        
        data_processing = report.get('data_processing', {})
        print(f"\n📊 Processamento de Dados:")
        print(f"   Total registros: {data_processing.get('total_records', 0)}")
        print(f"   Dados anonimizados: {data_processing.get('anonymized_records', 0)}")
        print(f"   Retenção média: {data_processing.get('avg_retention_days', 0)} dias")
        
        rights_exercised = report.get('rights_exercised', {})
        print(f"\n👤 Direitos Exercidos:")
        print(f"   Acessos solicitados: {rights_exercised.get('access_requests', 0)}")
        print(f"   Correções solicitadas: {rights_exercised.get('correction_requests', 0)}")
        print(f"   Exclusões solicitadas: {rights_exercised.get('deletion_requests', 0)}")
        
        return report
    else:
        print(f"❌ Erro: {response.status_code}")
        return None
```

---

## 🐍 Bibliotecas Python

### Cliente Python Completo

```python
import requests
import json
from datetime import datetime
from typing import Optional, Dict, List

class ShopFlowClient:
    """Cliente Python para ShopFlow Backend API"""
    
    def __init__(self, base_url: str = "http://localhost:8001", api_key: str = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({
                'Authorization': f'Bearer {api_key}'
            })
    
    def health_check(self) -> Dict:
        """Verificar saúde do sistema"""
        response = self.session.get(f'{self.base_url}/api/health')
        response.raise_for_status()
        return response.json()
    
    def process_frame(self, image_path: str, camera_id: str = "cam_001") -> Optional[Dict]:
        """Processar frame da câmera"""
        timestamp = datetime.now().isoformat() + "Z"
        
        with open(image_path, 'rb') as f:
            files = {'frame': ('frame.jpg', f, 'image/jpeg')}
            data = {
                'timestamp': timestamp,
                'camera_id': camera_id
            }
            
            response = self.session.post(
                f'{self.base_url}/api/camera/process',
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Erro: {response.status_code} - {response.text}")
                return None
    
    def register_employee(self, name: str, photo_path: str, 
                         employee_id: str = None, department: str = None, 
                         position: str = None) -> Optional[Dict]:
        """Registrar funcionário"""
        with open(photo_path, 'rb') as f:
            files = {'file': ('photo.jpg', f, 'image/jpeg')}
            data = {
                'name': name,
                'employee_id': employee_id or '',
                'department': department or '',
                'position': position or ''
            }
            
            response = self.session.post(
                f'{self.base_url}/api/employees/register',
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Erro: {response.status_code} - {response.text}")
                return None
    
    def list_employees(self, active_only: bool = True) -> List[Dict]:
        """Listar funcionários"""
        params = {
            'active_only': active_only,
            'include_last_seen': True
        }
        
        response = self.session.get(
            f'{self.base_url}/api/employees/list',
            params=params
        )
        
        if response.status_code == 200:
            return response.json()['data']['employees']
        else:
            print(f"Erro: {response.status_code} - {response.text}")
            return []
    
    def get_smart_metrics(self) -> Optional[Dict]:
        """Obter métricas inteligentes"""
        response = self.session.get(f'{self.base_url}/api/analytics/smart-metrics')
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erro: {response.status_code} - {response.text}")
            return None
    
    def get_behavior_patterns(self, hours: int = 24) -> Optional[Dict]:
        """Obter padrões comportamentais"""
        params = {'hours': hours}
        
        response = self.session.get(
            f'{self.base_url}/api/analytics/behavior-patterns',
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erro: {response.status_code} - {response.text}")
            return None

# Exemplo de uso
if __name__ == "__main__":
    # Inicializar cliente
    client = ShopFlowClient(
        base_url="http://localhost:8001",
        api_key="sua-api-key-aqui"
    )
    
    # Verificar saúde
    health = client.health_check()
    print("Sistema saudável:", health['status'] == 'healthy')
    
    # Processar frame
    result = client.process_frame("./exemplo_frame.jpg")
    if result:
        print(f"Pessoas detectadas: {result['people_count']}")
    
    # Listar funcionários
    employees = client.list_employees()
    print(f"Total funcionários: {len(employees)}")
    
    # Obter métricas
    metrics = client.get_smart_metrics()
    if metrics and metrics['data']:
        data = metrics['data']
        print(f"Total pessoas: {data['counting']['total_people']}")
```

---

## 🌐 JavaScript/Node.js

### Cliente JavaScript

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ShopFlowClient {
    constructor(baseUrl = 'http://localhost:8001', apiKey = null) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
        
        this.http = axios.create({
            baseURL: this.baseUrl,
            headers: apiKey ? {
                'Authorization': `Bearer ${apiKey}`
            } : {}
        });
    }
    
    async healthCheck() {
        try {
            const response = await this.http.get('/api/health');
            return response.data;
        } catch (error) {
            console.error('Health check failed:', error.message);
            return null;
        }
    }
    
    async processFrame(imagePath, cameraId = 'cam_001') {
        const form = new FormData();
        
        form.append('frame', fs.createReadStream(imagePath));
        form.append('timestamp', new Date().toISOString());
        form.append('camera_id', cameraId);
        
        try {
            const response = await this.http.post('/api/camera/process', form, {
                headers: {
                    ...form.getHeaders()
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Frame processing failed:', error.response?.data || error.message);
            return null;
        }
    }
    
    async registerEmployee(name, photoPath, options = {}) {
        const form = new FormData();
        
        form.append('name', name);
        form.append('file', fs.createReadStream(photoPath));
        
        if (options.employeeId) form.append('employee_id', options.employeeId);
        if (options.department) form.append('department', options.department);
        if (options.position) form.append('position', options.position);
        
        try {
            const response = await this.http.post('/api/employees/register', form, {
                headers: {
                    ...form.getHeaders()
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Employee registration failed:', error.response?.data || error.message);
            return null;
        }
    }
    
    async listEmployees(activeOnly = true) {
        try {
            const response = await this.http.get('/api/employees/list', {
                params: {
                    active_only: activeOnly,
                    include_last_seen: true
                }
            });
            
            return response.data.data.employees;
        } catch (error) {
            console.error('List employees failed:', error.response?.data || error.message);
            return [];
        }
    }
    
    async getSmartMetrics() {
        try {
            const response = await this.http.get('/api/analytics/smart-metrics');
            return response.data;
        } catch (error) {
            console.error('Get metrics failed:', error.response?.data || error.message);
            return null;
        }
    }
    
    // WebSocket para tempo real
    connectWebSocket(onMessage, onError = null, onClose = null) {
        const WebSocket = require('ws');
        const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws/smart-metrics';
        
        const ws = new WebSocket(wsUrl);
        
        ws.on('open', () => {
            console.log('🔄 WebSocket conectado');
        });
        
        ws.on('message', (data) => {
            try {
                const parsed = JSON.parse(data);
                onMessage(parsed);
            } catch (error) {
                console.error('Erro ao parsear mensagem WebSocket:', error);
            }
        });
        
        ws.on('error', (error) => {
            console.error('❌ Erro WebSocket:', error);
            if (onError) onError(error);
        });
        
        ws.on('close', () => {
            console.log('❌ WebSocket desconectado');
            if (onClose) onClose();
        });
        
        return ws;
    }
}

// Exemplo de uso
async function main() {
    const client = new ShopFlowClient('http://localhost:8001', 'sua-api-key');
    
    // Health check
    const health = await client.healthCheck();
    console.log('Sistema saudável:', health?.status === 'healthy');
    
    // Processar frame
    const result = await client.processFrame('./exemplo_frame.jpg');
    if (result) {
        console.log(`Pessoas detectadas: ${result.people_count}`);
    }
    
    // Listar funcionários
    const employees = await client.listEmployees();
    console.log(`Total funcionários: ${employees.length}`);
    
    // WebSocket para tempo real
    const ws = client.connectWebSocket((data) => {
        if (data.type === 'smart_metrics_update') {
            console.log('Métricas atualizadas:', data.data);
        }
    });
    
    // Fechar WebSocket após 30 segundos
    setTimeout(() => ws.close(), 30000);
}

main().catch(console.error);
```

---

## 📱 Exemplo de Integração

### Dashboard Completo em Python

```python
import asyncio
import threading
import time
from datetime import datetime
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

class ShopFlowDashboard:
    """Dashboard completo para ShopFlow"""
    
    def __init__(self):
        self.client = ShopFlowClient()
        self.root = tk.Tk()
        self.root.title("ShopFlow Dashboard")
        self.root.geometry("800x600")
        
        self.setup_ui()
        self.running = True
        
        # Thread para atualizações automáticas
        self.update_thread = threading.Thread(target=self.auto_update_loop)
        self.update_thread.daemon = True
        self.update_thread.start()
    
    def setup_ui(self):
        """Configurar interface do usuário"""
        
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Status do sistema
        status_frame = ttk.LabelFrame(main_frame, text="Status do Sistema", padding="10")
        status_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.status_label = ttk.Label(status_frame, text="Verificando...")
        self.status_label.grid(row=0, column=0, sticky=tk.W)
        
        # Métricas em tempo real
        metrics_frame = ttk.LabelFrame(main_frame, text="Métricas em Tempo Real", padding="10")
        metrics_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))
        
        self.people_label = ttk.Label(metrics_frame, text="👥 Pessoas: --")
        self.people_label.grid(row=0, column=0, sticky=tk.W)
        
        self.employees_label = ttk.Label(metrics_frame, text="👤 Funcionários: --")
        self.employees_label.grid(row=0, column=1, sticky=tk.W, padx=(20, 0))
        
        self.customers_label = ttk.Label(metrics_frame, text="🛒 Clientes: --")
        self.customers_label.grid(row=0, column=2, sticky=tk.W, padx=(20, 0))
        
        # Frame para processamento
        process_frame = ttk.LabelFrame(main_frame, text="Processar Frame", padding="10")
        process_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Button(process_frame, text="Selecionar Imagem", 
                  command=self.select_and_process_image).grid(row=0, column=0, pady=(0, 5))
        
        self.process_result = ttk.Label(process_frame, text="")
        self.process_result.grid(row=1, column=0, sticky=tk.W)
        
        # Frame para funcionários
        employees_frame = ttk.LabelFrame(main_frame, text="Funcionários", padding="10")
        employees_frame.grid(row=2, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        ttk.Button(employees_frame, text="Registrar Funcionário", 
                  command=self.register_employee_dialog).grid(row=0, column=0, pady=(0, 5))
        
        ttk.Button(employees_frame, text="Listar Funcionários", 
                  command=self.list_employees_dialog).grid(row=1, column=0, pady=(0, 5))
        
        # Logs
        log_frame = ttk.LabelFrame(main_frame, text="Logs", padding="10")
        log_frame.grid(row=3, column=0, columnspan=2, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        
        self.log_text = tk.Text(log_frame, height=10, width=70)
        scrollbar = ttk.Scrollbar(log_frame, orient="vertical", command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=scrollbar.set)
        
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Configurar redimensionamento
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(3, weight=1)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
    
    def log(self, message):
        """Adicionar mensagem ao log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.insert(tk.END, f"[{timestamp}] {message}\n")
        self.log_text.see(tk.END)
    
    def auto_update_loop(self):
        """Loop de atualização automática"""
        while self.running:
            try:
                # Verificar status do sistema
                health = self.client.health_check()
                if health:
                    status = f"✅ Sistema: {health['status']} | Versão: {health['version']}"
                    self.status_label.config(text=status)
                else:
                    self.status_label.config(text="❌ Sistema indisponível")
                
                # Obter métricas
                metrics = self.client.get_smart_metrics()
                if metrics and metrics['data']:
                    data = metrics['data']['counting']
                    
                    self.people_label.config(text=f"👥 Pessoas: {data['total_people']}")
                    self.employees_label.config(text=f"👤 Funcionários: {data['employees']}")
                    self.customers_label.config(text=f"🛒 Clientes: {data['customers']}")
                else:
                    self.people_label.config(text="👥 Pessoas: --")
                    self.employees_label.config(text="👤 Funcionários: --")
                    self.customers_label.config(text="🛒 Clientes: --")
                
            except Exception as e:
                self.log(f"❌ Erro na atualização: {e}")
            
            time.sleep(5)  # Atualizar a cada 5 segundos
    
    def select_and_process_image(self):
        """Selecionar e processar imagem"""
        file_path = filedialog.askopenfilename(
            title="Selecionar imagem",
            filetypes=[("Imagens", "*.jpg *.jpeg *.png")]
        )
        
        if file_path:
            self.log(f"📸 Processando: {file_path}")
            result = self.client.process_frame(file_path)
            
            if result:
                self.process_result.config(
                    text=f"✅ {result['people_count']} pessoas | {result['processing_time_ms']}ms"
                )
                self.log(f"✅ Processamento concluído: {result['people_count']} pessoas detectadas")
            else:
                self.process_result.config(text="❌ Erro no processamento")
                self.log("❌ Erro no processamento do frame")
    
    def register_employee_dialog(self):
        """Dialog para registrar funcionário"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Registrar Funcionário")
        dialog.geometry("400x300")
        
        # Campos
        ttk.Label(dialog, text="Nome:").grid(row=0, column=0, sticky=tk.W, pady=5)
        name_entry = ttk.Entry(dialog, width=30)
        name_entry.grid(row=0, column=1, pady=5)
        
        ttk.Label(dialog, text="Departamento:").grid(row=1, column=0, sticky=tk.W, pady=5)
        dept_entry = ttk.Entry(dialog, width=30)
        dept_entry.grid(row=1, column=1, pady=5)
        
        ttk.Label(dialog, text="Cargo:").grid(row=2, column=0, sticky=tk.W, pady=5)
        pos_entry = ttk.Entry(dialog, width=30)
        pos_entry.grid(row=2, column=1, pady=5)
        
        photo_path = tk.StringVar()
        ttk.Label(dialog, text="Foto:").grid(row=3, column=0, sticky=tk.W, pady=5)
        ttk.Button(dialog, text="Selecionar Foto", 
                  command=lambda: self.select_photo(photo_path)).grid(row=3, column=1, pady=5)
        
        def register():
            if not all([name_entry.get(), photo_path.get()]):
                messagebox.showerror("Erro", "Nome e foto são obrigatórios")
                return
            
            result = self.client.register_employee(
                name_entry.get(),
                photo_path.get(),
                department=dept_entry.get() or None,
                position=pos_entry.get() or None
            )
            
            if result:
                self.log(f"✅ Funcionário registrado: {result['data']['name']}")
                messagebox.showinfo("Sucesso", "Funcionário registrado com sucesso!")
                dialog.destroy()
            else:
                messagebox.showerror("Erro", "Falha ao registrar funcionário")
        
        ttk.Button(dialog, text="Registrar", command=register).grid(row=4, column=1, pady=20)
    
    def select_photo(self, photo_var):
        """Selecionar foto do funcionário"""
        file_path = filedialog.askopenfilename(
            title="Selecionar foto",
            filetypes=[("Imagens", "*.jpg *.jpeg *.png")]
        )
        if file_path:
            photo_var.set(file_path)
    
    def list_employees_dialog(self):
        """Dialog para listar funcionários"""
        employees = self.client.list_employees()
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Funcionários Registrados")
        dialog.geometry("600x400")
        
        # Treeview
        tree = ttk.Treeview(dialog, columns=('ID', 'Nome', 'Depto', 'Cargo'), show='headings')
        tree.heading('ID', text='ID')
        tree.heading('Nome', text='Nome')
        tree.heading('Depto', text='Departamento')
        tree.heading('Cargo', text='Cargo')
        
        for emp in employees:
            tree.insert('', 'end', values=(
                emp['employee_id'],
                emp['name'],
                emp.get('department', 'N/A'),
                emp.get('position', 'N/A')
            ))
        
        tree.pack(expand=True, fill='both', padx=10, pady=10)
        
        self.log(f"📋 Listados {len(employees)} funcionários")
    
    def run(self):
        """Executar dashboard"""
        try:
            self.root.mainloop()
        finally:
            self.running = False

# Executar dashboard
if __name__ == "__main__":
    dashboard = ShopFlowDashboard()
    dashboard.run()
```

---

Este guia de exemplos fornece implementações práticas e prontas para usar com a API ShopFlow Backend. Todos os exemplos incluem tratamento de erros e são adequados para uso em produção com as devidas adaptações de segurança e configuração.

Para mais detalhes sobre cada endpoint, consulte a [Documentação Completa](BACKEND_DOCUMENTATION.md) e a documentação interativa em `/docs` quando o servidor estiver rodando.