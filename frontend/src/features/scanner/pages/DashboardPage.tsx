import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/utils/api'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
    Wifi,
    Monitor,
    Clock,
    TrendingUp,
    Radar,
    AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'

interface ScanStats {
    totalScans: number
    completedScans: number
    totalDevicesFound: number
    lastScanDate: string | null
}

interface ScannerCapabilities {
    osDetection: boolean
    serviceDetection: boolean
    stealthScan: boolean
    arpScan: boolean
    macAddressResolution: boolean
    nmapVersion: string | null
}

export default function DashboardPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['scan-stats'],
        queryFn: async () => {
            const res = await api.get<{ stats: ScanStats }>('/scans/stats')
            return res.data.stats
        },
    })

    const { data: capabilities } = useQuery({
        queryKey: ['scanner-capabilities'],
        queryFn: async () => {
            const res = await api.get<{ capabilities: ScannerCapabilities }>('/scanner/capabilities')
            return res.data.capabilities
        },
    })

    if (statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total Scans',
            value: stats?.totalScans || 0,
            icon: Radar,
            color: 'text-primary-400',
            bgColor: 'bg-primary-500/20',
        },
        {
            label: 'Devices Found',
            value: stats?.totalDevicesFound || 0,
            icon: Monitor,
            color: 'text-cyber-400',
            bgColor: 'bg-cyber-500/20',
        },
        {
            label: 'Completed Scans',
            value: stats?.completedScans || 0,
            icon: TrendingUp,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20',
        },
        {
            label: 'Last Scan',
            value: stats?.lastScanDate
                ? new Date(stats.lastScanDate).toLocaleDateString()
                : 'Never',
            icon: Clock,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/20',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Monitor your network scanning activity</p>
                </div>
                <Link to="/scan">
                    <Button>
                        <Radar className="w-4 h-4" />
                        Start New Scan
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Card key={stat.label} hover>
                        <CardContent className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Scanner Capabilities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-primary-400" />
                        <h2 className="text-lg font-semibold text-white">Scanner Capabilities</h2>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {capabilities && Object.entries(capabilities)
                            .filter(([key]) => key !== 'nmapVersion')
                            .map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-2"
                                >
                                    <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-slate-600'}`} />
                                    <span className="text-sm text-slate-300 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </div>
                            ))
                        }
                    </div>
                    {capabilities?.nmapVersion && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <p className="text-sm text-slate-400">
                                Nmap Version: <span className="text-primary-400 font-mono">{capabilities.nmapVersion}</span>
                            </p>
                        </div>
                    )}
                    {!capabilities?.nmapVersion && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-400">
                                Nmap not detected. Install nmap for enhanced scanning capabilities.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link to="/scan" className="block">
                            <div className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-primary-500/50 transition-all cursor-pointer">
                                <Radar className="w-8 h-8 text-primary-400 mb-3" />
                                <h3 className="font-medium text-white">Quick Scan</h3>
                                <p className="text-sm text-slate-400 mt-1">Scan your local network</p>
                            </div>
                        </Link>
                        <Link to="/history" className="block">
                            <div className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-primary-500/50 transition-all cursor-pointer">
                                <Clock className="w-8 h-8 text-cyber-400 mb-3" />
                                <h3 className="font-medium text-white">View History</h3>
                                <p className="text-sm text-slate-400 mt-1">Browse past scans</p>
                            </div>
                        </Link>
                        <Link to="/scan" className="block">
                            <div className="p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 hover:border-primary-500/50 transition-all cursor-pointer">
                                <Monitor className="w-8 h-8 text-green-400 mb-3" />
                                <h3 className="font-medium text-white">Deep Scan</h3>
                                <p className="text-sm text-slate-400 mt-1">Scan with port detection</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
