import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/utils/api'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import {
    ArrowLeft,
    Monitor,
    Wifi,
    Server,
    Globe,
    HardDrive
} from 'lucide-react'
import clsx from 'clsx'

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
}

interface Port {
    portNumber: number
    protocol: 'tcp' | 'udp'
    serviceName: string | null
    state: 'open' | 'closed' | 'filtered'
}

export default function DeviceDetailsPage() {
    const { id } = useParams<{ id: string }>()

    const { data: deviceData, isLoading } = useQuery({
        queryKey: ['device', id],
        queryFn: async () => {
            const res = await api.get<{ device: Device }>(`/devices/${id}`)
            return res.data.device
        },
        enabled: !!id,
    })

    const { data: portsData } = useQuery({
        queryKey: ['device-ports', id],
        queryFn: async () => {
            const res = await api.get<{ ports: Port[] }>(`/devices/${id}/ports`)
            return res.data.ports
        },
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!deviceData) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Device not found</p>
                <Link to="/history" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">
                    Back to history
                </Link>
            </div>
        )
    }

    const backTo = deviceData.scanId
        ? `/scans/${deviceData.scanId}/devices`
        : '/history'

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to={backTo}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {deviceData.customName || deviceData.hostname || deviceData.ipAddress}
                    </h1>
                    <p className="text-slate-400 font-mono">{deviceData.ipAddress}</p>
                </div>
                <div className={clsx(
                    'ml-auto px-3 py-1 rounded-full text-sm font-medium',
                    deviceData.isOnline
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                )}>
                    {deviceData.isOnline ? 'Online' : 'Offline'}
                </div>
            </div>

            {/* Device Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-primary-400" />
                            <h2 className="text-lg font-semibold text-white">Device Information</h2>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Globe className="w-4 h-4" />
                                <span>IP Address</span>
                            </div>
                            <span className="font-mono text-white">{deviceData.ipAddress}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Wifi className="w-4 h-4" />
                                <span>MAC Address</span>
                            </div>
                            <span className="font-mono text-white">{deviceData.macAddress || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Server className="w-4 h-4" />
                                <span>Hostname</span>
                            </div>
                            <span className="text-white">{deviceData.hostname || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400">
                                <HardDrive className="w-4 h-4" />
                                <span>Vendor</span>
                            </div>
                            <span className="text-white">{deviceData.vendor || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-400">Last Seen</span>
                            <span className="text-white">
                                {deviceData.lastSeen
                                    ? new Date(deviceData.lastSeen).toLocaleString()
                                    : 'N/A'
                                }
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Open Ports */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Server className="w-5 h-5 text-cyber-400" />
                            <h2 className="text-lg font-semibold text-white">Open Ports</h2>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {portsData && portsData.length > 0 ? (
                            <div className="space-y-2">
                                {portsData.map((port) => (
                                    <div
                                        key={`${port.portNumber}-${port.protocol}`}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-700/30"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-primary-400">{port.portNumber}</span>
                                            <span className="text-xs text-slate-500 uppercase">{port.protocol}</span>
                                        </div>
                                        <span className="text-sm text-slate-300">{port.serviceName || 'Unknown'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No open ports detected</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
