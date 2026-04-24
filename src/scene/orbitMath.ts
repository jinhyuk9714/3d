import type { Vector3Tuple } from 'three'

const MIN_PLANET_RADIUS = 0.34
const MAX_PLANET_RADIUS = 2.2

export function getScaledOrbitRadius(distanceAu: number) {
  return 8 + Math.pow(distanceAu, 0.45) * 8
}

export function getPlanetDisplayRadius(diameterKm: number) {
  const earthDiameterKm = 12_742
  const earthDisplayRadius = 0.52
  const scaledRadius =
    Math.sqrt(diameterKm / earthDiameterKm) * earthDisplayRadius

  return Math.min(MAX_PLANET_RADIUS, Math.max(MIN_PLANET_RADIUS, scaledRadius))
}

export function getOrbitalAngle(
  elapsedDays: number,
  orbitPeriodDays: number,
  phaseOffset = 0,
) {
  return (elapsedDays / orbitPeriodDays) * Math.PI * 2 + phaseOffset
}

export function getPlanetPosition(
  distanceAu: number,
  orbitPeriodDays: number,
  elapsedDays: number,
  phaseOffset = 0,
): Vector3Tuple {
  const radius = getScaledOrbitRadius(distanceAu)
  const angle = getOrbitalAngle(elapsedDays, orbitPeriodDays, phaseOffset)

  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
}
