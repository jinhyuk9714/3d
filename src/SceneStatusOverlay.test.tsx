import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SceneStatusOverlay } from './SceneStatusOverlay'

describe('SceneStatusOverlay', () => {
  it('shows the current 3D scene loading progress', () => {
    render(<SceneStatusOverlay status="loading" progress={42} />)

    expect(screen.getByText('3D 장면 준비 중')).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '3D 장면 로딩률' })).toHaveAttribute(
      'aria-valuenow',
      '42',
    )
  })

  it('shows a WebGL fallback with a refresh action', async () => {
    const user = userEvent.setup()
    const handleReload = vi.fn()

    render(<SceneStatusOverlay status="error" onReload={handleReload} />)

    expect(screen.getByText('브라우저/WebGL을 확인해 주세요')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '새로고침' }))

    expect(handleReload).toHaveBeenCalledTimes(1)
  })
})
