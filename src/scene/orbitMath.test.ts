import { describe, expect, it } from 'vitest'
import {
  getOrbitalAngle,
  getCameraPositionAfterTargetShift,
  getMoonDisplayRadius,
  getMoonPosition,
  getScaledMoonOrbitRadius,
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

  it('preserves camera zoom distance while following a moving focus target', () => {
    const cameraPosition = [10, 5, 10] as const
    const previousTarget = [0, 0, 0] as const
    const nextTarget = [2, 0, -1] as const

    const shiftedCamera = getCameraPositionAfterTargetShift(
      cameraPosition,
      previousTarget,
      nextTarget,
    )

    const distanceBefore = Math.hypot(
      cameraPosition[0] - previousTarget[0],
      cameraPosition[1] - previousTarget[1],
      cameraPosition[2] - previousTarget[2],
    )
    const distanceAfter = Math.hypot(
      shiftedCamera[0] - nextTarget[0],
      shiftedCamera[1] - nextTarget[1],
      shiftedCamera[2] - nextTarget[2],
    )

    expect(shiftedCamera).toEqual([12, 5, 9])
    expect(distanceAfter).toBeCloseTo(distanceBefore)
  })

  it('scales moon orbits and radii into visible positive values', () => {
    const enceladusOrbit = getScaledMoonOrbitRadius(238_020, 2.2)
    const callistoOrbit = getScaledMoonOrbitRadius(1_882_700, 2.2)

    expect(enceladusOrbit).toBeGreaterThan(2.2)
    expect(callistoOrbit).toBeGreaterThan(enceladusOrbit)
    expect(callistoOrbit).toBeLessThan(10)
    expect(getMoonDisplayRadius(504)).toBeGreaterThanOrEqual(0.16)
    expect(getMoonDisplayRadius(5_262)).toBeGreaterThan(
      getMoonDisplayRadius(3_475),
    )
  })

  it('computes deterministic moon positions around a parent planet', () => {
    const parentPosition = [12, 0, -4] as const
    const position = getMoonPosition(
      parentPosition,
      421_800,
      1.769,
      0.5,
      1,
      1,
    )

    expect(position).toEqual(
      getMoonPosition(parentPosition, 421_800, 1.769, 0.5, 1, 1),
    )
    expect(position[1]).toBe(0)
    expect(position[0]).not.toBe(parentPosition[0])
  })

  it('reverses moon orbital direction for retrograde moons', () => {
    const parentPosition = [0, 0, 0] as const

    expect(getMoonPosition(parentPosition, 354_800, 5.877, 2, 0, -1)).toEqual(
      getMoonPosition(parentPosition, 354_800, 5.877, -2, 0, 1),
    )
  })
})
