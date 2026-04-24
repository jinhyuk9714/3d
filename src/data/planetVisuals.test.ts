import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { PLANETS } from './planets'
import { PLANET_VISUALS } from './planetVisuals'

describe('PLANET_VISUALS', () => {
  it('defines render metadata for every planet', () => {
    expect(Object.keys(PLANET_VISUALS).sort()).toEqual(
      PLANETS.map((planet) => planet.id).sort(),
    )
  })

  it('points every planet at a local WebP texture with source credit', () => {
    for (const planet of PLANETS) {
      const visual = PLANET_VISUALS[planet.id]
      const texturePath = path.join(process.cwd(), 'public', visual.texturePath)

      expect(visual.texturePath).toBe(`textures/planets/${planet.id}.webp`)
      expect(existsSync(texturePath)).toBe(true)
      expect(statSync(texturePath).size).toBeGreaterThan(400)
      expect(visual.textureCredit.length).toBeGreaterThan(6)
      expect(visual.textureSourceUrl).toMatch(/^https:\/\/.+/)
      expect(visual.material.roughness).toBeGreaterThanOrEqual(0)
      expect(visual.material.roughness).toBeLessThanOrEqual(1)
      expect(visual.material.emissiveIntensity).toBeGreaterThanOrEqual(0)
      expect(visual.material.emissiveIntensity).toBeLessThanOrEqual(0.4)
    }
  })

  it('keeps atmosphere settings subtle when present', () => {
    for (const visual of Object.values(PLANET_VISUALS)) {
      if (!visual.atmosphere) {
        continue
      }

      expect(visual.atmosphere.opacity).toBeGreaterThan(0)
      expect(visual.atmosphere.opacity).toBeLessThanOrEqual(0.34)
      expect(visual.atmosphere.scale).toBeGreaterThan(1)
      expect(visual.atmosphere.scale).toBeLessThanOrEqual(1.18)
    }
  })
})
