import { expect, test } from '@playwright/test'

test('renders an interactive solar system canvas', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: '태양계 관측실' })).toBeVisible()
  await expect(page.getByTestId('solar-canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeVisible()

  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  const box = await canvas.boundingBox()
  expect(box?.width).toBeGreaterThan(300)
  expect(box?.height).toBeGreaterThan(300)
})

test('selects a planet from the controls on mobile and desktop', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: '토성 선택' }).click()

  await expect(page.getByRole('heading', { name: '토성' })).toBeVisible()
  await expect(page.getByText('Saturn')).toBeVisible()
})
