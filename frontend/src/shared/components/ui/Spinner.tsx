import clsx from 'clsx'

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    }

    return (
        <div
            className={clsx(
                'border-primary-500 border-t-transparent rounded-full animate-spin',
                sizes[size],
                className
            )}
        />
    )
}
