import { ButtonHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed'

        const variants = {
            primary: 'bg-primary-600 text-white hover:bg-primary-500 focus:ring-primary-500 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40',
            secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600 focus:ring-slate-500',
            outline: 'border border-slate-600 text-slate-300 hover:bg-slate-800 focus:ring-slate-500',
            ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
            danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-lg shadow-red-500/25',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2',
            lg: 'px-6 py-3 text-lg',
        }

        return (
            <button
                ref={ref}
                className={clsx(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
