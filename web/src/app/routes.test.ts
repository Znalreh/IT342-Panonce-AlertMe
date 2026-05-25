import { describe, expect, it, vi, beforeEach } from 'vitest'
import { requireAuth, requireStudentDashboard, requireAdmin, redirectAuthenticatedUser } from './routes'
import * as authApi from './api/auth'

vi.mock('./api/auth', () => ({
  getAuthToken: vi.fn(),
  getCurrentUser: vi.fn(),
  saveAuthToken: vi.fn(),
}))

describe('route loaders', () => {
  const mockedAuthApi = authApi as unknown as {
    getAuthToken: ReturnType<typeof vi.fn>
    getCurrentUser: ReturnType<typeof vi.fn>
    saveAuthToken: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when no auth token exists', () => {
    mockedAuthApi.getAuthToken.mockReturnValue(null)

    try {
      requireAuth()
    } catch (error) {
      expect(error).toBeInstanceOf(Response)
      expect((error as Response).headers.get('Location')).toBe('/login')
    }
  })

  it('returns null when auth token exists', () => {
    mockedAuthApi.getAuthToken.mockReturnValue('token')
    expect(requireAuth()).toBeNull()
  })

  it('allows student dashboard access for STUDENT role', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue('token')
    mockedAuthApi.getCurrentUser.mockResolvedValue({ role: 'STUDENT' })

    await expect(requireStudentDashboard()).resolves.toBeNull()
  })

  it('denies student dashboard access for non-STUDENT role', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue('token')
    mockedAuthApi.getCurrentUser.mockResolvedValue({ role: 'ADMIN' })

    await expect(requireStudentDashboard()).rejects.toBeInstanceOf(Response)
  })

  it('redirects to login in student dashboard loader when no token', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue(null)

    await expect(requireStudentDashboard()).rejects.toBeInstanceOf(Response)
  })

  it('allows admin access for ADMIN role', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue('token')
    mockedAuthApi.getCurrentUser.mockResolvedValue({ role: 'ADMIN' })

    await expect(requireAdmin()).resolves.toBeNull()
  })

  it('denies admin access for STUDENT role', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue('token')
    mockedAuthApi.getCurrentUser.mockResolvedValue({ role: 'STUDENT' })

    await expect(requireAdmin()).rejects.toBeInstanceOf(Response)
  })

  it('redirects authenticated user to dashboard when accessToken is present and role is STUDENT', async () => {
    mockedAuthApi.getCurrentUser.mockResolvedValue({ role: 'STUDENT' })
    const request = new Request('http://localhost/login?accessToken=token123')

    const response = await redirectAuthenticatedUser({ request })
    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Location')).toBe('/dashboard')
    expect(mockedAuthApi.saveAuthToken).toHaveBeenCalledWith('token123')
  })

  it('redirects to login when accessToken is invalid', async () => {
    mockedAuthApi.getCurrentUser.mockRejectedValue(new Error('Invalid token'))
    const request = new Request('http://localhost/login?accessToken=invalid')

    const response = await redirectAuthenticatedUser({ request })
    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Location')).toBe('/login')
  })

  it('returns null when no accessToken is present and no auth token exists', async () => {
    mockedAuthApi.getAuthToken.mockReturnValue(null)
    const request = new Request('http://localhost/login')

    await expect(redirectAuthenticatedUser({ request })).resolves.toBeNull()
  })
})
