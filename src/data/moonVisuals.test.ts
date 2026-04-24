import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { MOONS } from './moons'
import { MOON_VISUALS } from './moonVisuals'

describe('MOON_VISUALS', () => {
  it('defines local WebP render metadata for every representative moon', () => {
    expect(Object.keys(MOON_VISUALS).sort()).toEqual(
      MOONS.map((moon) => moon.id).sort(),
    )

    for (const moon of MOONS) {
      const visual = MOON_VISUALS[moon.id]
      const texturePath = path.join(process.cwd(), 'public', visual.texturePath)

      expect(visual.texturePath).toBe(`textures/moons/${moon.id}.webp`)
      expect(existsSync(texturePath)).toBe(true)
      expect(statSync(texturePath).size).toBeGreaterThan(1_024)
      expect(visual.textureCredit.length).toBeGreaterThan(6)
      expect(visual.textureSourceUrl).toMatch(/^https:\/\/.+/)
      expect(visual.material.roughness).toBeGreaterThanOrEqual(0)
      expect(visual.material.roughness).toBeLessThanOrEqual(1)
      expect(visual.material.emissiveIntensity).toBeGreaterThanOrEqual(0)
      expect(visual.material.emissiveIntensity).toBeLessThanOrEqual(0.35)
    }
  })
})
