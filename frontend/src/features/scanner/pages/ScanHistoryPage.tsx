import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '@/shared/utils/api'
import { Card, CardContent } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
    Clock,
    Monitor,
    CheckCircle,
    XCircle,
    Loader2,
    ChevronRight
} from 'lucide-react'
import clsx from 'clsx'

interface Scan {
    id: string
    networkRange: string
    scanType: 'quick' | 'deep' | 'port'
    status: 'pending' | 'running' | 'completed' | 'failed'
    devicesFound: number
    createdAt: string
    completedAt: string | null
    durationMs: number | null
}

export default function ScanHistoryPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['scans'],
        queryFn: async () => {
            const res = await api.get<{ scans: Scan[]; pagination: any }>('/scans?limit=50')
            return res.data.scans
        },
        refetchInterval: 5000, // Poll for updates every 5 seconds
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        )
    }

    const getStatusIcon = (status: Scan['status']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-400" />
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-400" />
            case 'running':
                return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            default:
                return <Clock className="w-5 h-5 text-slate-400" />
        }
    }

    const getStatusColor = (status: Scan['status']) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'failed':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'running':
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const formatDuration = (ms: number | null) => {
        if (!ms) return '-'
        const seconds = Math.floor(ms / 1000)
        if (seconds < 60) return `${seconds}s`
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}m ${remainingSeconds}s`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Scan History</h1>
                <p className="text-slate-400">View your past network scans</p>
            </div>

            {/* Scan List */}
            {data?.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">No scans yet</h3>
                        <p className="text-slate-500 mt-1">Start your first network scan to see results here</p>
                        <Link
                            to="/scan"
                            className="inline-block mt-4 text-primary-400 hover:text-primary-300 font-medium"
                        >
                            Start a scan →
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data?.map((scan) => (
                        <Link key={scan.id} to={`/scans/${scan.id}/devices`} className="block">
                            <Card hover>
                                <CardContent className="flex items-center gap-4">
                                    {/* Status Icon */}
                                    <div className="flex-shrink-0">
                                        {getStatusIcon(scan.status)}
                                    </div>

                                    {/* Scan Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-white">{scan.networkRange}</span>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-xs font-medium rounded-full border capitalize',
                                                getStatusColor(scan.status)
                                            )}>
                                                {scan.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                                            <span className="capitalize">{scan.scanType} scan</span>
                                            <span>•</span>
                                            <span>{new Date(scan.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-white">
                                                <Monitor className="w-4 h-4 text-cyber-400" />
                                                <span className="font-semibold">{scan.devicesFound}</span>
                                            </div>
                                            <span className="text-slate-500 text-xs">devices</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="text-white font-semibold">{formatDuration(scan.durationMs)}</span>
                                            <span className="text-slate-500 text-xs block">duration</span>
                                        </div>
                                    </div>

                                    {/* View Details */}
                                    <ChevronRight className="w-5 h-5 text-slate-500" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
