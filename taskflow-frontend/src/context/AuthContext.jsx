import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { authApi } from '../api/auth.js'
import { ApiError } from '../api/http.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await authApi.me()
        if (!cancelled) setUser(me)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) authApi.logout()
      } finally {
        if (!cancelled) setInitializing(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials)
    const user = await authApi.me()
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (payload) => {
    await authApi.register(payload)
    const user = await authApi.me()
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}