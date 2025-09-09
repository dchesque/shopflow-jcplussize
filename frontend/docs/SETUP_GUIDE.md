# 🚀 Setup Guide - ShopFlow Frontend

## Pré-requisitos

### Software Necessário
- **Node.js**: versão 18.17+ ou 20.5+
- **npm**: versão 9+ (ou yarn/pnpm)
- **Git**: para controle de versão

### Verificar Instalação
```bash
node --version  # v18.17.0 ou superior
npm --version   # 9.0.0 ou superior
```

## 📦 Instalação

### 1. Clone do Repositório
```bash
git clone https://github.com/your-org/shopflow-frontend.git
cd shopflow-frontend
```

### 2. Instalação de Dependências
```bash
npm install
```

### 3. Configuração de Environment

Crie o arquivo `.env.local` na raiz do projeto:

```bash
# Crie o arquivo
cp .env.example .env.local
```

**Variáveis Obrigatórias**:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional - Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Development
NODE_ENV=development
```

## 🛠️ Configuração do Backend

### Dependências do Sistema
O frontend requer integração com:

1. **Backend API** (FastAPI)
   - URL padrão: `http://localhost:8001`
   - Documentação: [BACKEND_DOCUMENTATION.md](../../../docs/BACKEND_DOCUMENTATION.md)

2. **Bridge Service**
   - URL WebSocket: `ws://localhost:8002/ws`
   - Responsável por streaming das câmeras

3. **Supabase** (Database & Auth)
   - Configuração de projeto necessária
   - Tabelas e RLS policies

### Verificar Backend
```bash
# Testar conectividade com API
curl http://localhost:8001/health

# Verificar resposta esperada
{"status": "healthy", "version": "1.0.0"}
```

## 🚀 Execução

### Modo Desenvolvimento
```bash
npm run dev
```
- Aplicação disponível em `http://localhost:3000`
- Auto-reload ativado
- Hot Module Replacement (HMR)

### Build de Produção
```bash
# Gerar build otimizada
npm run build

# Executar build localmente
npm start
```

### Outros Comandos Úteis
```bash
# Lint do código
npm run lint

# Type checking
npm run type-check

# Executar testes
npm test

# Análise do bundle
npm run analyze
```

## 🏗️ Estrutura do Projeto

```
shopflow-frontend/
├── public/                 # Assets estáticos
├── src/
│   ├── app/               # App Router (Next.js 15)
│   │   ├── (auth)/        # Rotas autenticadas
│   │   └── layout.tsx     # Layout raiz
│   ├── components/        # Componentes React
│   │   ├── ui/            # Componentes base
│   │   ├── dashboard/     # Dashboard específicos
│   │   └── forms/         # Formulários
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilitários e configuração
│   ├── stores/            # Zustand stores
│   ├── types/             # TypeScript types
│   └── __tests__/         # Testes
├── docs/                  # Documentação
├── jest.config.js         # Configuração de testes
├── next.config.js         # Configuração do Next.js
├── tailwind.config.js     # Configuração do Tailwind
└── package.json
```

## 🔧 Configurações Importantes

### TypeScript
O projeto usa TypeScript com configuração estrita:

```json
// tsconfig.json (principais configurações)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Tailwind CSS
Configurado com design system personalizado:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#dc2626', // Red-600
          600: '#dc2626',
        }
      }
    }
  }
}
```

### Next.js
Principais configurações:

```javascript
// next.config.js
module.exports = {
  experimental: {
    turbo: true, // Turbopack para dev
  },
  images: {
    domains: ['localhost', 'supabase.co']
  }
}
```

## 🔐 Configuração do Supabase

### 1. Criar Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Copie URL e Anon Key

### 2. Configurar Tabelas

Execute os scripts SQL em `supabase/migrations/`:

```sql
-- Exemplo: criar tabela cameras
CREATE TABLE cameras (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  rtsp_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('online', 'offline', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Allow read cameras" ON cameras
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 4. Configurar Storage (para fotos)
```sql
-- Bucket para fotos de funcionários
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-photos', 'employee-photos', true);
```

## 🧪 Configuração de Testes

### Jest & Testing Library
Já configurados com:
- jsdom environment
- Next.js integration
- Module path mapping
- Global mocks

### Executar Testes
```bash
# Todos os testes
npm test

# Com coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🌐 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configurações de Deploy
- Adicionar environment variables no painel
- Configurar domínio customizado
- Setup de analytics (opcional)

### Outras Plataformas
- **Netlify**: Suporte completo para Next.js
- **AWS Amplify**: Deploy automático
- **Docker**: Dockerfile incluído

## 🔍 Troubleshooting

### Problemas Comuns

#### ❌ Erro: "Module not found"
**Solução**:
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "Cannot connect to API"
**Verificar**:
1. Backend está rodando em `localhost:8001`
2. CORS configurado corretamente
3. Environment variables corretas

#### ❌ "Supabase connection failed"
**Verificar**:
1. URL e Keys corretas em `.env.local`
2. Projeto Supabase ativo
3. RLS policies configuradas

#### ❌ Erro de Build "Type errors"
**Solução**:
```bash
# Executar type check isolado
npm run type-check

# Verificar erros específicos
npx tsc --noEmit --listFiles
```

#### ❌ Testes Falhando
**Debug**:
```bash
# Executar teste específico
npm test -- --testNamePattern="Button"

# Com verbose output
npm test -- --verbose

# Atualizar snapshots
npm test -- --updateSnapshot
```

### Logs e Debug

#### Ativar Debug do Next.js
```bash
DEBUG=* npm run dev
```

#### Verificar Network no Browser
1. Abrir DevTools (F12)
2. Tab Network
3. Verificar chamadas de API
4. Checar status codes e responses

## 📞 Suporte

### Documentação Adicional
- [Design System](./DESIGN_SYSTEM.md)
- [API Integration](./API_INTEGRATION.md)
- [Testing Guide](./TESTING_GUIDE.md)

### Contato
- **Email**: dev-team@shopflow.com
- **Slack**: #shopflow-frontend
- **Issues**: GitHub Issues

---

## ✅ Checklist de Setup

- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] `.env.local` configurado
- [ ] Backend API rodando
- [ ] Supabase projeto criado
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Testes passando (`npm test`)
- [ ] Build funcionando (`npm run build`)

**🎉 Setup completo! A aplicação deve estar rodando em `http://localhost:3000`**