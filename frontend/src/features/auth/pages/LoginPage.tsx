import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Network, LogIn } from 'lucide-react'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 network-grid">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 rounded-2xl bg-primary-500/20 mb-4 animate-glow">
                        <Network className="w-12 h-12 text-primary-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Network Scanner</h1>
                    <p className="text-slate-400 mt-2">Sign in to your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
                        <p className="text-sm text-slate-400">Enter your credentials to continue</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                id="email"
                                type="email"
                                label="Email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                id="password"
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-400">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Demo credentials hint */}
                <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <p className="text-xs text-slate-500 text-center">
                        Demo: admin@networkscanner.local / admin123
                    </p>
                </div>
            </div>
        </div>
    )
}
