import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ReportAlertPage } from './ReportAlertPage'
import * as alertApi from '../api/alerts'
import * as authApi from '../api/auth'
import { MemoryRouter } from 'react-router'

const mockNavigate = vi.fn()

vi.mock('../api/alerts', () => ({
  createAlert: vi.fn(),
}))

vi.mock('../api/auth', () => ({
  getDashboardRoute: vi.fn(),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual<any>('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ReportAlertPage', () => {
  const mockedAlertApi = alertApi as unknown as { createAlert: ReturnType<typeof vi.fn> }
  const mockedAuthApi = authApi as unknown as { getDashboardRoute: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedAuthApi.getDashboardRoute.mockResolvedValue('/dashboard')
  })

  test('renders report alert form fields and submit button', () => {
    render(
      <MemoryRouter>
        <ReportAlertPage />
      </MemoryRouter>
    )

    expect(screen.getByText(/alert title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit alert/i })).toBeInTheDocument()
  })

  test('shows error when location is missing', async () => {
    render(
      <MemoryRouter>
        <ReportAlertPage />
      </MemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: /submit alert/i }))

    expect(await screen.findByText(/please provide a location for the alert/i)).toBeInTheDocument()
  })

  test('submits alert successfully when required fields are complete', async () => {
    mockedAlertApi.createAlert.mockResolvedValue({ message: 'OK', id: 'alert-1' })

    render(
      <MemoryRouter>
        <ReportAlertPage />
      </MemoryRouter>
    )

    await userEvent.type(screen.getByLabelText(/title/i), 'Broken light in hallway')
    await userEvent.type(screen.getByLabelText(/location/i), 'Main Building, Room 101')
    await userEvent.type(screen.getByLabelText(/description/i), 'Light bulb shattered and sparks observed.')
    await userEvent.click(screen.getByRole('button', { name: /submit alert/i }))

    await waitFor(() => {
      expect(mockedAlertApi.createAlert).toHaveBeenCalled()
    })

    expect(await screen.findByText(/your alert has been submitted/i)).toBeInTheDocument()
  })

  test('allows choosing a file attachment', async () => {
    render(
      <MemoryRouter>
        <ReportAlertPage />
      </MemoryRouter>
    )

    const fileInput = screen.getByLabelText(/choose files/i) as HTMLInputElement
    const file = new File(['hello'], 'photo.png', { type: 'image/png' })

    await userEvent.upload(fileInput, file)

    expect(fileInput.files?.[0]).toStrictEqual(file)
  })
})
