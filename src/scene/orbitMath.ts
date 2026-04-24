import type { Vector3Tuple } from 'three'

const MIN_PLANET_RADIUS = 0.34
const MAX_PLANET_RADIUS = 2.2
const MIN_MOON_RADIUS = 0.16
const MAX_MOON_RADIUS = 0.34

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

export function getScaledMoonOrbitRadius(
  orbitRadiusKm: number,
  parentDisplayRadius: number,
) {
  const enceladusOrbitRadiusKm = 238_020
  const compressedMoonOrbit =
    Math.pow(orbitRadiusKm / enceladusOrbitRadiusKm, 0.43) * 1.05

  return parentDisplayRadius + 1.08 + compressedMoonOrbit
}

export function getMoonDisplayRadius(diameterKm: number) {
  const moonDiameterKm = 3_475
  const moonDisplayRadius = 0.22
  const scaledRadius = Math.sqrt(diameterKm / moonDiameterKm) * moonDisplayRadius

  return Math.min(MAX_MOON_RADIUS, Math.max(MIN_MOON_RADIUS, scaledRadius))
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

export function getMoonPosition(
  parentPosition: Readonly<Vector3Tuple>,
  orbitRadiusKm: number,
  orbitPeriodDays: number,
  elapsedDays: number,
  phaseOffset = 0,
  orbitDirection: 1 | -1 = 1,
  parentDisplayRadius = 1,
): Vector3Tuple {
  const radius = getScaledMoonOrbitRadius(orbitRadiusKm, parentDisplayRadius)
  const angle =
    (elapsedDays / orbitPeriodDays) * Math.PI * 2 * orbitDirection +
    phaseOffset

  return [
    parentPosition[0] + Math.cos(angle) * radius,
    parentPosition[1],
    parentPosition[2] + Math.sin(angle) * radius,
  ]
}

export function getCameraPositionAfterTargetShift(
  cameraPosition: Readonly<Vector3Tuple>,
  previousTarget: Readonly<Vector3Tuple>,
  nextTarget: Readonly<Vector3Tuple>,
): Vector3Tuple {
  return [
    cameraPosition[0] + nextTarget[0] - previousTarget[0],
    cameraPosition[1] + nextTarget[1] - previousTarget[1],
    cameraPosition[2] + nextTarget[2] - previousTarget[2],
  ]
}
