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
    expect(screen.getByText('1일/초')).toBeInTheDocument()
    expect(screen.getByLabelText('시뮬레이션 속도')).toHaveValue('1')
    expect(screen.getByLabelText('시뮬레이션 속도')).toHaveAttribute('min', '1')
    expect(screen.getByLabelText('시뮬레이션 속도')).toHaveAttribute('step', '1')
    expect(screen.getByRole('button', { name: '태양 선택' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '대표 위성' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '달 선택' })).toBeInTheDocument()
    expect(screen.getByText('천체를 선택하세요')).toBeInTheDocument()
    expect(screen.getByText('텍스처: NASA/JPL')).toBeInTheDocument()
  })

  it('opens a concise usage guide for public demo visitors', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '도움말 열기' }))

    expect(screen.getByText('마우스로 회전하고 휠로 확대하세요.')).toBeInTheDocument()
    expect(screen.getByText('행성, 위성 또는 목록을 선택하면 카메라가 이동합니다.')).toBeInTheDocument()
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

  it('focuses the Sun from the shortcut list', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '태양 선택' }))

    expect(screen.getByRole('heading', { name: '태양' })).toBeInTheDocument()
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText(/태양계의 중심/)).toBeInTheDocument()
  })

  it('updates the information panel when a moon is selected from the list', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '유로파 선택' }))

    expect(screen.getByRole('heading', { name: '유로파' })).toBeInTheDocument()
    expect(screen.getByText('Europa')).toBeInTheDocument()
    expect(screen.getByText('부모 행성')).toBeInTheDocument()
    expect(screen.getAllByText('목성').length).toBeGreaterThan(0)
    expect(screen.getByText(/얼음 표면 아래/)).toBeInTheDocument()
  })
})
