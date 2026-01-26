import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Network, UserPlus } from 'lucide-react'

export default function RegisterPage() {
    const { register } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            await register(email, password)
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Registration failed')
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
                    <p className="text-slate-400 mt-2">Create your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold text-white">Get Started</h2>
                        <p className="text-sm text-slate-400">Create an account to start scanning</p>
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
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Input
                                id="confirmPassword"
                                type="password"
                                label="Confirm Password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isLoading}
                            >
                                <UserPlus className="w-4 h-4" />
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-400">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
