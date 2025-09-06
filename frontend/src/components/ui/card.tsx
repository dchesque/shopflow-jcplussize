import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-2xl p-6 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 border border-neutral-800',
        stat: 'bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700/50',
        chart: 'bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/50',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10',
      },
      glow: {
        none: '',
        red: 'shadow-xl shadow-red-500/10 hover:shadow-red-500/20',
        purple: 'shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20',
        blue: 'shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20',
        green: 'shadow-xl shadow-green-500/10 hover:shadow-green-500/20',
        orange: 'shadow-xl shadow-orange-500/10 hover:shadow-orange-500/20',
      },
      interactive: {
        true: 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      glow: 'none',
      interactive: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, glow, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, glow, interactive, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-white', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-neutral-400', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }