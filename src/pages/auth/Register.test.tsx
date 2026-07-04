import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Register from './Register'
import userSlice from '../../store/slices/userSlice'

// Mock the authAPI
vi.mock('../../services/api', () => ({
  authAPI: {
    register: vi.fn(),
  },
}))

// Mock the useTheme hook
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    toggleTheme: vi.fn(),
  }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  }
})

describe('Register Page', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice,
        ui: () => ({
          darkMode: false,
        }),
      },
    })
    mockNavigate.mockClear()
  })

  const renderRegister = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      </Provider>
    )
  }

  it('renders register form correctly', () => {
    renderRegister()

    expect(screen.getByText('Đăng ký tài khoản mới')).toBeInTheDocument()
    expect(screen.getByLabelText('Họ và tên')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument()
    expect(screen.getByLabelText('Xác nhận mật khẩu')).toBeInTheDocument()
  })

  it('shows validation error when fields are empty', async () => {
    renderRegister()
    
    const submitButton = screen.getByText('🚀 Đăng ký ngay')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Vui lòng điền đầy đủ thông tin')).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    renderRegister()
    
    const fullNameInput = screen.getByLabelText('Họ và tên')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Mật khẩu')
    const confirmPasswordInput = screen.getByLabelText('Xác nhận mật khẩu')
    
    fireEvent.change(fullNameInput, { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } })
    
    const submitButton = screen.getByText('🚀 Đăng ký ngay')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Mật khẩu xác nhận không khớp')).toBeInTheDocument()
    })
  })

  it('shows validation error when email is invalid', async () => {
    renderRegister()
    
    const fullNameInput = screen.getByLabelText('Họ và tên')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Mật khẩu')
    const confirmPasswordInput = screen.getByLabelText('Xác nhận mật khẩu')
    
    fireEvent.change(fullNameInput, { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('🚀 Đăng ký ngay')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument()
    })
  })

  it('shows validation error when password is too short', async () => {
    renderRegister()
    
    const fullNameInput = screen.getByLabelText('Họ và tên')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Mật khẩu')
    const confirmPasswordInput = screen.getByLabelText('Xác nhận mật khẩu')
    
    fireEvent.change(fullNameInput, { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: '12345' } })
    fireEvent.change(confirmPasswordInput, { target: { value: '12345' } })
    
    const submitButton = screen.getByText('🚀 Đăng ký ngay')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeInTheDocument()
    })
  })

  it('shows validation error when terms not agreed', async () => {
    renderRegister()
    
    const fullNameInput = screen.getByLabelText('Họ và tên')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Mật khẩu')
    const confirmPasswordInput = screen.getByLabelText('Xác nhận mật khẩu')
    
    fireEvent.change(fullNameInput, { target: { value: 'Nguyễn Văn A' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    const submitButton = screen.getByText('🚀 Đăng ký ngay')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Vui lòng đồng ý với điều khoản sử dụng')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    renderRegister()
    
    const passwordInput = screen.getByLabelText('Mật khẩu') as HTMLInputElement
    const toggleButton = passwordInput.parentElement?.querySelector('button')
    
    expect(passwordInput.type).toBe('password')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')
    }
  })

  it('toggles confirm password visibility', () => {
    renderRegister()
    
    const confirmPasswordInput = screen.getByLabelText('Xác nhận mật khẩu') as HTMLInputElement
    const toggleButton = confirmPasswordInput.parentElement?.querySelector('button')
    
    expect(confirmPasswordInput.type).toBe('password')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(confirmPasswordInput.type).toBe('text')
    }
  })
})
