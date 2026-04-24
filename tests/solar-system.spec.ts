import { expect, test } from '@playwright/test'

test('renders an interactive solar system canvas', async ({ page }) => {
  await page.goto('/3d/')

  await expect(page.getByRole('heading', { name: '태양계 관측실' })).toBeVisible()
  await expect(page.getByText('공개 데모')).toBeVisible()
  await expect(page.getByRole('button', { name: '도움말 열기' })).toBeVisible()
  await expect(page.getByTestId('solar-canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeVisible()

  const canvasHost = page.getByTestId('solar-canvas')
  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')
    const hostElement = document.querySelector('[data-testid="solar-canvas"]')
    const canvasBox = canvasElement?.getBoundingClientRect()
    const hostBox = hostElement?.getBoundingClientRect()

    return (
      canvasBox &&
      hostBox &&
      canvasBox.width >= 300 &&
      canvasBox.height >= 300 &&
      hostBox.width >= 300 &&
      hostBox.height >= 300
    )
  })

  const hostBox = await canvasHost.boundingBox()
  expect(hostBox?.width).toBeGreaterThanOrEqual(300)
  expect(hostBox?.height).toBeGreaterThanOrEqual(300)

  const hasRenderedPixels = await page.evaluate(() => {
    const canvasElement = document.querySelector('canvas')
    const context =
      canvasElement?.getContext('webgl2', { preserveDrawingBuffer: true }) ??
      canvasElement?.getContext('webgl', { preserveDrawingBuffer: true })

    if (!canvasElement || !context) {
      return false
    }

    const pixels = new Uint8Array(4)
    const samplePoints = [
      [canvasElement.width / 2, canvasElement.height / 2],
      [canvasElement.width * 0.3, canvasElement.height * 0.45],
      [canvasElement.width * 0.7, canvasElement.height * 0.55],
    ]

    return samplePoints.some(([x, y]) => {
      context.readPixels(
        Math.floor(x),
        Math.floor(y),
        1,
        1,
        context.RGBA,
        context.UNSIGNED_BYTE,
        pixels,
      )

      return pixels[0] + pixels[1] + pixels[2] > 0
    })
  })

  expect(hasRenderedPixels).toBe(true)
})

test('selects a planet from the controls on mobile and desktop', async ({ page }) => {
  await page.goto('/3d/')

  await page.getByRole('button', { name: '토성 선택' }).click()

  await expect(page.getByRole('heading', { name: '토성' })).toBeVisible()
  await expect(page.getByText('Saturn')).toBeVisible()
})
