import { describe, expect, it } from 'vitest'
import { PLANETS } from './planets'

describe('PLANETS', () => {
  it('contains the eight major planets in solar order', () => {
    expect(PLANETS.map((planet) => planet.id)).toEqual([
      'mercury',
      'venus',
      'earth',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ])
  })

  it('provides complete display and orbital data for every planet', () => {
    for (const planet of PLANETS) {
      expect(planet.nameKo).toBeTruthy()
      expect(planet.nameEn).toBeTruthy()
      expect(planet.diameterKm).toBeGreaterThan(0)
      expect(planet.distanceAu).toBeGreaterThan(0)
      expect(planet.orbitPeriodDays).toBeGreaterThan(0)
      expect(Math.abs(planet.rotationPeriodHours)).toBeGreaterThan(0)
      expect(planet.axialTiltDeg).toBeGreaterThanOrEqual(0)
      expect(planet.axialTiltDeg).toBeLessThanOrEqual(180)
      expect(planet.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(planet.descriptionKo.length).toBeGreaterThan(20)
    }
  })
})
