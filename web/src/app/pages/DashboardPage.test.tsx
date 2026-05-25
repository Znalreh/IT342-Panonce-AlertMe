import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DashboardPage } from './DashboardPage'
import * as alertApi from '../api/alerts'
import * as authApi from '../api/auth'
import { MemoryRouter } from 'react-router'

vi.mock('../api/alerts', () => ({
  fetchAlerts: vi.fn(),
}))

vi.mock('../api/auth', () => ({
  getCurrentUser: vi.fn(),
}))

describe('DashboardPage', () => {
  const mockedAlertApi = alertApi as unknown as { fetchAlerts: ReturnType<typeof vi.fn> }
  const mockedAuthApi = authApi as unknown as { getCurrentUser: ReturnType<typeof vi.fn> }

  const alerts = [
    {
      id: '1',
      category: 'Infrastructure',
      priority: 'HIGH',
      status: 'RECEIVED',
      description: 'Broken window in Parking Lot A',
      locationText: 'Parking Lot A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      category: 'Security',
      priority: 'MEDIUM',
      status: 'INVESTIGATING',
      description: 'Suspicious activity near science lab',
      locationText: 'Science Building',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAlertApi.fetchAlerts.mockResolvedValue(alerts)
    mockedAuthApi.getCurrentUser.mockResolvedValue({ email: 'student@university.edu', role: 'STUDENT' })
  })

  test('renders dashboard statistics and recent alerts', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/total alerts/i)).toBeInTheDocument()
      expect(screen.getByText(/active/i)).toBeInTheDocument()
      expect(screen.getByText(/resolved/i)).toBeInTheDocument()
      expect(screen.getByText(/high priority/i)).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /broken window in parking lot a/i })).toBeInTheDocument()
      expect(screen.getByText(/suspicious activity near science lab/i)).toBeInTheDocument()
    })
  })

  test('filters alerts by search input', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/broken window in parking lot a/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search alerts/i)
    await userEvent.type(searchInput, 'science')

    await waitFor(() => {
      expect(screen.getByText(/suspicious activity near science lab/i)).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /broken window in parking lot a/i })).not.toBeInTheDocument()
    })
  })

  test('shows error message when fetchAlerts fails', async () => {
    mockedAlertApi.fetchAlerts.mockRejectedValue(new Error('Unable to load alerts.'))

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    )

    expect(await screen.findByText(/unable to load alerts/i)).toBeInTheDocument()
  })
})
