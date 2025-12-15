import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Dashboard from '../src/pages/Dashboard'
import * as auth from '../src/lib/auth'
import type { Session } from '@supabase/supabase-js'

// Mock auth module
vi.mock('../src/lib/auth', () => ({
  getCurrentSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
}))

// Mock entries service
vi.mock('../src/services/entries', () => ({
  listEntries: vi.fn().mockResolvedValue([]),
}))

const mockSession: Session = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
  },
} as Session

describe('Dashboard Login', () => {
  const mockUnsubscribe = vi.fn()
  let mockAuthStateCallback: ((session: Session | null) => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthStateCallback = null

    // Setup default mocks
    vi.mocked(auth.getCurrentSession).mockResolvedValue(null)
    vi.mocked(auth.onAuthStateChange).mockImplementation(callback => {
      mockAuthStateCallback = callback
      return mockUnsubscribe
    })
  })

  describe('Login Form Rendering', () => {
    it('renders login form when user is not authenticated', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByText('Sign in to HomeOps')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      })
    })

    it('renders login form with correct placeholders', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
      })
    })

    it('does not show error message initially', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Input Handling', () => {
    it('updates email field when user types', async () => {
      const user = userEvent.setup()
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password field when user types', async () => {
      const user = userEvent.setup()
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('Password')
      await user.type(passwordInput, 'password123')

      expect(passwordInput).toHaveValue('password123')
    })
  })

  describe('Successful Login', () => {
    it('calls signInWithPassword with correct credentials on form submit', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.signInWithPassword).mockResolvedValue(mockSession)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(auth.signInWithPassword).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('clears email and password fields after successful login', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.signInWithPassword).mockResolvedValue(mockSession)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Trigger auth state change to simulate successful login
      if (mockAuthStateCallback) {
        await act(async () => {
          mockAuthStateCallback(mockSession)
        })
      }

      await waitFor(() => {
        expect(emailInput).toHaveValue('')
        expect(passwordInput).toHaveValue('')
      })
    })

    it('shows loading state during sign-in', async () => {
      const user = userEvent.setup()
      // Create a promise that we can control
      let resolveSignIn: (value: Session) => void
      const signInPromise = new Promise<Session>(resolve => {
        resolveSignIn = resolve
      })
      vi.mocked(auth.signInWithPassword).mockReturnValue(signInPromise)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Check loading state
      await waitFor(() => {
        expect(screen.getByText('Signing in…')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()
      })

      // Resolve the promise
      await act(async () => {
        resolveSignIn!(mockSession)
      })
      await waitFor(() => {
        expect(screen.queryByText('Signing in…')).not.toBeInTheDocument()
      })
    })
  })

  describe('Login Error Handling', () => {
    it('displays error message when sign-in fails', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid login credentials'
      vi.mocked(auth.signInWithPassword).mockRejectedValue(new Error(errorMessage))

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('displays generic error message for non-Error rejections', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.signInWithPassword).mockRejectedValue('String error')

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Sign-in failed')).toBeInTheDocument()
      })
    })

    it('clears previous error when submitting form again', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.signInWithPassword)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockSession)

      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // First attempt - fails
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second attempt - succeeds
      await user.clear(emailInput)
      await user.clear(passwordInput)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'correctpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('requires email field to be filled', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        const emailInput = screen.getByLabelText('Email')
        expect(emailInput).toBeRequired()
      })
    })

    it('requires password field to be filled', async () => {
      render(<Dashboard />)

      await waitFor(() => {
        const passwordInput = screen.getByLabelText('Password')
        expect(passwordInput).toBeRequired()
      })
    })

    it('prevents form submission when email is empty', async () => {
      const user = userEvent.setup()
      render(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
      })

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Form should not submit (HTML5 validation prevents it)
      expect(auth.signInWithPassword).not.toHaveBeenCalled()
    })
  })

  describe('Sign Out', () => {
    it('calls signOut when sign out button is clicked', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.getCurrentSession).mockResolvedValue(mockSession)
      vi.mocked(auth.signOut).mockResolvedValue()

      render(<Dashboard />)

      // Wait for session to load and dashboard to render
      await waitFor(() => {
        expect(screen.queryByText('Sign in to HomeOps')).not.toBeInTheDocument()
      })

      // Find and click user menu button (accessible name is "T test" - avatar letter + username)
      const userMenuButton = screen.getByRole('button', { name: /T test/i })
      await user.click(userMenuButton)

      // Find and click sign out button
      await waitFor(() => {
        const signOutButton = screen.getByRole('button', { name: /sign out/i })
        expect(signOutButton).toBeInTheDocument()
      })

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)

      await waitFor(() => {
        expect(auth.signOut).toHaveBeenCalled()
      })
    })

    it('clears entries and credentials on sign out', async () => {
      const user = userEvent.setup()
      vi.mocked(auth.getCurrentSession).mockResolvedValue(mockSession)
      vi.mocked(auth.signOut).mockResolvedValue()

      render(<Dashboard />)

      // Wait for session to load
      await waitFor(() => {
        expect(screen.queryByText('Sign in to HomeOps')).not.toBeInTheDocument()
      })

      // Sign out
      const userMenuButton = screen.getByRole('button', { name: /T test/i })
      await user.click(userMenuButton)

      await waitFor(() => {
        const signOutButton = screen.getByRole('button', { name: /sign out/i })
        expect(signOutButton).toBeInTheDocument()
      })

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)

      // Trigger auth state change to simulate sign out
      if (mockAuthStateCallback) {
        await act(async () => {
          mockAuthStateCallback(null)
        })
      }

      // Should show login form again
      await waitFor(() => {
        expect(screen.getByText('Sign in to HomeOps')).toBeInTheDocument()
      })
    })
  })
})

