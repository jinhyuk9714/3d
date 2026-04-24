import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the simulator controls and Korean orientation copy', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '태양계 관측실' }),
    ).toBeInTheDocument()
    expect(screen.getByText('공개 데모')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '도움말 열기' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '일시정지' })).toBeInTheDocument()
    expect(screen.getByLabelText('시뮬레이션 속도')).toBeInTheDocument()
    expect(screen.getByText('행성을 선택하세요')).toBeInTheDocument()
    expect(screen.getByText('텍스처: NASA/JPL')).toBeInTheDocument()
  })

  it('opens a concise usage guide for public demo visitors', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '도움말 열기' }))

    expect(screen.getByText('마우스로 회전하고 휠로 확대하세요.')).toBeInTheDocument()
    expect(screen.getByText('행성 또는 목록을 선택하면 카메라가 이동합니다.')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '도움말 닫기' }),
    ).toBeInTheDocument()
  })

  it('updates the information panel when a planet is selected from the list', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '목성 선택' }))

    expect(screen.getByRole('heading', { name: '목성' })).toBeInTheDocument()
    expect(screen.getByText('Jupiter')).toBeInTheDocument()
    expect(screen.getByText(/공전 주기/)).toBeInTheDocument()
  })
})
