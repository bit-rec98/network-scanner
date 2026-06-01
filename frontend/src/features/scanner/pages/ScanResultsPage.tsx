import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { api } from '@/shared/utils/api'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
    ArrowLeft,
    Monitor,
    Search,
    Wifi,
    WifiOff,
    ChevronRight,
    CheckCircle,
    XCircle,
    Loader2,
    Clock,
    Filter,
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

interface Device {
    id: string
    scanId: string
    ipAddress: string
    macAddress: string | null
    hostname: string | null
    vendor: string | null
    deviceType: string | null
    isOnline: boolean
    lastSeen: string | null
    customName: string | null
    notes: string | null
}

type OnlineFilter = 'all' | 'online' | 'offline'

function ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet, 10), 0)
}

export default function ScanResultsPage() {
    const { scanId } = useParams<{ scanId: string }>()
    const [search, setSearch] = useState('')
    const [onlineFilter, setOnlineFilter] = useState<OnlineFilter>('all')

    const { data, isLoading, isError } = useQuery({
        queryKey: ['scan-devices', scanId],
        queryFn: async () => {
            const res = await api.get<{ scan: Scan; devices: Device[] }>(`/scans/${scanId}/devices`)
            return res.data
        },
        enabled: !!scanId,
        refetchInterval: (query) => {
            const status = query.state.data?.scan.status
            return status === 'running' || status === 'pending' ? 3000 : false
        },
    })

    const filteredDevices = useMemo(() => {
        if (!data?.devices) return []
        const term = search.trim().toLowerCase()
        return data.devices
            .filter((d) => {
                if (onlineFilter === 'online' && !d.isOnline) return false
                if (onlineFilter === 'offline' && d.isOnline) return false
                if (!term) return true
                return (
                    d.ipAddress.includes(term) ||
                    (d.hostname?.toLowerCase().includes(term) ?? false) ||
                    (d.macAddress?.toLowerCase().includes(term) ?? false) ||
                    (d.vendor?.toLowerCase().includes(term) ?? false) ||
                    (d.customName?.toLowerCase().includes(term) ?? false)
                )
            })
            .sort((a, b) => ipToNumber(a.ipAddress) - ipToNumber(b.ipAddress))
    }, [data?.devices, search, onlineFilter])

    const getStatusIcon = (status: Scan['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
            case 'failed':    return <XCircle className="w-4 h-4 text-red-400" />
            case 'running':   return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            default:          return <Clock className="w-4 h-4 text-slate-400" />
        }
    }

    const getStatusColor = (status: Scan['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'failed':    return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'running':   return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default:          return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const formatDuration = (ms: number | null) => {
        if (!ms) return null
        const s = Math.floor(ms / 1000)
        if (s < 60) return `${s}s`
        return `${Math.floor(s / 60)}m ${s % 60}s`
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Failed to load scan results.</p>
                <Link to="/history" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
                    Back to history
                </Link>
            </div>
        )
    }

    const { scan, devices } = data
    const onlineCount = devices.filter((d) => d.isOnline).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Link
                    to="/history"
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors flex-shrink-0 mt-0.5"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-white font-mono">{scan.networkRange}</h1>
                        <span className={clsx(
                            'flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border capitalize',
                            getStatusColor(scan.status)
                        )}>
                            {getStatusIcon(scan.status)}
                            {scan.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400 flex-wrap">
                        <span className="capitalize">{scan.scanType} scan</span>
                        <span>•</span>
                        <span>{new Date(scan.createdAt).toLocaleString()}</span>
                        {formatDuration(scan.durationMs) && (
                            <>
                                <span>•</span>
                                <span>{formatDuration(scan.durationMs)}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Devices', value: devices.length, color: 'text-white' },
                    { label: 'Online', value: onlineCount, color: 'text-green-400' },
                    { label: 'Offline', value: devices.length - onlineCount, color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                    <Card key={label}>
                        <CardContent className="py-3 text-center">
                            <div className={clsx('text-2xl font-bold', color)}>{value}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by IP, hostname, MAC, or vendor…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-colors"
                    />
                </div>

                {/* Online filter */}
                <div className="flex items-center gap-1 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
                    <Filter className="w-4 h-4 text-slate-500 ml-1.5 flex-shrink-0" />
                    {(['all', 'online', 'offline'] as OnlineFilter[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setOnlineFilter(f)}
                            className={clsx(
                                'px-3 py-1 rounded-md text-sm font-medium capitalize transition-colors',
                                onlineFilter === f
                                    ? 'bg-primary-500/20 text-primary-400'
                                    : 'text-slate-400 hover:text-slate-200'
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Device list */}
            {filteredDevices.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">
                            {devices.length === 0 ? 'No devices found' : 'No devices match your filter'}
                        </h3>
                        {devices.length === 0 && scan.status === 'running' && (
                            <p className="text-slate-500 mt-1">Scan is still in progress…</p>
                        )}
                        {devices.length > 0 && (
                            <button
                                onClick={() => { setSearch(''); setOnlineFilter('all') }}
                                className="mt-3 text-primary-400 hover:text-primary-300 text-sm font-medium"
                            >
                                Clear filters
                            </button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Monitor className="w-4 h-4" />
                                <span>
                                    {filteredDevices.length === devices.length
                                        ? `${devices.length} device${devices.length !== 1 ? 's' : ''}`
                                        : `${filteredDevices.length} of ${devices.length} devices`}
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Table header — desktop */}
                    <div className="hidden md:grid grid-cols-[2fr_2fr_2fr_2fr_1fr_auto] gap-4 px-6 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                        <span>IP Address</span>
                        <span>Hostname</span>
                        <span>MAC / Vendor</span>
                        <span>Last Seen</span>
                        <span>Status</span>
                        <span />
                    </div>

                    <div className="divide-y divide-slate-700/30">
                        {filteredDevices.map((device) => (
                            <Link
                                key={device.id}
                                to={`/devices/${device.id}`}
                                className="flex md:grid md:grid-cols-[2fr_2fr_2fr_2fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-slate-700/20 transition-colors group"
                            >
                                {/* IP */}
                                <div className="font-mono text-sm text-white min-w-0">
                                    <span>{device.customName || device.ipAddress}</span>
                                    {device.customName && (
                                        <span className="block text-xs text-slate-500 font-mono">{device.ipAddress}</span>
                                    )}
                                </div>

                                {/* Hostname */}
                                <div className="text-sm text-slate-300 truncate min-w-0 hidden md:block">
                                    {device.hostname || <span className="text-slate-600">—</span>}
                                </div>

                                {/* MAC / Vendor */}
                                <div className="min-w-0 hidden md:block">
                                    <div className="font-mono text-xs text-slate-400 truncate">
                                        {device.macAddress || <span className="text-slate-600">—</span>}
                                    </div>
                                    {device.vendor && (
                                        <div className="text-xs text-slate-500 truncate">{device.vendor}</div>
                                    )}
                                </div>

                                {/* Last seen */}
                                <div className="text-xs text-slate-500 hidden md:block">
                                    {device.lastSeen
                                        ? new Date(device.lastSeen).toLocaleString()
                                        : <span className="text-slate-600">—</span>}
                                </div>

                                {/* Online badge */}
                                <div className="flex-shrink-0">
                                    {device.isOnline ? (
                                        <span className="flex items-center gap-1 text-xs text-green-400">
                                            <Wifi className="w-3.5 h-3.5" />
                                            <span className="hidden md:inline">Online</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <WifiOff className="w-3.5 h-3.5" />
                                            <span className="hidden md:inline">Offline</span>
                                        </span>
                                    )}
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 hidden md:block" />
                            </Link>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
