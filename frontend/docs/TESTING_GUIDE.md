# 🧪 Guia de Testes - ShopFlow Frontend

## Visão Geral

Este documento descreve a estratégia de testes implementada no frontend do ShopFlow, uma aplicação de monitoramento inteligente para varejo.

## 📋 Estrutura de Testes

### Tipos de Testes Implementados

#### 🔬 Testes Unitários
- **Localização**: `src/__tests__/`
- **Framework**: Jest + Testing Library
- **Cobertura**: Componentes, hooks, utilitários

**Componentes Testados**:
- `MetricCard` - Cards de métricas do dashboard
- `Button` - Componente base de botões 
- Componentes UI principais

**Hooks Testados**:
- `useCameras` - Hook para gerenciamento de câmeras
- Hooks customizados da aplicação

**Utilitários Testados**:
- `utils.ts` - Funções de formatação e utilidade
- Helpers da aplicação

#### 🔗 Testes de Integração
- Fluxo de autenticação
- Integração com APIs
- Fluxo de dados entre componentes

#### 🎭 Testes E2E (Planejados)
- Framework: Cypress
- Jornadas completas do usuário
- Testes cross-browser

#### ♿ Testes de Acessibilidade
- Compliance WCAG 2.1 AA
- Navegação por teclado
- Screen readers
- Contraste de cores

## 🚀 Executando os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar com relatório de cobertura
npm run test:coverage

# Executar testes para CI/CD
npm run test:ci
```

### Configuração

Os testes são configurados através dos arquivos:
- `jest.config.js` - Configuração principal do Jest
- `jest.setup.js` - Configurações globais e mocks

## 📊 Métricas de Cobertura

### Metas de Cobertura
- **Branches**: 70%
- **Functions**: 70% 
- **Lines**: 70%
- **Statements**: 70%

### Como Melhorar a Cobertura
1. Adicionar testes para novos componentes
2. Testar edge cases e cenários de erro
3. Incluir testes para funções utilitárias
4. Validar props e estados dos componentes

## 🎯 Boas Práticas

### Escrevendo Testes Eficazes

1. **Teste Comportamentos, não Implementação**
   ```typescript
   // ✅ Bom - testa o comportamento
   expect(screen.getByText('Login')).toBeInTheDocument()
   
   // ❌ Ruim - testa implementação
   expect(component.state.isLoggedIn).toBe(false)
   ```

2. **Use Query Semântica**
   ```typescript
   // ✅ Preferido
   screen.getByRole('button', { name: 'Submit' })
   
   // ❌ Evitar quando possível
   screen.getByTestId('submit-button')
   ```

3. **Teste Cenários de Erro**
   ```typescript
   it('shows error message when API fails', async () => {
     mockFetch.mockRejectedValue(new Error('Network error'))
     // ... test error handling
   })
   ```

### Estrutura de Arquivos de Teste

```
src/__tests__/
├── components/           # Testes de componentes
│   ├── ui/              # Componentes base
│   ├── dashboard/       # Componentes do dashboard
│   └── forms/           # Componentes de formulário
├── hooks/               # Testes de hooks customizados
├── lib/                 # Testes de utilitários
└── utils/               # Helpers de teste
```

## 🔧 Mocks e Setup

### Mocks Globais Configurados

- **Next.js Router**: Navegação mockada
- **Next.js Image**: Componente de imagem simplificado
- **matchMedia**: Para testes responsivos
- **IntersectionObserver**: Para componentes que usam observação

### Configurando Novos Mocks

```typescript
// jest.setup.js
jest.mock('minha-biblioteca', () => ({
  funcaoMockada: jest.fn()
}))
```

## 🐛 Debugging de Testes

### Estratégias para Debug

1. **Use screen.debug()**
   ```typescript
   screen.debug() // Mostra o DOM atual
   ```

2. **Loggar Props e Estado**
   ```typescript
   console.log(component.props)
   ```

3. **Teste em Isolamento**
   ```bash
   npm test -- --testNamePattern="nome do teste específico"
   ```

## 📈 Relatórios e CI/CD

### Integração Contínua
- Testes executados automaticamente em PRs
- Falha na build se cobertura cair abaixo do limite
- Relatórios de cobertura gerados automaticamente

### Visualização de Cobertura
- Relatórios HTML em `coverage/lcov-report/index.html`
- Métricas por arquivo e função
- Linhas não cobertas destacadas

## 🆘 Solução de Problemas

### Problemas Comuns

1. **Testes Assíncronos Falhando**
   ```typescript
   // Use waitFor para elementos assíncronos
   await waitFor(() => {
     expect(screen.getByText('Loaded')).toBeInTheDocument()
   })
   ```

2. **Mocks não Funcionando**
   - Verifique se o mock está no `jest.setup.js`
   - Confirme o caminho do módulo
   - Use `jest.clearAllMocks()` entre testes

3. **Testes Lentos**
   - Evite `setTimeout` desnecessários
   - Use mocks ao invés de chamadas reais
   - Configure timeouts adequados

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)