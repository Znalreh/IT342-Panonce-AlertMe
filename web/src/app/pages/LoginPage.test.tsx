import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginPage } from './LoginPage'
import * as authApi from '../api/auth'
import { MemoryRouter } from 'react-router'

const mockNavigate = vi.fn()

vi.mock('../api/auth', () => ({
  loginUser: vi.fn(),
  getAuthToken: vi.fn(),
  saveAuthToken: vi.fn(),
  getDashboardRoute: vi.fn(),
  getGoogleAuthUrl: vi.fn(),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual<any>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  const mockedAuthApi = authApi as unknown as {
    loginUser: ReturnType<typeof vi.fn>
    getAuthToken: ReturnType<typeof vi.fn>
    saveAuthToken: ReturnType<typeof vi.fn>
    getDashboardRoute: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuthApi.getAuthToken.mockReturnValue(null)
    mockedAuthApi.getDashboardRoute.mockResolvedValue('/dashboard')
  })

  test('renders login form with email, password and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument()
  })

  test('validates email format', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    await userEvent.type(emailInput, 'invalid-email')

    expect(emailInput.validity.typeMismatch).toBe(true)
  })

  test('validates required password input', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    expect(passwordInput.required).toBe(true)
  })

  test('submits valid credentials and navigates to dashboard', async () => {
    mockedAuthApi.loginUser.mockResolvedValue({ accessToken: 'mock_token' })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/email address/i), 'student@university.edu')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: /^Sign In$/i }))

    await waitFor(() => {
      expect(mockedAuthApi.loginUser).toHaveBeenCalledWith({
        email: 'student@university.edu',
        password: 'Password123!',
      })
    })

    await waitFor(() => {
      expect(mockedAuthApi.saveAuthToken).toHaveBeenCalledWith('mock_token')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  test('shows error message when loginUser rejects', async () => {
    mockedAuthApi.loginUser.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/email address/i), 'student@university.edu')
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await userEvent.click(screen.getByRole('button', { name: /^Sign In$/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
