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
    expect(screen.getByRole('button', { name: '일시정지' })).toBeInTheDocument()
    expect(screen.getByLabelText('시뮬레이션 속도')).toBeInTheDocument()
    expect(screen.getByText('행성을 선택하세요')).toBeInTheDocument()
  })

  it('updates the information panel when a planet is selected from the list', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: '목성 선택' }))

    expect(screen.getByRole('heading', { name: '목성' })).toBeInTheDocument()
    expect(screen.getByText('Jupiter')).toBeInTheDocument()
    expect(screen.getByText(/공전 주기/)).toBeInTheDocument()
  })
})
