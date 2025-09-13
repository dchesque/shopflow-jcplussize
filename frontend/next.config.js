/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output standalone para Docker
  output: 'standalone',
  
  // React strict mode
  reactStrictMode: true,
  
  // Suppress hydration warnings for development
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Compressão
  compress: true,
  
  // Configurações de imagem
  images: {
    domains: ['localhost', 'orzzycayjzgcuvcsrxsi.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
    ],
  },
  
  // Variáveis de ambiente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  
  // Pacotes externos do servidor (movido de experimental)
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  
  // Experimental features
  experimental: {
    // Otimização de imports
    optimizePackageImports: ['lucide-react', 'recharts', '@tanstack/react-query'],
    // Turbopack optimizations
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Faster compilation
    useDeploymentId: false,
    // Faster builds
    typedRoutes: false,
  },
  
  // Configuração do Webpack
  webpack: (config, { isServer }) => {
    // Resolver aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src'),
    };
    
    // Ignorar warnings específicos
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
    ];
    
    return config;
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig