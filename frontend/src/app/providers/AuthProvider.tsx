import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode
} from 'react'
import { api } from '@/shared/utils/api'

interface User {
    id: string
    email: string
    role: 'admin' | 'viewer'
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            fetchUser()
        } else {
            setIsLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me')
            setUser(response.data.user)
        } catch {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        } finally {
            setIsLoading(false)
        }
    }

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password })
        const { user, accessToken, refreshToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        setUser(user)
    }, [])

    const register = useCallback(async (email: string, password: string) => {
        const response = await api.post('/auth/register', { email, password })
        const { user, accessToken, refreshToken } = response.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        setUser(user)
    }, [])

    const logout = useCallback(() => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            api.post('/auth/logout', { refreshToken }).catch(() => { })
        }

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
