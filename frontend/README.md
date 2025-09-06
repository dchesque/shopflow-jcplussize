# 🚀 ShopFlow Frontend

Sistema inteligente de analytics para contagem e análise de pessoas na loja, desenvolvido com Next.js 15 e Supabase.

## 📋 Sprint 1 - CONCLUÍDO ✅

### ✅ Funcionalidades Implementadas

- **Setup Completo**: Next.js 15 com App Router, TypeScript, Tailwind CSS
- **Integração Supabase**: Cliente configurado com tipos TypeScript
- **Sistema de Design**: Componentes base (Button, Card) com variants
- **Dark Theme**: Interface moderna com gradientes e efeitos
- **ESLint & Prettier**: Configuração de linting e formatação
- **Environment**: Configuração de variáveis de ambiente

### 🛠️ Stack Tecnológica

- **Framework**: Next.js 15 (App Router, Turbo)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Database**: Supabase
- **UI Components**: shadcn/ui base
- **Icons**: Lucide React
- **Animations**: Framer Motion (configurado)

### 📁 Estrutura do Projeto

```
frontend/
├── docs/                     # Documentação
│   ├── DESIGN_SYSTEM.md     # Sistema de design completo
│   ├── PRD_FRONTEND.md      # Especificação do produto
│   └── DEVELOPMENT_ROADMAP.md # Roadmap de desenvolvimento
├── src/
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── globals.css      # Estilos globais
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página inicial
│   ├── components/
│   │   └── ui/              # Componentes base
│   │       ├── button.tsx   # Botão com variants
│   │       └── card.tsx     # Card com variants
│   └── lib/
│       ├── supabase.ts      # Cliente Supabase
│       └── utils.ts         # Utilitários
├── public/
│   └── grid.svg            # Padrão de grid para background
├── .env.example            # Template de variáveis
├── .env.local             # Variáveis de desenvolvimento
└── package.json           # Dependências
```

### 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   - Copie `.env.example` para `.env.local`
   - Configure suas credenciais do Supabase

3. **Executar em desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse: http://localhost:3000

4. **Build para produção**:
   ```bash
   npm run build
   ```

### 🎨 Design System

O projeto implementa um sistema de design moderno com:

- **Paleta de Cores**: Red/Purple primary com neutros dark
- **Componentes**: Button e Card com múltiplas variantes
- **Animações**: Hover effects e transições suaves
- **Responsividade**: Mobile-first design
- **Dark Theme**: Interface elegante otimizada para uso profissional

### 📦 Dependências Principais

```json
{
  "next": "15.0.0",
  "react": "18.3.1",
  "@supabase/supabase-js": "^2.38.0",
  "@supabase/ssr": "^0.5.2",
  "tailwindcss": "^3.4.11",
  "typescript": "^5.6.2",
  "framer-motion": "^11.5.4",
  "lucide-react": "^0.446.0"
}
```

### 🔄 Próximos Passos (Sprint 2)

- [ ] Estrutura e Layout Principal
- [ ] Sidebar de navegação
- [ ] Header com breadcrumbs
- [ ] Sistema de rotas autenticadas
- [ ] Estado global (Zustand)
- [ ] TanStack Query setup

### 🐛 Troubleshooting

- **Build Error**: Certifique-se que todas as dependências estão instaladas
- **Supabase Error**: Verifique as variáveis de ambiente no `.env.local`
- **Type Error**: Execute `npm run type-check` para verificar tipos

---

**Status**: ✅ Sprint 1 Concluído  
**Próximo**: Sprint 2 - Layout Principal  
**Desenvolvedor**: Claude Code  
**Data**: 06/09/2025