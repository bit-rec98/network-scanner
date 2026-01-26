import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { Router } from './Router'

export function App() {
    return (
        <BrowserRouter>
            <QueryProvider>
                <AuthProvider>
                    <Router />
                </AuthProvider>
            </QueryProvider>
        </BrowserRouter>
    )
}
