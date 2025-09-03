/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para deployment standalone (Docker)
  output: 'standalone',
  
  // Otimizações de performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuração de imagens para Docker
  images: {
    unoptimized: true
  },
  
  // Configuração para Easypanel/Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/:path*`
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
          }
        ],
      },
    ]
  },
  
  // Configuração experimental
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

module.exports = nextConfig