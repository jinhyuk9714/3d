import zlib from 'node:zlib'
import { expect, test } from '@playwright/test'

test('renders an interactive solar system canvas', async ({ page }) => {
  await page.goto('/3d/')

  await expect(page.getByRole('heading', { name: '태양계 관측실' })).toBeVisible()
  await expect(page.getByText('공개 데모')).toBeVisible()
  await expect(page.getByRole('button', { name: '도움말 열기' })).toBeVisible()
  await expect(page.getByRole('link', { name: '텍스처: NASA/JPL' })).toBeVisible()
  await expect(page.getByTestId('solar-canvas')).toBeVisible()
  await expect(page.getByRole('button', { name: '목성 선택' })).toBeVisible()

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

test('selects a planet from the controls on mobile and desktop', async ({ page }) => {
  await page.goto('/3d/')

  await page.getByRole('button', { name: '토성 선택' }).click()

  await expect(page.getByRole('heading', { name: '토성' })).toBeVisible()
  await expect(page.getByText('Saturn')).toBeVisible()
})

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
