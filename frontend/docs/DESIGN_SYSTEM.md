# 🎨 DESIGN SYSTEM - SHOPFLOW

## 1. FUNDAMENTOS VISUAIS

### 🎨 Paleta de Cores

```scss
// Cores Primárias
$primary: {
  50:  #fef2f2,
  100: #fee2e2,
  200: #fecaca,
  300: #fca5a5,
  400: #f87171,
  500: #ef4444,  // Principal
  600: #dc2626,
  700: #b91c1c,
  800: #991b1b,
  900: #7f1d1d,
  950: #450a0a
}

// Cores Secundárias
$secondary: {
  50:  #faf5ff,
  100: #f3e8ff,
  200: #e9d5ff,
  300: #d8b4fe,
  400: #c084fc,
  500: #a855f7,  // Principal
  600: #9333ea,
  700: #7e22ce,
  800: #6b21a8,
  900: #581c87,
  950: #3b0764
}

// Cores de Apoio
$accent: {
  blue:   #3b82f6,
  green:  #10b981,
  yellow: #f59e0b,
  orange: #fb923c,
  pink:   #ec4899,
  purple: #8b5cf6
}

// Neutros (Dark Theme Base)
$neutral: {
  50:  #fafafa,
  100: #f4f4f5,
  200: #e4e4e7,
  300: #d4d4d8,
  400: #a1a1aa,
  500: #71717a,
  600: #52525b,
  700: #3f3f46,
  800: #27272a,
  900: #18181b,
  950: #09090b
}

// Cores Semânticas
$semantic: {
  success:    #10b981,
  warning:    #f59e0b,
  error:      #ef4444,
  info:       #3b82f6,
  background: #0a0a0b,
  surface:    #18181b,
  card:       #1f1f23,
  border:     #27272a
}
```

### 📐 Tipografia

```scss
// Font Family
$font-family: {
  sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif,
  mono: 'JetBrains Mono', 'Courier New', monospace,
  display: 'Cal Sans', 'Inter', sans-serif
}

// Font Sizes
$font-size: {
  xs:   '0.75rem',    // 12px
  sm:   '0.875rem',   // 14px
  base: '1rem',       // 16px
  lg:   '1.125rem',   // 18px
  xl:   '1.25rem',    // 20px
  2xl:  '1.5rem',     // 24px
  3xl:  '1.875rem',   // 30px
  4xl:  '2.25rem',    // 36px
  5xl:  '3rem',       // 48px
  6xl:  '3.75rem',    // 60px
  7xl:  '4.5rem'      // 72px
}

// Font Weights
$font-weight: {
  thin:       100,
  light:      300,
  normal:     400,
  medium:     500,
  semibold:   600,
  bold:       700,
  extrabold:  800,
  black:      900
}

// Line Heights
$line-height: {
  none:    1,
  tight:   1.25,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2
}
```

### 📏 Espaçamento

```scss
$spacing: {
  0:   '0',
  px:  '1px',
  0.5: '0.125rem',  // 2px
  1:   '0.25rem',   // 4px
  1.5: '0.375rem',  // 6px
  2:   '0.5rem',    // 8px
  2.5: '0.625rem',  // 10px
  3:   '0.75rem',   // 12px
  3.5: '0.875rem',  // 14px
  4:   '1rem',      // 16px
  5:   '1.25rem',   // 20px
  6:   '1.5rem',    // 24px
  7:   '1.75rem',   // 28px
  8:   '2rem',      // 32px
  9:   '2.25rem',   // 36px
  10:  '2.5rem',    // 40px
  11:  '2.75rem',   // 44px
  12:  '3rem',      // 48px
  14:  '3.5rem',    // 56px
  16:  '4rem',      // 64px
  20:  '5rem',      // 80px
  24:  '6rem',      // 96px
  28:  '7rem',      // 112px
  32:  '8rem',      // 128px
  36:  '9rem',      // 144px
  40:  '10rem',     // 160px
  44:  '11rem',     // 176px
  48:  '12rem',     // 192px
  52:  '13rem',     // 208px
  56:  '14rem',     // 224px
  60:  '15rem',     // 240px
  64:  '16rem',     // 256px
  72:  '18rem',     // 288px
  80:  '20rem',     // 320px
  96:  '24rem'      // 384px
}
```

### 🔄 Border Radius

```scss
$rounded: {
  none:  '0',
  sm:    '0.125rem',   // 2px
  base:  '0.25rem',    // 4px
  md:    '0.375rem',   // 6px
  lg:    '0.5rem',     // 8px
  xl:    '0.75rem',    // 12px
  2xl:   '1rem',       // 16px
  3xl:   '1.5rem',     // 24px
  full:  '9999px'
}
```

### 🌊 Sombras

```scss
$shadow: {
  xs:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm:   '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl:   '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  2xl:  '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  
  // Sombras coloridas para cards
  glow: {
    red:    '0 0 50px -12px rgba(239, 68, 68, 0.25)',
    purple: '0 0 50px -12px rgba(168, 85, 247, 0.25)',
    blue:   '0 0 50px -12px rgba(59, 130, 246, 0.25)',
    green:  '0 0 50px -12px rgba(16, 185, 129, 0.25)',
    orange: '0 0 50px -12px rgba(251, 146, 60, 0.25)'
  }
}
```

## 2. COMPONENTES BASE

### 🔘 Botões

```tsx
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
}

const buttonStyles = {
  base: `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  
  variants: {
    primary: `
      bg-gradient-to-r from-red-500 to-red-600
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/30 hover:scale-105
      focus:ring-red-500
    `,
    secondary: `
      bg-gradient-to-r from-purple-500 to-purple-600
      text-white shadow-lg shadow-purple-500/25
      hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105
      focus:ring-purple-500
    `,
    ghost: `
      bg-transparent text-neutral-300
      hover:bg-neutral-800 hover:text-white
      focus:ring-neutral-500
    `,
    outline: `
      border border-neutral-700 bg-transparent text-neutral-300
      hover:bg-neutral-800 hover:border-neutral-600 hover:text-white
      focus:ring-neutral-500
    `,
    danger: `
      bg-red-500/10 text-red-500 border border-red-500/20
      hover:bg-red-500/20 hover:border-red-500/30
      focus:ring-red-500
    `
  },
  
  sizes: {
    xs: 'px-2.5 py-1.5 text-xs rounded-md gap-1',
    sm: 'px-3 py-2 text-sm rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    lg: 'px-5 py-3 text-base rounded-xl gap-2',
    xl: 'px-6 py-3.5 text-base rounded-xl gap-2.5'
  }
}
```

### 📊 Cards

```tsx
// Card.tsx
interface CardProps {
  variant?: 'default' | 'stat' | 'chart' | 'glass'
  glow?: 'red' | 'purple' | 'blue' | 'green' | 'orange'
  interactive?: boolean
}

const cardStyles = {
  base: `
    rounded-2xl p-6 transition-all duration-300
  `,
  
  variants: {
    default: `
      bg-neutral-900 border border-neutral-800
    `,
    stat: `
      bg-gradient-to-br from-neutral-900 to-neutral-800
      border border-neutral-700/50
    `,
    chart: `
      bg-neutral-900/95 backdrop-blur-xl
      border border-neutral-800/50
    `,
    glass: `
      bg-white/5 backdrop-blur-md
      border border-white/10
    `
  },
  
  interactive: `
    hover:scale-[1.02] hover:shadow-2xl
    cursor-pointer
  `,
  
  glow: {
    red:    'shadow-xl shadow-red-500/10 hover:shadow-red-500/20',
    purple: 'shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20',
    blue:   'shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20',
    green:  'shadow-xl shadow-green-500/10 hover:shadow-green-500/20',
    orange: 'shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20'
  }
}
```

### 📈 Gráficos

```tsx
// ChartCard.tsx
const ChartCard = ({ title, subtitle, children, actions }) => (
  <div className="bg-neutral-900/95 rounded-2xl p-6 border border-neutral-800/50">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
    
    <div className="relative">
      {/* Gradient overlay para dar profundidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent pointer-events-none rounded-xl" />
      {children}
    </div>
  </div>
)

// Configuração do Recharts
const chartTheme = {
  colors: ['#ef4444', '#a855f7', '#f59e0b', '#3b82f6', '#10b981'],
  
  grid: {
    stroke: '#27272a',
    strokeDasharray: '3 3'
  },
  
  axis: {
    stroke: '#52525b',
    style: {
      fontSize: 12,
      fill: '#71717a'
    }
  },
  
  tooltip: {
    contentStyle: {
      backgroundColor: '#18181b',
      border: '1px solid #27272a',
      borderRadius: '8px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    },
    labelStyle: {
      color: '#e4e4e7',
      fontWeight: 600
    }
  }
}
```

## 3. LAYOUT & ESTRUTURA

### 🏗️ Layout Principal

```tsx
// Layout.tsx
const Layout = ({ children }) => (
  <div className="min-h-screen bg-neutral-950">
    {/* Gradient de fundo */}
    <div className="fixed inset-0 bg-gradient-to-br from-red-500/5 via-neutral-950 to-purple-500/5" />
    
    {/* Grid pattern sutil */}
    <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
    
    {/* Sidebar */}
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900/50 backdrop-blur-xl border-r border-neutral-800">
      <Sidebar />
    </aside>
    
    {/* Main Content */}
    <main className="ml-64 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
        <Header />
      </header>
      
      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </main>
  </div>
)
```

### 📱 Sidebar

```tsx
// Sidebar.tsx
const Sidebar = () => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">ShopFlow</span>
      </div>
    </div>
    
    {/* Navigation */}
    <nav className="flex-1 p-4">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.id}>
            <NavLink
              href={item.href}
              className="
                flex items-center gap-3 px-4 py-3 rounded-xl
                text-neutral-400 hover:text-white
                hover:bg-neutral-800/50
                transition-all duration-200
                group relative
              "
              activeClassName="
                text-white bg-gradient-to-r from-red-500/10 to-purple-500/10
                border border-red-500/20
              "
            >
              {/* Indicador de ativo */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-500 to-purple-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    
    {/* User Section */}
    <div className="p-4 border-t border-neutral-800">
      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-800/50 transition-all">
        <img
          src="/avatar.jpg"
          alt="User"
          className="w-10 h-10 rounded-full border-2 border-neutral-700"
        />
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">João Silva</p>
          <p className="text-xs text-neutral-500">Gerente</p>
        </div>
        <ChevronRight className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  </div>
)
```

## 4. COMPONENTES ESPECÍFICOS

### 📊 Widget de Métricas

```tsx
// MetricCard.tsx
const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  color = 'red'
}) => {
  const colors = {
    red: 'from-red-500 to-red-600 shadow-red-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
    green: 'from-green-500 to-green-600 shadow-green-500/25',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/25'
  }
  
  return (
    <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">
            {value}
          </p>
          
          {/* Change indicator */}
          <div className="flex items-center gap-2">
            <span className={`
              text-sm font-medium flex items-center gap-1
              ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-neutral-400'}
            `}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
               <Minus className="w-4 h-4" />}
              {change}
            </span>
            <span className="text-xs text-neutral-500">vs ontem</span>
          </div>
        </div>
        
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]}
          flex items-center justify-center shadow-lg
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Mini gráfico */}
      <div className="mt-4 h-12">
        <MiniChart data={[...]} color={color} />
      </div>
    </div>
  )
}
```

### 🎥 Camera Grid

```tsx
// CameraGrid.tsx
const CameraGrid = ({ cameras }) => (
  <div className="grid grid-cols-2 gap-4">
    {cameras.map((camera) => (
      <div key={camera.id} className="relative group">
        <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
          {/* Video Stream */}
          <div className="aspect-video bg-neutral-950">
            {camera.isOnline ? (
              <img 
                src={camera.streamUrl} 
                alt={camera.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <WifiOff className="w-12 h-12 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-500">Câmera Offline</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Overlay Info */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-medium">{camera.name}</h3>
                <p className="text-xs text-neutral-300">{camera.location}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Status */}
                <span className={`
                  px-2 py-1 text-xs rounded-full flex items-center gap-1
                  ${camera.isOnline 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${camera.isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                  {camera.isOnline ? 'Online' : 'Offline'}
                </span>
                
                {/* FPS */}
                {camera.isOnline && (
                  <span className="px-2 py-1 text-xs rounded-full bg-neutral-800/80 text-neutral-300">
                    {camera.fps} FPS
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Detection Overlay */}
          {camera.detections && (
            <div className="absolute inset-0 pointer-events-none">
              {camera.detections.map((detection) => (
                <div
                  key={detection.id}
                  className="absolute border-2 border-green-500 rounded"
                  style={{
                    left: `${detection.x}%`,
                    top: `${detection.y}%`,
                    width: `${detection.width}%`,
                    height: `${detection.height}%`
                  }}
                >
                  <span className="absolute -top-6 left-0 px-1 py-0.5 text-xs bg-green-500 text-white rounded">
                    {detection.label} {Math.round(detection.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-center gap-2">
              <button className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-white transition-colors">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-white transition-colors">
                <Camera className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-white transition-colors">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/80 text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mini Stats */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="bg-neutral-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-white">{camera.peopleCount}</p>
            <p className="text-xs text-neutral-400">Pessoas</p>
          </div>
          <div className="bg-neutral-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-green-500">{camera.customersCount}</p>
            <p className="text-xs text-neutral-400">Clientes</p>
          </div>
          <div className="bg-neutral-900/50 rounded-lg px-3 py-2 text-center">
            <p className="text-2xl font-bold text-purple-500">{camera.employeesCount}</p>
            <p className="text-xs text-neutral-400">Funcionários</p>
          </div>
        </div>
      </div>
    ))}
  </div>
)
```

## 5. ANIMAÇÕES E INTERAÇÕES

### ✨ Framer Motion Presets

```tsx
// animations.ts
export const animations = {
  // Fade In
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  // Slide Up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Scale
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 }
  },
  
  // Stagger Children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Pulse (para elementos live)
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  
  // Glow (para cards importantes)
  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(239, 68, 68, 0.1)',
        '0 0 40px rgba(239, 68, 68, 0.3)',
        '0 0 20px rgba(239, 68, 68, 0.1)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  }
}
```

## 6. TAILWIND CONFIG

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          950: '#09090b',
        }
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      
      keyframes: {
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': "url('/grid.svg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

## 7. EXEMPLO DE IMPLEMENTAÇÃO - DASHBOARD

```tsx
// app/(auth)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 mt-1">
            Bem-vindo ao ShopFlow - {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="md">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Nova Análise
          </Button>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pessoas na Loja"
          value="42"
          change="+12%"
          trend="up"
          icon={Users}
          color="red"
        />
        <MetricCard
          title="Taxa de Conversão"
          value="68%"
          change="+5%"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Tempo Médio"
          value="24min"
          change="-3min"
          trend="down"
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Funcionários Ativos"
          value="8"
          change="0"
          trend="neutral"
          icon={UserCheck}
          color="blue"
        />
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Fluxo de Pessoas"
            subtitle="Últimas 24 horas"
            actions={
              <select className="px-3 py-1.5 text-sm bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300">
                <option>Hoje</option>
                <option>7 dias</option>
                <option>30 dias</option>
              </select>
            }
          >
            <AreaChart data={flowData} />
          </ChartCard>
        </div>
        
        <div>
          <ChartCard
            title="Distribuição"
            subtitle="Por categoria"
          >
            <PieChart data={distributionData} />
          </ChartCard>
        </div>
      </div>
      
      {/* Camera Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Câmeras Ativas</h2>
          <Button variant="ghost" size="sm">
            Ver Todas
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <CameraGrid cameras={activeCameras} />
      </div>
    </div>
  )
}
```

---

## 📚 Princípios do Design System

Este Design System completo oferece:

### ✅ Visual Moderno e Escuro
- Interface elegante com tema dark
- Gradientes sutis e sombras coloridas
- Hierarquia visual clara

### ✅ Componentes Reutilizáveis
- Biblioteca completa de componentes
- Padrões consistentes de código
- Fácil manutenção e extensão

### ✅ Animações Suaves
- Interações fluidas e responsivas
- Feedback visual imediato
- Transições naturais

### ✅ Performance Otimizada
- Carregamento rápido e eficiente
- Código limpo e organizado
- Otimizado para produção

### ✅ Responsividade Total
- Funciona em todos os dispositivos
- Layout adaptativo
- Touch-friendly

### ✅ Acessibilidade
- Cores com contraste adequado
- Navegação por teclado
- Suporte a screen readers

### ✅ Escalabilidade
- Fácil de adicionar novos componentes
- Sistema de tokens flexível
- Arquitetura modular