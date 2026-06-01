import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './providers/AuthProvider'
import { MainLayout } from '@/shared/components/layout/MainLayout'

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react'

const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/features/scanner/pages/DashboardPage'))
const ScannerPage = lazy(() => import('@/features/scanner/pages/ScannerPage'))
const ScanHistoryPage = lazy(() => import('@/features/scanner/pages/ScanHistoryPage'))
const ScanResultsPage = lazy(() => import('@/features/scanner/pages/ScanResultsPage'))
const DeviceDetailsPage = lazy(() => import('@/features/devices/pages/DeviceDetailsPage'))

// Loading fallback
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <PageLoader />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <PageLoader />
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export function Router() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterPage />
                        </PublicRoute>
                    }
                />

                {/* Protected routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/scan" element={<ScannerPage />} />
                    <Route path="/history" element={<ScanHistoryPage />} />
                    <Route path="/scans/:scanId/devices" element={<ScanResultsPage />} />
                    <Route path="/devices/:id" element={<DeviceDetailsPage />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    )
}
