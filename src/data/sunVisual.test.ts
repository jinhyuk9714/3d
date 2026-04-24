import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { SUN_VISUAL } from './sunVisual'

describe('SUN_VISUAL', () => {
  it('points the Sun at a local NASA WebP texture with source credit', () => {
    const texturePath = path.join(process.cwd(), 'public', SUN_VISUAL.texturePath)

    expect(SUN_VISUAL.texturePath).toBe('textures/sun/sun.webp')
    expect(existsSync(texturePath)).toBe(true)
    expect(statSync(texturePath).size).toBeGreaterThan(1_024)
    expect(SUN_VISUAL.textureCredit.length).toBeGreaterThan(6)
    expect(SUN_VISUAL.textureSourceUrl).toMatch(/^https:\/\/.+/)
    expect(SUN_VISUAL.material.roughness).toBeGreaterThanOrEqual(0)
    expect(SUN_VISUAL.material.roughness).toBeLessThanOrEqual(1)
    expect(SUN_VISUAL.material.emissiveIntensity).toBeGreaterThanOrEqual(0.6)
    expect(SUN_VISUAL.material.emissiveIntensity).toBeLessThanOrEqual(2)
  })
})
