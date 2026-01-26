import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/utils/api'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Radar, AlertCircle, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

type ScanType = 'quick' | 'deep' | 'port'

const scanTypes = [
    {
        type: 'quick' as ScanType,
        label: 'Quick Scan',
        description: 'Fast host discovery using ping',
        duration: '~30 seconds',
    },
    {
        type: 'deep' as ScanType,
        label: 'Deep Scan',
        description: 'Host discovery with port scanning',
        duration: '~2-5 minutes',
    },
    {
        type: 'port' as ScanType,
        label: 'Port Scan Only',
        description: 'Comprehensive port analysis',
        duration: '~5-10 minutes',
    },
]

export default function ScannerPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [networkRange, setNetworkRange] = useState('192.168.1.0/24')
    const [scanType, setScanType] = useState<ScanType>('quick')
    const [error, setError] = useState('')

    const startScan = useMutation({
        mutationFn: async () => {
            const res = await api.post('/scans', {
                networkRange,
                scanType,
            })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scan-stats'] })
            navigate(`/history`)
        },
        onError: (err: any) => {
            setError(err.response?.data?.error?.message || 'Failed to start scan')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Basic validation
        const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
        if (!cidrRegex.test(networkRange)) {
            setError('Invalid network range format. Use CIDR notation (e.g., 192.168.1.0/24)')
            return
        }

        startScan.mutate()
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Start Network Scan</h1>
                <p className="text-slate-400">Discover devices on your local network</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Network Range */}
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-white">Network Range</h2>
                        <p className="text-sm text-slate-400">Enter the network range to scan in CIDR notation</p>
                    </CardHeader>
                    <CardContent>
                        <Input
                            id="networkRange"
                            placeholder="192.168.1.0/24"
                            value={networkRange}
                            onChange={(e) => setNetworkRange(e.target.value)}
                            className="font-mono"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Examples: 192.168.1.0/24, 10.0.0.0/24, 172.16.0.0/16
                        </p>
                    </CardContent>
                </Card>

                {/* Scan Type Selection */}
                <Card className="mb-6">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-white">Scan Type</h2>
                        <p className="text-sm text-slate-400">Choose the depth of your scan</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {scanTypes.map((type) => (
                                <button
                                    key={type.type}
                                    type="button"
                                    onClick={() => setScanType(type.type)}
                                    className={clsx(
                                        'p-4 rounded-lg border text-left transition-all',
                                        scanType === type.type
                                            ? 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500/30'
                                            : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">{type.label}</span>
                                        {scanType === type.type && (
                                            <CheckCircle className="w-5 h-5 text-primary-400" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 mb-2">{type.description}</p>
                                    <p className="text-xs text-slate-500">{type.duration}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <Card>
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-300">
                                Ready to scan <span className="font-mono text-primary-400">{networkRange}</span>
                            </p>
                            <p className="text-sm text-slate-500">
                                Scan type: {scanTypes.find(t => t.type === scanType)?.label}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            size="lg"
                            isLoading={startScan.isPending}
                        >
                            <Radar className="w-5 h-5" />
                            Start Scan
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
