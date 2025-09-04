/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para standalone output (Docker)
  output: 'standalone',
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuração de imagens
  images: {
    unoptimized: true,
    domains: ['localhost', 'supabase.co'],
  },
  
  // MOVIDO DE experimental PARA AQUI
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configuração para proxy do backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:8001'}/api/:path*`
      }
    ]
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          }
        ],
      },
    ]
  },
  
  // Configuração de variáveis de ambiente
  env: {
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },
}

module.exports = nextConfig