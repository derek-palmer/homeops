import { useEffect, useState, useRef, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EntriesLineChart } from '../components/charts/EntriesLineChart'
import { MetaTags } from '../components/MetaTags'
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

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

  // Determine meta tags based on authentication state
  const metaTitle = session
    ? 'HomeOps Dashboard - Track Your Home Improvements'
    : 'Sign in to HomeOps - Track Home Improvements'
  const metaDescription = session
    ? 'View and manage your home improvements, fixes, repairs, and todos. Track spending trends and stay organized.'
    : 'Sign in to HomeOps to track your home improvements, fixes, repairs, and todos in one place.'

  return (
    <>
      <MetaTags title={metaTitle} description={metaDescription} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              HomeOps
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Track home improvements, fixes, repairs, and todos in one place
            </p>
          </div>

          {/* Auth Section - Top Right */}
          {session && (
            <div className="relative flex-shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {session.user.email?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-700">
                    {session.user.email?.split('@')[0] ?? 'User'}
                  </p>
                </div>
                <svg
                  className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 min-w-[14rem] max-w-[20rem] rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="p-2">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-900" title={session.user.email ?? 'User'}>
                        {session.user.email ?? 'User'}
                      </p>
                      <p className="text-xs text-slate-500">Signed in</p>
                    </div>
                    <div className="my-1 h-px bg-slate-200" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        // TODO: Implement edit profile functionality
                        alert('Edit profile functionality coming soon')
                      }}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Edit Profile
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleSignOut()
                      }}
                      disabled={isAuthLoading}
                      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-2">
                        {isAuthLoading ? (
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        )}
                        {isAuthLoading ? 'Signing out…' : 'Sign out'}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        {!session ? (
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
              <div className="mb-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg
                      className="h-8 w-8 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Sign in to HomeOps</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Enter your credentials to access your home improvement management system
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSignIn}>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700"
                    htmlFor="email-login"
                  >
                    Email
                  </label>
                  <input
                    id="email-login"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700"
                    htmlFor="password-login"
                  >
                    Password
                  </label>
                  <input
                    id="password-login"
                    type="password"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-0"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in…
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
                {authError && (
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-800">{authError}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
              <p className="mt-1 text-sm text-slate-600">
                View your home improvement entries and spending trends
              </p>
            </div>

            {isEntriesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg
                    className="h-8 w-8 animate-spin text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="mt-4 text-sm text-slate-600">Loading entries…</p>
                </div>
              ) : dataError ? (
                <div className="rounded-lg bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <svg
                      className="h-5 w-5 text-red-600 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Error loading data</p>
                      <p className="mt-1 text-sm text-red-700">{dataError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EntriesLineChart data={entries} />
              )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

