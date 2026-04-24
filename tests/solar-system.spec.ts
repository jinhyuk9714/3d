import zlib from 'node:zlib'
import { expect, test, type Page } from '@playwright/test'

test('renders an interactive solar system canvas', async ({ page }) => {
  await delayFirstTexture(page)
  await page.goto('/3d/')

  await expect(page.getByTestId('scene-loading-overlay')).toBeVisible()
  await expect(page.getByText('3D 장면 준비 중')).toBeVisible()
  await waitForSceneReady(page)
  await expect(page.getByRole('heading', { name: '태양계 관측실' })).toBeVisible()
  await expect(page.getByText('공개 데모')).toBeVisible()
  await expect(page.getByRole('button', { name: '도움말 열기' })).toBeVisible()
  await expect(page.getByRole('link', { name: '텍스처: NASA/JPL/LRO' })).toBeVisible()
  await expect(page.getByTestId('solar-canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: '제어 패널 접기' })).toBeVisible()
  await expect(page.getByText('1일/초')).toBeVisible()
  await expect(page.getByRole('button', { name: '태양 선택' })).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeVisible()
  await expect(page.getByRole('button', { name: '달 선택' })).toBeVisible()

  const canvas = page.locator('canvas')

  await expect(canvas).toBeVisible()
  await page.waitForTimeout(500)
  await page.waitForFunction(() => {
    const canvasElement = document.querySelector('canvas')
    const canvasBox = canvasElement?.getBoundingClientRect()

    return (
      canvasElement &&
      canvasBox &&
      canvasElement.width >= 300 &&
      canvasElement.height >= 300 &&
      canvasBox.width >= 300 &&
      canvasBox.height >= 300
    )
  })

  const canvasBox = await canvas.evaluate((element) => {
    const rect = element.getBoundingClientRect()

    return { width: rect.width, height: rect.height }
  })

  expect(canvasBox.width).toBeGreaterThanOrEqual(300)
  expect(canvasBox.height).toBeGreaterThanOrEqual(300)

  const canvasPixels = samplePng(await canvas.screenshot())

  expect(canvasPixels.litSamples).toBeGreaterThan(8)
  expect(canvasPixels.maxLuma).toBeGreaterThan(60)
})

test('collapses and restores the left control panel', async ({ page }) => {
  await page.goto('/3d/')
  await waitForSceneReady(page)

  await page.getByRole('button', { name: '제어 패널 접기' }).click()

  await expect(page.getByRole('button', { name: '제어 패널 열기' })).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeHidden()
  await expect(page.getByRole('heading', { name: '대표 위성' })).toBeHidden()

  await page.getByRole('button', { name: '제어 패널 열기' }).click()

  await expect(page.getByRole('button', { name: '제어 패널 접기' })).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '대표 위성' })).toBeVisible()
})

test('keeps the desktop control panel tidy without clipping shortcuts', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop layout budget')

  await page.goto('/3d/')
  await waitForSceneReady(page)

  const panelBox = await page.locator('.control-panel').boundingBox()
  const lastMoonBox = await page
    .getByRole('button', { name: '트리톤 선택' })
    .boundingBox()

  expect(panelBox).not.toBeNull()
  expect(lastMoonBox).not.toBeNull()
  expect(lastMoonBox!.y + lastMoonBox!.height).toBeLessThanOrEqual(
    panelBox!.y + panelBox!.height - 12,
  )
})

test('selects a planet from the controls on mobile and desktop', async ({ page }) => {
  await page.goto('/3d/')
  await waitForSceneReady(page)

  await page.getByRole('button', { name: '토성 선택' }).click()

  await expect(page.getByRole('heading', { name: '토성' })).toBeVisible()
  await expect(page.getByText('Saturn')).toBeVisible()
})

test('selects the Sun from the shortcut list', async ({ page }) => {
  await page.goto('/3d/')
  await waitForSceneReady(page)

  await page.getByRole('button', { name: '태양 선택' }).click()

  await expect(
    page.getByRole('heading', { exact: true, name: '태양' }),
  ).toBeVisible()
  await expect(page.getByText('Sun')).toBeVisible()
})

test('selects representative moons from the shortcut list', async ({ page }) => {
  await page.goto('/3d/')
  await waitForSceneReady(page)

  await page.getByRole('button', { name: '타이탄 선택' }).click()

  await expect(page.getByRole('heading', { name: '타이탄' })).toBeVisible()
  await expect(page.getByText('Titan')).toBeVisible()
  await expect(
    page.locator('.info-panel dd').filter({ hasText: /^토성$/ }),
  ).toBeVisible()

  await page.getByRole('button', { name: '트리톤 선택' }).click()

  await expect(page.getByRole('heading', { name: '트리톤' })).toBeVisible()
  await expect(page.getByText('Triton')).toBeVisible()
  await expect(
    page.locator('.info-panel dd').filter({ hasText: /^해왕성$/ }),
  ).toBeVisible()
})

test('keeps wheel zoom instead of snapping the camera back', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile-chrome', 'wheel is desktop pointer behavior')

  for (const deltaY of [-1_600, 1_600]) {
    await page.goto('/3d/')
    await waitForSceneReady(page)
    await page.getByRole('button', { name: '태양 선택' }).click()

    const canvas = page.locator('canvas')
    await expect(canvas).toBeVisible()
    await page.waitForTimeout(1_200)

    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()

    const before = await readCameraDistance(page)
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.wheel(0, deltaY)
    await page.waitForTimeout(400)
    const afterWheel = await readCameraDistance(page)
    await page.waitForTimeout(1_600)
    const afterSettled = await readCameraDistance(page)

    expect(Math.abs(afterWheel - before)).toBeGreaterThan(0.25)
    expect(Math.abs(afterSettled - afterWheel)).toBeLessThanOrEqual(
      Math.max(1.5, afterWheel * 0.08),
    )
  }
})

test('keeps the mobile loading status clear of main UI panels', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await delayFirstTexture(page)
  await page.goto('/3d/')

  const overlay = page.getByTestId('scene-loading-overlay')
  await expect(overlay).toBeVisible()

  const overlayBox = await overlay.boundingBox()
  const controlBox = await page.locator('.control-panel').boundingBox()
  const infoBox = await page.locator('.info-panel').boundingBox()

  expect(boxesOverlap(overlayBox, controlBox)).toBe(false)
  expect(boxesOverlap(overlayBox, infoBox)).toBe(false)

  await waitForSceneReady(page)
})

test('keeps mobile playback responsive while the simulation is running', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'mobile performance budget')

  await page.goto('/3d/')
  await waitForSceneReady(page)
  await page.waitForTimeout(1_000)

  const playbackSample = await sampleAnimationFrames(page, 4_000)

  expect(playbackSample.fps).toBeGreaterThan(45)
  expect(playbackSample.frameMsP95).toBeLessThan(45)
})

async function delayFirstTexture(page: Page) {
  let delayed = false

  await page.route('**/textures/**/*.webp', async (route) => {
    if (!delayed) {
      delayed = true
      await new Promise((resolve) => setTimeout(resolve, 350))
    }

    await route.continue()
  })
}

async function waitForSceneReady(page: Page) {
  await expect(page.getByTestId('scene-error-overlay')).toBeHidden({
    timeout: 10_000,
  })
  await expect(page.getByTestId('scene-loading-overlay')).toBeHidden({
    timeout: 15_000,
  })
}

async function readCameraDistance(page: Page) {
  const rawDistance = await page
    .locator('canvas')
    .getAttribute('data-camera-distance')
  expect(rawDistance).not.toBeNull()

  const distance = Number(rawDistance)

  expect(Number.isFinite(distance)).toBe(true)

  return distance
}

function boxesOverlap(
  first: { x: number; y: number; width: number; height: number } | null,
  second: { x: number; y: number; width: number; height: number } | null,
) {
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()

  const a = first!
  const b = second!

  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

async function sampleAnimationFrames(page: Page, durationMs: number) {
  return page.evaluate(async (sampleDurationMs) => {
    const samples: number[] = []
    let lastTimestamp = 0
    const startedAt = performance.now()

    await new Promise<void>((resolve) => {
      function sampleFrame(timestamp: number) {
        if (lastTimestamp > 0) {
          samples.push(timestamp - lastTimestamp)
        }

        lastTimestamp = timestamp

        if (timestamp - startedAt < sampleDurationMs) {
          requestAnimationFrame(sampleFrame)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(sampleFrame)
    })

    samples.sort((a, b) => a - b)

    const durationSeconds = (performance.now() - startedAt) / 1_000
    const fps = samples.length / durationSeconds
    const percentileIndex = Math.min(
      samples.length - 1,
      Math.floor(samples.length * 0.95),
    )

    return {
      fps,
      frameMsP95: samples[percentileIndex] ?? 0,
    }
  }, durationMs)
}

function samplePng(buffer: Buffer) {
  const png = parsePng(buffer)
  let litSamples = 0
  let maxLuma = 0
  const sampleCount = 16

  for (let y = 0; y < sampleCount; y += 1) {
    for (let x = 0; x < sampleCount; x += 1) {
      const px = Math.floor((x + 0.5) * png.width / sampleCount)
      const py = Math.floor((y + 0.5) * png.height / sampleCount)
      const index = (py * png.width + px) * png.bytesPerPixel
      const luma =
        png.pixels[index] + png.pixels[index + 1] + png.pixels[index + 2]

      if (luma > 24) {
        litSamples += 1
      }

      maxLuma = Math.max(maxLuma, luma)
    }
  }

  return { litSamples, maxLuma }
}

function parsePng(buffer: Buffer) {
  let offset = 8
  let width = 0
  let height = 0
  let colorType = 0
  let bitDepth = 0
  const chunks: Buffer[] = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.toString('ascii', offset + 4, offset + 8)
    const start = offset + 8
    const end = start + length

    if (type === 'IHDR') {
      width = buffer.readUInt32BE(start)
      height = buffer.readUInt32BE(start + 4)
      bitDepth = buffer[start + 8]
      colorType = buffer[start + 9]
    } else if (type === 'IDAT') {
      chunks.push(buffer.subarray(start, end))
    } else if (type === 'IEND') {
      break
    }

    offset = end + 4
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error(`Unsupported PNG format: ${bitDepth}/${colorType}`)
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3
  const rowBytes = width * bytesPerPixel
  const inflated = zlib.inflateSync(Buffer.concat(chunks))
  const pixels = Buffer.alloc(rowBytes * height)

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[y * (rowBytes + 1)]
    const source = inflated.subarray(
      y * (rowBytes + 1) + 1,
      (y + 1) * (rowBytes + 1),
    )
    const target = pixels.subarray(y * rowBytes, (y + 1) * rowBytes)
    const previous = y > 0 ? pixels.subarray((y - 1) * rowBytes, y * rowBytes) : null

    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= bytesPerPixel ? target[x - bytesPerPixel] : 0
      const up = previous ? previous[x] : 0
      const upLeft = previous && x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0
      let predictor = 0

      if (filter === 1) {
        predictor = left
      } else if (filter === 2) {
        predictor = up
      } else if (filter === 3) {
        predictor = Math.floor((left + up) / 2)
      } else if (filter === 4) {
        predictor = paeth(left, up, upLeft)
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter: ${filter}`)
      }

      target[x] = (source[x] + predictor) & 255
    }
  }

  return { width, height, bytesPerPixel, pixels }
}

function paeth(left: number, up: number, upLeft: number) {
  const estimate = left + up - upLeft
  const leftDistance = Math.abs(estimate - left)
  const upDistance = Math.abs(estimate - up)
  const upLeftDistance = Math.abs(estimate - upLeft)

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left
  }

  return upDistance <= upLeftDistance ? up : upLeft
}
