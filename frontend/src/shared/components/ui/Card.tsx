import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
    return (
        <div
            className={clsx(
                'bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl shadow-black/20',
                hover && 'hover:border-slate-600 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300',
                className
            )}
        >
            {children}
        </div>
    )
}

interface CardHeaderProps {
    children: ReactNode
    className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div className={clsx('px-6 py-4 border-b border-slate-700/50', className)}>
            {children}
        </div>
    )
}

interface CardContentProps {
    children: ReactNode
    className?: string
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <div className={clsx('px-6 py-4', className)}>
            {children}
        </div>
    )
}

interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <div className={clsx('px-6 py-4 border-t border-slate-700/50', className)}>
            {children}
        </div>
    )
}
