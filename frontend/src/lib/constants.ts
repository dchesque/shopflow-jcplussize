import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  Eye,
  UserPlus,
  Calendar,
  PieChart,
  Activity,
  Zap,
  Monitor,
  Cog,
  Target,
  GitCompare,
  Shield,
  Key,
  Store,
  Globe,
  Bell
} from 'lucide-react'

export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'cameras',
    label: 'Câmeras',
    href: '/cameras',
    icon: Camera,
    badge: '4',
    children: [
      { id: 'monitor', label: 'Monitoramento', href: '/cameras', icon: Monitor },
      { id: 'settings', label: 'Configurações', href: '/cameras/settings', icon: Cog },
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    children: [
      { id: 'realtime', label: 'Tempo Real', href: '/analytics/realtime', icon: Activity },
      { id: 'behavioral', label: 'Comportamental', href: '/analytics/behavioral', icon: TrendingUp },
      { id: 'comparisons', label: 'Comparações', href: '/analytics/comparisons', icon: GitCompare, badge: 'NEW' },
      { id: 'segmentation', label: 'Segmentação', href: '/analytics/segmentation', icon: PieChart },
      { id: 'predictions', label: 'Predições', href: '/analytics/predictions', icon: Zap },
    ]
  },
  {
    id: 'employees',
    label: 'Funcionários',
    href: '/employees',
    icon: Users,
    children: [
      { id: 'list', label: 'Lista', href: '/employees', icon: Users },
      { id: 'register', label: 'Cadastro', href: '/employees/register', icon: UserPlus },
      { id: 'attendance', label: 'Presença', href: '/employees/attendance', icon: Calendar },
    ]
  },
  {
    id: 'reports',
    label: 'Relatórios',
    href: '/reports',
    icon: FileText,
  },
  {
    id: 'settings',
    label: 'Configurações',
    href: '/settings',
    icon: Settings,
    children: [
      { id: 'privacy', label: 'Privacidade', href: '/settings/privacy', icon: Shield },
      { id: 'users', label: 'Usuários', href: '/settings/users', icon: Users },
      { id: 'security', label: 'Segurança', href: '/settings/security', icon: Key },
      { id: 'store', label: 'Loja', href: '/settings/store', icon: Store },
      { id: 'integrations', label: 'Integrações', href: '/settings/integrations', icon: Globe },
      { id: 'notifications', label: 'Notificações', href: '/settings/notifications', icon: Bell },
    ]
  },
]

export const COLORS = {
  primary: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  secondary: {
    50: '#faf5ff',
    500: '#a855f7',
    600: '#9333ea',
  },
  neutral: {
    50: '#fafafa',
    400: '#a1a1aa',
    500: '#71717a',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  }
}

export const API_ENDPOINTS = {
  CAMERAS: '/api/cameras',
  EMPLOYEES: '/api/employees',
  ANALYTICS: '/api/analytics',
  REPORTS: '/api/reports',
} as const