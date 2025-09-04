export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1f2937', 
      color: 'white', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          ShopFlow - Sistema Funcionando ✅
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#9ca3af' }}>
          Frontend pronto para deploy! Backend aguardando testes.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            backgroundColor: '#374151', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Status do Sistema</h2>
            <p style={{ color: '#10b981' }}>✅ Frontend: Online</p>
            <p style={{ color: '#f59e0b' }}>⏳ Backend: Testando...</p>
            <p style={{ color: '#f59e0b' }}>⏳ Database: Aguardando</p>
            <p style={{ color: '#f59e0b' }}>⏳ IA/YOLO: Aguardando</p>
          </div>
          
          <div style={{ 
            backgroundColor: '#374151', 
            padding: '1.5rem', 
            borderRadius: '0.5rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Funcionalidades</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>📹 Detecção de Pessoas</li>
              <li style={{ marginBottom: '0.5rem' }}>📊 Análise em Tempo Real</li>
              <li style={{ marginBottom: '0.5rem' }}>🎯 IA com YOLO11</li>
              <li style={{ marginBottom: '0.5rem' }}>🔄 WebSocket</li>
              <li style={{ marginBottom: '0.5rem' }}>💾 Supabase Database</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#374151', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Próximos Passos</h2>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>✅ Deploy do Frontend no EasyPanel</li>
            <li style={{ marginBottom: '0.5rem' }}>⏳ Deploy do Backend no EasyPanel</li>
            <li style={{ marginBottom: '0.5rem' }}>⏳ Configurar variáveis de ambiente</li>
            <li style={{ marginBottom: '0.5rem' }}>⏳ Testar conectividade completa</li>
            <li style={{ marginBottom: '0.5rem' }}>⏳ Implementar páginas funcionais</li>
          </ol>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '0.875rem',
          borderTop: '1px solid #374151',
          paddingTop: '1rem'
        }}>
          <p>ShopFlow v2.0.0 - Sistema de Contagem de Pessoas</p>
          <p>Build otimizado para EasyPanel deployment 🚀</p>
        </div>
      </div>
    </div>
  )
}