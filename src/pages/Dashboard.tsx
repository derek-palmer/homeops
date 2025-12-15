import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EntriesLineChart } from '../components/charts/EntriesLineChart'
import { getCurrentSession, onAuthStateChange, signInWithPassword, signOut } from '../lib/auth'
import { listEntries } from '../services/entries'
import { HomeOpsEntry } from '../types/entry'

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [entries, setEntries] = useState<HomeOpsEntry[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isEntriesLoading, setIsEntriesLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      setIsAuthLoading(true)
      try {
        const existing = await getCurrentSession()
        if (active) setSession(existing)
      } catch (error) {
        if (active) setAuthError(error instanceof Error ? error.message : 'Failed to load session')
      } finally {
        if (active) setIsAuthLoading(false)
      }
    }

    loadSession()
    const unsubscribe = onAuthStateChange(nextSession => {
      if (!active) return
      setSession(nextSession)
      if (!nextSession) {
        setEntries([])
        setDataError(null)
        // Clear credentials when session is lost (e.g., token expiry, sign-out elsewhere)
        setEmail('')
        setPassword('')
      }
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    let active = true
    setIsEntriesLoading(true)
    setDataError(null)

    listEntries()
      .then(data => {
        if (active) setEntries(data)
      })
      .catch(error => {
        if (!active) return
        const message = error instanceof Error ? error.message : 'Failed to load entries'
        setDataError(message)
        setEntries([])
      })
      .finally(() => {
        if (active) setIsEntriesLoading(false)
      })

    return () => {
      active = false
    }
  }, [session])

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsAuthLoading(true)

    try {
      await signInWithPassword(email, password)
      // Clear credentials after successful sign-in for security
      setEmail('')
      setPassword('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-in failed')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    setAuthError(null)
    try {
      await signOut()
      setEntries([])
      // Clear credentials on sign-out for security
      setEmail('')
      setPassword('')
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-out failed')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-md space-y-3 rounded-lg border border-slate-200 bg-white/60 p-4 shadow-sm">
        <h2 className="text-lg font-semibold">Authentication</h2>
        {session ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              Signed in as {session.user.email ?? session.user.id}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSignIn}>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={isAuthLoading}
            >
              {isAuthLoading ? 'Signing in…' : 'Sign in'}
            </button>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            {!authError && !session && (
              <p className="text-xs text-slate-500">Use the Supabase user you created in Auth.</p>
            )}
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h1 className="text-xl font-semibold">HomeOps Dashboard</h1>
        {!session ? (
          <p className="text-sm text-slate-600">Sign in to view your entries.</p>
        ) : isEntriesLoading ? (
          <p className="text-sm text-slate-600">Loading entries…</p>
        ) : dataError ? (
          <p className="text-sm text-red-600">{dataError}</p>
        ) : (
          <EntriesLineChart data={entries} />
        )}
      </div>
    </div>
  )
}

