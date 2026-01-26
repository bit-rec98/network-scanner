import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import {
    LayoutDashboard,
    Radar,
    History,
    LogOut,
    Network,
    Menu
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/scan', icon: Radar, label: 'Scan Network' },
    { to: '/history', icon: History, label: 'Scan History' },
]

export function MainLayout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-900 network-grid">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    'fixed top-0 left-0 z-50 h-full w-64 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50',
                    'transform transition-transform duration-300 ease-in-out lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
                        <div className="p-2 rounded-lg bg-primary-500/20">
                            <Network className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Network Scanner</h1>
                            <p className="text-xs text-slate-400">v1.0.0</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                                        isActive
                                            ? 'bg-primary-500/20 text-primary-400 shadow-lg shadow-primary-500/10'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700/50'
                                    )
                                }
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* User section */}
                    <div className="p-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-400">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-100 truncate">
                                    {user?.email}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile header */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-700/50"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-primary-400" />
                        <span className="font-semibold text-white">Network Scanner</span>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
