import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={id}
                        className="block text-sm font-medium text-slate-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={clsx(
                        'w-full px-4 py-2.5 bg-slate-800 border rounded-lg text-slate-100 placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                        'transition-all duration-200',
                        error ? 'border-red-500' : 'border-slate-700',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-400">{error}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
