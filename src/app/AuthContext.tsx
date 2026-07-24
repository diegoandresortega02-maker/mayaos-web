import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { checkIsPlatformAdmin, getMyClinicUser } from '../lib/auth'
import type { ClinicUser } from '../lib/types'

interface AuthState {
  session: Session | null
  clinicUser: ClinicUser | null
  isPlatformAdmin: boolean
  loading: boolean
  refreshClinicUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [clinicUser, setClinicUser] = useState<ClinicUser | null>(null)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  async function refreshClinicUser() {
    const cu = await getMyClinicUser()
    setClinicUser(cu)
    const admin = await checkIsPlatformAdmin()
    setIsPlatformAdmin(admin)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      let activeSession = data.session
      if (activeSession) {
        try {
          await refreshClinicUser()
        } catch (err) {
          // Session token may have expired while the tab was idle; try one refresh
          // before giving up and treating the user as signed out.
          console.error('Failed to load clinic user on session bootstrap, retrying refresh', err)
          const { data: refreshed } = await supabase.auth.refreshSession()
          if (refreshed.session) {
            activeSession = refreshed.session
            try {
              await refreshClinicUser()
            } catch (err2) {
              console.error('Clinic user load failed after session refresh', err2)
              activeSession = null
            }
          } else {
            activeSession = null
          }
        }
      }
      setSession(activeSession)
      setLoading(false)
    })

    // The initial fire of onAuthStateChange (event 'INITIAL_SESSION') races the
    // getSession() bootstrap above and would double-fetch the clinic user - skip it
    // here since the bootstrap already covers it (with its own refresh-retry logic).
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'INITIAL_SESSION') return
      setSession(newSession)
      if (newSession) {
        try {
          await refreshClinicUser()
        } catch (err) {
          console.error('Failed to load clinic user after auth state change', err)
          setClinicUser(null)
          setIsPlatformAdmin(false)
        }
      } else {
        setClinicUser(null)
        setIsPlatformAdmin(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, clinicUser, isPlatformAdmin, loading, refreshClinicUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
