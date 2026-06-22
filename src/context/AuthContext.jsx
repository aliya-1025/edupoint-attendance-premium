import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, getToken, setToken, getUser, setUser, clearAuth } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    api.me()
      .then((d) => {
        const u = { userId: d.user_id, email: d.email, role: d.role, fullName: d.full_name, teacherId: d.teacher_id }
        setUserState(u); setUser(u)
      })
      .catch(() => { clearAuth(); setUserState(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password, rememberMe = true) => {
    const d = await api.login(email, password, rememberMe)
    setToken(d.access_token)
    const u = { userId: d.user_id, email, role: d.role, fullName: d.full_name, teacherId: d.teacher_id }
    setUserState(u); setUser(u)
    return u
  }, [])

  const logout = useCallback(() => { clearAuth(); setUserState(null) }, [])

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
