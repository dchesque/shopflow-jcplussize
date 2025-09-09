import { render, screen } from '@testing-library/react'
import { TrendingUp, Users } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: '1,234',
    change: '+12%',
    trend: 'up' as const,
    icon: Users,
    color: 'blue' as const,
  }

  it('renders metric card with all props', () => {
    render(<MetricCard {...defaultProps} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('renders with different trend colors', () => {
    const { rerender } = render(
      <MetricCard {...defaultProps} trend="up" change="+12%" />
    )
    expect(screen.getByText('+12%')).toHaveClass('text-green-600')

    rerender(<MetricCard {...defaultProps} trend="down" change="-5%" />)
    expect(screen.getByText('-5%')).toHaveClass('text-red-600')

    rerender(<MetricCard {...defaultProps} trend="neutral" change="0%" />)
    expect(screen.getByText('0%')).toHaveClass('text-gray-600')
  })

  it('renders with loading state', () => {
    render(<MetricCard {...defaultProps} isLoading />)
    
    expect(screen.getByTestId('metric-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
  })

  it('renders with different color variants', () => {
    const { rerender, container } = render(
      <MetricCard {...defaultProps} color="red" />
    )
    expect(container.firstChild).toHaveClass('border-red-200')

    rerender(<MetricCard {...defaultProps} color="green" />)
    expect(container.firstChild).toHaveClass('border-green-200')

    rerender(<MetricCard {...defaultProps} color="purple" />)
    expect(container.firstChild).toHaveClass('border-purple-200')
  })

  it('renders trend icon correctly', () => {
    const { rerender } = render(
      <MetricCard {...defaultProps} trend="up" />
    )
    expect(screen.getByTestId('trend-up-icon')).toBeInTheDocument()

    rerender(<MetricCard {...defaultProps} trend="down" />)
    expect(screen.getByTestId('trend-down-icon')).toBeInTheDocument()

    rerender(<MetricCard {...defaultProps} trend="neutral" />)
    expect(screen.getByTestId('trend-neutral-icon')).toBeInTheDocument()
  })

  it('handles missing optional props', () => {
    render(
      <MetricCard
        title="Simple Card"
        value="100"
        icon={Users}
        color="blue"
      />
    )
    
    expect(screen.getByText('Simple Card')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByTestId('trend-up-icon')).not.toBeInTheDocument()
  })
})