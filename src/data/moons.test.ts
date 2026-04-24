import { describe, expect, it } from 'vitest'
import { PLANETS } from './planets'
import { MOONS } from './moons'

describe('MOONS', () => {
  it('contains the eight selected representative moons', () => {
    expect(MOONS.map((moon) => moon.id)).toEqual([
      'moon',
      'io',
      'europa',
      'ganymede',
      'callisto',
      'titan',
      'enceladus',
      'triton',
    ])
  })

  it('provides complete display and orbital data for every moon', () => {
    const planetIds = new Set(PLANETS.map((planet) => planet.id))

    for (const moon of MOONS) {
      expect(planetIds.has(moon.parentPlanetId)).toBe(true)
      expect(moon.nameKo).toBeTruthy()
      expect(moon.nameEn).toBeTruthy()
      expect(moon.diameterKm).toBeGreaterThan(0)
      expect(moon.orbitRadiusKm).toBeGreaterThan(0)
      expect(moon.orbitPeriodDays).toBeGreaterThan(0)
      expect([-1, 1]).toContain(moon.orbitDirection)
      expect(moon.color).toMatch(/^#[0-9a-f]{6}$/i)
      expect(moon.descriptionKo.length).toBeGreaterThan(20)
    }
  })

  it('marks Triton as a retrograde moon', () => {
    expect(MOONS.find((moon) => moon.id === 'triton')?.orbitDirection).toBe(-1)
  })
})
