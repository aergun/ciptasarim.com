/**
 * The signed-in account, in context.
 *
 * The server decides who is signed in; this context only mirrors that answer.
 * There is no client-side "is signed in" logic anywhere in the site beyond
 * `user === null` — an entitlement check done in a component would be
 * decoration, because every real check happens over a signed cookie on the
 * routes that serve data.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../lib/api.ts'

export interface AuthedUser {
  id: string
  email: string
  company: string
  createdAt: string
}

interface AuthState {
  user: AuthedUser | null
  /** True until `/api/auth/me` answers — gates the account routes to avoid a flash of sign-in. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthedUser>
  register: (email: string, password: string, company?: string) => Promise<AuthedUser>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthedUser | null>(null)
  const [loading, setLoading] = useState(true)

  // "Not signed in" is a normal state a client renders, not an error it handles —
  // the endpoint is 200 with `user: null` rather than 401 for exactly this.
  useEffect(() => {
    let cancelled = false
    api
      .get<{ user: AuthedUser | null }>('/auth/me')
      .then(({ user }) => {
        if (!cancelled) setUser(user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user } = await api.post<{ user: AuthedUser }>('/auth/login', { email, password })
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (email: string, password: string, company?: string) => {
    const { user } = await api.post<{ user: AuthedUser }>('/auth/register', { email, password, company })
    setUser(user)
    return user
  }, [])

  const signOut = useCallback(async () => {
    await api.post('/auth/logout')
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, signIn, register, signOut }), [user, loading, signIn, register, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth outside AuthProvider')
  return context
}