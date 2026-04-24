import { describe, expect, it } from 'vitest'
import {
  getOrbitalAngle,
  getPlanetDisplayRadius,
  getPlanetPosition,
  getScaledOrbitRadius,
} from './orbitMath'

describe('orbit math', () => {
  it('compresses orbital distance while keeping values positive and ordered', () => {
    const mercury = getScaledOrbitRadius(0.39)
    const earth = getScaledOrbitRadius(1)
    const neptune = getScaledOrbitRadius(30.07)

    expect(mercury).toBeGreaterThan(0)
    expect(earth).toBeGreaterThan(mercury)
    expect(neptune).toBeGreaterThan(earth)
    expect(neptune).toBeLessThan(50)
  })

  it('keeps small planets visible with a minimum display radius', () => {
    expect(getPlanetDisplayRadius(4_879)).toBeGreaterThanOrEqual(0.34)
    expect(getPlanetDisplayRadius(139_820)).toBeGreaterThan(
      getPlanetDisplayRadius(12_742),
    )
  })

  it('computes deterministic positions from elapsed days and orbit period', () => {
    expect(getOrbitalAngle(365.25, 365.25)).toBeCloseTo(Math.PI * 2)
    expect(getPlanetPosition(1, 365.25, 365.25)).toEqual(
      getPlanetPosition(1, 365.25, 365.25),
    )
  })
})
