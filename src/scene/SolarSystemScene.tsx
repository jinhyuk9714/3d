import { Html, OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { MoonDatum, MoonId } from '../data/moons'
import { MOON_VISUALS } from '../data/moonVisuals'
import type { MoonVisual } from '../data/moonVisuals'
import type { PlanetDatum, PlanetId, SolarBodyId } from '../data/planets'
import { PLANET_VISUALS } from '../data/planetVisuals'
import type { PlanetAtmosphere, PlanetVisual } from '../data/planetVisuals'
import { SUN_VISUAL } from '../data/sunVisual'
import type { SunVisual } from '../data/sunVisual'
import {
  getCameraPositionAfterTargetShift,
  getMoonDisplayRadius,
  getMoonPosition,
  getPlanetDisplayRadius,
  getPlanetPosition,
  getScaledOrbitRadius,
  getScaledMoonOrbitRadius,
} from './orbitMath'

type SolarSystemSceneProps = {
  planets: PlanetDatum[]
  moons: MoonDatum[]
  isPlaying: boolean
  resetSignal: number
  selectedBodyId: SolarBodyId | null
  simulationClockRef: SimulationClockRef
  speedDaysPerSecond: number
  onSelectBody: (bodyId: SolarBodyId) => void
  onSceneReady?: () => void
}

type SimulationClockRef = {
  current: {
    elapsedDays: number
  }
}

type SceneQuality = {
  dpr: [number, number]
  isCompact: boolean
  starCount: number
  starFactor: number
  orbitSegments: number
  moonOrbitSegments: number
  sunSegments: number
  sunHaloSegments: number
  planetSegments: number
  moonSegments: number
  atmosphereSegments: number
  saturnRingSegments: number
  selectionHaloSegments: number
  showPlanetLabels: boolean
}

const PLANET_PHASES: Record<PlanetId, number> = {
  mercury: 0.4,
  venus: 1.8,
  earth: 2.6,
  mars: 3.7,
  jupiter: 0.9,
  saturn: 2.1,
  uranus: 4.8,
  neptune: 5.6,
}

const MOON_PHASES: Record<MoonId, number> = {
  moon: 0.2,
  io: 0.7,
  europa: 1.6,
  ganymede: 2.4,
  callisto: 3.3,
  titan: 0.9,
  enceladus: 2.8,
  triton: 1.4,
}

const preserveDrawingBuffer =
  import.meta.env.VITE_PRESERVE_DRAWING_BUFFER === 'true'
const SUN_DISPLAY_RADIUS = 3.2
const SUN_ROTATION_PERIOD_DAYS = 27
const DEFAULT_CAMERA_POSITION = [0, 30, 52] satisfies Vector3Tuple
const DESKTOP_SCENE_QUALITY: SceneQuality = {
  dpr: [1, 2],
  isCompact: false,
  starCount: 2_400,
  starFactor: 4,
  orbitSegments: 192,
  moonOrbitSegments: 128,
  sunSegments: 96,
  sunHaloSegments: 72,
  planetSegments: 48,
  moonSegments: 36,
  atmosphereSegments: 48,
  saturnRingSegments: 160,
  selectionHaloSegments: 96,
  showPlanetLabels: true,
}
const COMPACT_SCENE_QUALITY: SceneQuality = {
  dpr: [1, 1],
  isCompact: true,
  starCount: 720,
  starFactor: 2.8,
  orbitSegments: 96,
  moonOrbitSegments: 64,
  sunSegments: 56,
  sunHaloSegments: 40,
  planetSegments: 24,
  moonSegments: 18,
  atmosphereSegments: 22,
  saturnRingSegments: 80,
  selectionHaloSegments: 48,
  showPlanetLabels: false,
}

function useSceneQuality() {
  const [sceneQuality, setSceneQuality] = useState(getPreferredSceneQuality)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(max-width: 700px), (pointer: coarse)')
    const updateSceneQuality = () => {
      setSceneQuality(mediaQuery.matches ? COMPACT_SCENE_QUALITY : DESKTOP_SCENE_QUALITY)
    }

    updateSceneQuality()
    mediaQuery.addEventListener('change', updateSceneQuality)

    return () => {
      mediaQuery.removeEventListener('change', updateSceneQuality)
    }
  }, [])

  return sceneQuality
}

function getPreferredSceneQuality() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return DESKTOP_SCENE_QUALITY
  }

  return window.matchMedia('(max-width: 700px), (pointer: coarse)').matches
    ? COMPACT_SCENE_QUALITY
    : DESKTOP_SCENE_QUALITY
}

function SceneReadyNotifier({
  onSceneReady,
}: {
  onSceneReady?: () => void
}) {
  useEffect(() => {
    onSceneReady?.()
  }, [onSceneReady])

  return null
}

function useLatestRef<T>(value: T) {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

export const SolarSystemScene = memo(function SolarSystemScene({
  planets,
  moons,
  isPlaying,
  resetSignal,
  selectedBodyId,
  simulationClockRef,
  speedDaysPerSecond,
  onSelectBody,
  onSceneReady,
}: SolarSystemSceneProps) {
  const sceneQuality = useSceneQuality()
  const focusTargetRef = useRef<Vector3Tuple | null>(null)
  const focusRadiusRef = useRef<number | null>(null)

  return (
    <div
      aria-label="3D 태양계 캔버스"
      className="simulator-canvas"
      data-testid="solar-canvas"
    >
      <Canvas
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 48, near: 0.1, far: 220 }}
        dpr={sceneQuality.dpr}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer,
        }}
      >
        <color attach="background" args={['#02040a']} />
        <fog attach="fog" args={['#02040a', 52, 118]} />
        <ambientLight intensity={0.34} />
        <pointLight color="#fff3ce" intensity={4.3} position={[0, 0, 0]} />
        <Suspense fallback={null}>
          <SimulationClockController
            isPlaying={isPlaying}
            resetSignal={resetSignal}
            simulationClockRef={simulationClockRef}
            speedDaysPerSecond={speedDaysPerSecond}
          />
          <Stars
            radius={90}
            depth={42}
            count={sceneQuality.starCount}
            factor={sceneQuality.starFactor}
            saturation={0}
            fade
            speed={0.18}
          />
          <SolarSystem
            moons={moons}
            onSelectBody={onSelectBody}
            planets={planets}
            sceneQuality={sceneQuality}
            selectedBodyId={selectedBodyId}
            simulationClockRef={simulationClockRef}
          />
          <FocusTargetUpdater
            focusRadiusRef={focusRadiusRef}
            focusTargetRef={focusTargetRef}
            moons={moons}
            planets={planets}
            selectedBodyId={selectedBodyId}
            simulationClockRef={simulationClockRef}
          />
          <CameraFocus
            focusKey={selectedBodyId ?? 'default'}
            selectedPositionRef={focusTargetRef}
            selectedRadiusRef={focusRadiusRef}
          />
          <SceneReadyNotifier onSceneReady={onSceneReady} />
        </Suspense>
      </Canvas>
    </div>
  )
})

function SimulationClockController({
  isPlaying,
  resetSignal,
  simulationClockRef,
  speedDaysPerSecond,
}: {
  isPlaying: boolean
  resetSignal: number
  simulationClockRef: SimulationClockRef
  speedDaysPerSecond: number
}) {
  const isPlayingRef = useLatestRef(isPlaying)
  const speedDaysPerSecondRef = useLatestRef(speedDaysPerSecond)

  useEffect(() => {
    simulationClockRef.current.elapsedDays = 0
  }, [resetSignal, simulationClockRef])

  useFrame((_, deltaSeconds) => {
    if (!isPlayingRef.current) {
      return
    }

    simulationClockRef.current.elapsedDays +=
      deltaSeconds * speedDaysPerSecondRef.current
  }, -100)

  return null
}

function FocusTargetUpdater({
  focusRadiusRef,
  focusTargetRef,
  moons,
  planets,
  selectedBodyId,
  simulationClockRef,
}: {
  focusRadiusRef: MutableRefObject<number | null>
  focusTargetRef: MutableRefObject<Vector3Tuple | null>
  moons: MoonDatum[]
  planets: PlanetDatum[]
  selectedBodyId: SolarBodyId | null
  simulationClockRef: SimulationClockRef
}) {
  const selectedBodyIdRef = useLatestRef(selectedBodyId)

  useFrame(() => {
    const focus = getSelectedBodyFocus(
      selectedBodyIdRef.current,
      planets,
      moons,
      simulationClockRef.current.elapsedDays,
    )

    focusTargetRef.current = focus.position
    focusRadiusRef.current = focus.radius
  }, -90)

  return null
}

function getSelectedBodyFocus(
  selectedBodyId: SolarBodyId | null,
  planets: PlanetDatum[],
  moons: MoonDatum[],
  elapsedDays: number,
) {
  if (selectedBodyId === 'sun') {
    return {
      position: [0, 0, 0] satisfies Vector3Tuple,
      radius: SUN_DISPLAY_RADIUS,
    }
  }

  const selectedPlanet = planets.find((planet) => planet.id === selectedBodyId)

  if (selectedPlanet) {
    return {
      position: getPlanetPosition(
        selectedPlanet.distanceAu,
        selectedPlanet.orbitPeriodDays,
        elapsedDays,
        PLANET_PHASES[selectedPlanet.id],
      ),
      radius: getPlanetDisplayRadius(selectedPlanet.diameterKm),
    }
  }

  const selectedMoon = moons.find((moon) => moon.id === selectedBodyId)

  if (selectedMoon) {
    return {
      position: getMoonWorldPosition(selectedMoon, planets, elapsedDays),
      radius: getMoonDisplayRadius(selectedMoon.diameterKm),
    }
  }

  return {
    position: null,
    radius: null,
  }
}

function SolarSystem({
  planets,
  moons,
  selectedBodyId,
  onSelectBody,
  sceneQuality,
  simulationClockRef,
}: Omit<
  SolarSystemSceneProps,
  'isPlaying' | 'onSceneReady' | 'resetSignal' | 'speedDaysPerSecond'
> & {
  sceneQuality: SceneQuality
}) {
  const moonsByPlanetId = useMemo(() => {
    const groupedMoons = new Map<PlanetId, MoonDatum[]>()

    for (const planet of planets) {
      groupedMoons.set(planet.id, [])
    }

    for (const moon of moons) {
      groupedMoons.get(moon.parentPlanetId)?.push(moon)
    }

    return groupedMoons
  }, [moons, planets])

  return (
    <group>
      <Sun
        isSelected={selectedBodyId === 'sun'}
        onSelectBody={onSelectBody}
        sceneQuality={sceneQuality}
        simulationClockRef={simulationClockRef}
      />
      {planets.map((planet) => (
        <group key={planet.id}>
          <OrbitRing
            radius={getScaledOrbitRadius(planet.distanceAu)}
            segments={sceneQuality.orbitSegments}
          />
          <PlanetBody
            isSelected={planet.id === selectedBodyId}
            moons={moonsByPlanetId.get(planet.id) ?? []}
            onSelectBody={onSelectBody}
            planet={planet}
            sceneQuality={sceneQuality}
            selectedBodyId={selectedBodyId}
            simulationClockRef={simulationClockRef}
          />
        </group>
      ))}
    </group>
  )
}

function Sun({
  isSelected,
  onSelectBody,
  sceneQuality,
  simulationClockRef,
}: {
  isSelected: boolean
  onSelectBody: (bodyId: SolarBodyId) => void
  sceneQuality: SceneQuality
  simulationClockRef: SimulationClockRef
}) {
  const surfaceTexture = usePlanetTexture(SUN_VISUAL)
  const sunMeshRef = useRef<THREE.Mesh | null>(null)
  const selectSun = () => onSelectBody('sun')

  useFrame(() => {
    if (!sunMeshRef.current) {
      return
    }

    sunMeshRef.current.rotation.y =
      (simulationClockRef.current.elapsedDays / SUN_ROTATION_PERIOD_DAYS) *
      Math.PI *
      2
  })

  return (
    <group>
      <mesh
        ref={sunMeshRef}
        onClick={(event) => {
          event.stopPropagation()
          selectSun()
        }}
      >
        <sphereGeometry
          args={[SUN_DISPLAY_RADIUS, sceneQuality.sunSegments, sceneQuality.sunSegments]}
        />
        <meshBasicMaterial
          color={SUN_VISUAL.material.tint}
          map={surfaceTexture}
          toneMapped={false}
        />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          selectSun()
        }}
      >
        <sphereGeometry
          args={[3.85, sceneQuality.sunHaloSegments, sceneQuality.sunHaloSegments]}
        />
        <meshBasicMaterial color="#ff9f1c" transparent opacity={0.12} />
      </mesh>
      {isSelected ? (
        <SelectionHalo
          radius={SUN_DISPLAY_RADIUS}
          segments={sceneQuality.selectionHaloSegments}
        />
      ) : null}
      <Html center distanceFactor={16} position={[0, 4.8, 0]}>
        <button
          className={`scene-label scene-label--sun ${
            isSelected ? 'is-active' : ''
          }`}
          onClick={selectSun}
          type="button"
        >
          태양
        </button>
      </Html>
    </group>
  )
}

function OrbitRing({
  radius,
  segments,
}: {
  radius: number
  segments: number
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius)
    const points = curve
      .getPoints(segments)
      .map((point) => new THREE.Vector3(point.x, 0, point.y))

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius, segments])

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#8fb3d9" transparent opacity={0.28} />
    </lineLoop>
  )
}

function PlanetBody({
  planet,
  isSelected,
  moons,
  onSelectBody,
  sceneQuality,
  selectedBodyId,
  simulationClockRef,
}: {
  planet: PlanetDatum
  isSelected: boolean
  moons: MoonDatum[]
  onSelectBody: (bodyId: SolarBodyId) => void
  sceneQuality: SceneQuality
  selectedBodyId: SolarBodyId | null
  simulationClockRef: SimulationClockRef
}) {
  const planetGroupRef = useRef<THREE.Group | null>(null)
  const planetMeshRef = useRef<THREE.Mesh | null>(null)
  const radius = getPlanetDisplayRadius(planet.diameterKm)
  const visual = PLANET_VISUALS[planet.id]
  const surfaceTexture = usePlanetTexture(visual)
  const initialPosition = useMemo(
    () =>
      getPlanetPosition(
        planet.distanceAu,
        planet.orbitPeriodDays,
        0,
        PLANET_PHASES[planet.id],
      ),
    [planet.distanceAu, planet.id, planet.orbitPeriodDays],
  )
  const axialTiltRad = THREE.MathUtils.degToRad(planet.axialTiltDeg)

  useFrame(() => {
    const elapsedDays = simulationClockRef.current.elapsedDays
    const position = getPlanetPosition(
      planet.distanceAu,
      planet.orbitPeriodDays,
      elapsedDays,
      PLANET_PHASES[planet.id],
    )

    planetGroupRef.current?.position.set(...position)

    if (planetMeshRef.current) {
      planetMeshRef.current.rotation.y =
        (elapsedDays / Math.abs(planet.rotationPeriodHours / 24)) * 0.5
    }
  })

  return (
    <group ref={planetGroupRef} position={initialPosition}>
      <group rotation={[0, 0, axialTiltRad]}>
        <mesh
          ref={planetMeshRef}
          onClick={(event) => {
            event.stopPropagation()
            onSelectBody(planet.id)
          }}
        >
          <sphereGeometry
            args={[radius, sceneQuality.planetSegments, sceneQuality.planetSegments]}
          />
          <meshStandardMaterial
            color={visual.material.tint}
            emissive={planet.color}
            emissiveIntensity={
              isSelected
                ? visual.material.emissiveIntensity + 0.12
                : visual.material.emissiveIntensity
            }
            map={surfaceTexture}
            metalness={visual.material.metalness}
            roughness={visual.material.roughness}
          />
        </mesh>
        {visual.atmosphere ? (
          <AtmosphereShell
            atmosphere={visual.atmosphere}
            radius={radius}
            segments={sceneQuality.atmosphereSegments}
          />
        ) : null}
        {planet.id === 'saturn' ? (
          <SaturnRing radius={radius} segments={sceneQuality.saturnRingSegments} />
        ) : null}
        {isSelected ? <AxisTiltGuide radius={radius} /> : null}
      </group>
      {isSelected ? (
        <SelectionHalo radius={radius} segments={sceneQuality.selectionHaloSegments} />
      ) : null}
      {sceneQuality.showPlanetLabels || isSelected ? (
        <Html center distanceFactor={11} position={[0, radius + 0.72, 0]}>
          <button
            className={`scene-label ${isSelected ? 'is-active' : ''}`}
            onClick={() => onSelectBody(planet.id)}
            type="button"
          >
            {planet.nameKo}
          </button>
        </Html>
      ) : null}
      {moons.map((moon) => (
        <group key={moon.id}>
          <MoonOrbitRing
            parentRadius={radius}
            radius={getScaledMoonOrbitRadius(moon.orbitRadiusKm, radius)}
            segments={sceneQuality.moonOrbitSegments}
          />
          <MoonBody
            isSelected={moon.id === selectedBodyId}
            moon={moon}
            onSelectBody={onSelectBody}
            parentRadius={radius}
            sceneQuality={sceneQuality}
            simulationClockRef={simulationClockRef}
          />
        </group>
      ))}
    </group>
  )
}

function MoonOrbitRing({
  parentRadius,
  radius,
  segments,
}: {
  parentRadius: number
  radius: number
  segments: number
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius)
    const points = curve
      .getPoints(segments)
      .map((point) => new THREE.Vector3(point.x, 0, point.y))

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius, segments])

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        color="#d8e2ef"
        opacity={parentRadius > 1.8 ? 0.18 : 0.28}
        transparent
      />
    </lineLoop>
  )
}

function MoonBody({
  moon,
  isSelected,
  onSelectBody,
  parentRadius,
  sceneQuality,
  simulationClockRef,
}: {
  moon: MoonDatum
  isSelected: boolean
  onSelectBody: (bodyId: SolarBodyId) => void
  parentRadius: number
  sceneQuality: SceneQuality
  simulationClockRef: SimulationClockRef
}) {
  const moonGroupRef = useRef<THREE.Group | null>(null)
  const moonMeshRef = useRef<THREE.Mesh | null>(null)
  const radius = getMoonDisplayRadius(moon.diameterKm)
  const visual = MOON_VISUALS[moon.id]
  const surfaceTexture = usePlanetTexture(visual)
  const initialPosition = useMemo(
    () =>
      getMoonPosition(
        [0, 0, 0],
        moon.orbitRadiusKm,
        moon.orbitPeriodDays,
        0,
        MOON_PHASES[moon.id],
        moon.orbitDirection,
        parentRadius,
      ),
    [
      moon.id,
      moon.orbitDirection,
      moon.orbitPeriodDays,
      moon.orbitRadiusKm,
      parentRadius,
    ],
  )

  useFrame(() => {
    const elapsedDays = simulationClockRef.current.elapsedDays
    const position = getMoonPosition(
      [0, 0, 0],
      moon.orbitRadiusKm,
      moon.orbitPeriodDays,
      elapsedDays,
      MOON_PHASES[moon.id],
      moon.orbitDirection,
      parentRadius,
    )

    moonGroupRef.current?.position.set(...position)

    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y = (elapsedDays / moon.orbitPeriodDays) * 0.42
    }
  })

  return (
    <group ref={moonGroupRef} position={initialPosition}>
      <mesh
        ref={moonMeshRef}
        onClick={(event) => {
          event.stopPropagation()
          onSelectBody(moon.id)
        }}
      >
        <sphereGeometry
          args={[radius, sceneQuality.moonSegments, sceneQuality.moonSegments]}
        />
        <meshStandardMaterial
          color={visual.material.tint}
          emissive={moon.color}
          emissiveIntensity={
            isSelected
              ? visual.material.emissiveIntensity + 0.1
              : visual.material.emissiveIntensity
          }
          map={surfaceTexture}
          metalness={visual.material.metalness}
          roughness={visual.material.roughness}
        />
      </mesh>
      {isSelected ? (
        <SelectionHalo radius={radius} segments={sceneQuality.selectionHaloSegments} />
      ) : null}
      {isSelected ? (
        <Html center distanceFactor={10} position={[0, radius + 0.42, 0]}>
          <button
            className="scene-label is-active"
            onClick={() => onSelectBody(moon.id)}
            type="button"
          >
            {moon.nameKo}
          </button>
        </Html>
      ) : null}
    </group>
  )
}

function usePlanetTexture(visual: PlanetVisual | MoonVisual | SunVisual) {
  const texture = useTexture(
    getPublicTextureUrl(visual.texturePath),
    (loadedTexture) => {
      const textures = Array.isArray(loadedTexture)
        ? loadedTexture
        : [loadedTexture]

      for (const item of textures) {
        item.colorSpace = THREE.SRGBColorSpace
        item.wrapS = THREE.RepeatWrapping
        item.wrapT = THREE.ClampToEdgeWrapping
        item.anisotropy = 8
        item.needsUpdate = true
      }
    },
  )

  return texture
}

function getPublicTextureUrl(texturePath: string) {
  return `${import.meta.env.BASE_URL}${texturePath}`
}

function AtmosphereShell({
  atmosphere,
  radius,
  segments,
}: {
  atmosphere: PlanetAtmosphere
  radius: number
  segments: number
}) {
  return (
    <mesh scale={atmosphere.scale}>
      <sphereGeometry args={[radius, segments, segments]} />
      <meshBasicMaterial
        blending={THREE.AdditiveBlending}
        color={atmosphere.color}
        depthWrite={false}
        opacity={atmosphere.opacity}
        side={THREE.BackSide}
        transparent
      />
    </mesh>
  )
}

function SaturnRing({
  radius,
  segments,
}: {
  radius: number
  segments: number
}) {
  const ringTexture = useSaturnRingTexture()

  return (
    <mesh rotation={[Math.PI / 2.45, 0.2, 0]}>
      <ringGeometry args={[radius * 1.36, radius * 2.22, segments]} />
      <meshBasicMaterial
        color="#f3dca4"
        depthWrite={false}
        map={ringTexture}
        opacity={0.62}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
}

function useSaturnRingTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 32

    const context = canvas.getContext('2d')
    if (!context) {
      return null
    }

    for (let x = 0; x < canvas.width; x += 1) {
      const t = x / canvas.width
      const band =
        0.3 +
        Math.sin(t * Math.PI * 18) * 0.11 +
        Math.sin(t * Math.PI * 47) * 0.045
      const alpha = Math.max(0.04, Math.min(0.72, band))
      context.fillStyle = `rgba(246, 224, 176, ${alpha})`
      context.fillRect(x, 0, 1, canvas.height)
    }

    context.fillStyle = 'rgba(8, 8, 10, 0.42)'
    context.fillRect(canvas.width * 0.54, 0, canvas.width * 0.04, canvas.height)

    const canvasTexture = new THREE.CanvasTexture(canvas)
    canvasTexture.colorSpace = THREE.SRGBColorSpace
    canvasTexture.wrapS = THREE.RepeatWrapping
    canvasTexture.wrapT = THREE.ClampToEdgeWrapping
    canvasTexture.anisotropy = 8

    return canvasTexture
  }, [])

  useEffect(() => {
    return () => texture?.dispose()
  }, [texture])

  return texture
}

function SelectionHalo({
  radius,
  segments,
}: {
  radius: number
  segments: number
}) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 1.65, radius * 1.78, segments]} />
      <meshBasicMaterial
        color="#7dd3fc"
        opacity={0.86}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
}

function AxisTiltGuide({ radius }: { radius: number }) {
  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -radius * 1.6, 0),
        new THREE.Vector3(0, radius * 1.6, 0),
      ]),
    [radius],
  )

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#f8fafc" opacity={0.72} transparent />
    </lineLoop>
  )
}

function getMoonWorldPosition(
  moon: MoonDatum,
  planets: PlanetDatum[],
  elapsedDays: number,
) {
  const parentPlanet = planets.find((planet) => planet.id === moon.parentPlanetId)

  if (!parentPlanet) {
    return null
  }

  const parentPosition = getPlanetPosition(
    parentPlanet.distanceAu,
    parentPlanet.orbitPeriodDays,
    elapsedDays,
    PLANET_PHASES[parentPlanet.id],
  )

  return getMoonPosition(
    parentPosition,
    moon.orbitRadiusKm,
    moon.orbitPeriodDays,
    elapsedDays,
    MOON_PHASES[moon.id],
    moon.orbitDirection,
    getPlanetDisplayRadius(parentPlanet.diameterKm),
  )
}

function CameraFocus({
  focusKey,
  selectedPositionRef,
  selectedRadiusRef,
}: {
  focusKey: string
  selectedPositionRef: MutableRefObject<Vector3Tuple | null>
  selectedRadiusRef: MutableRefObject<number | null>
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const hasUserAdjustedCameraRef = useRef(false)
  const previousFocusKeyRef = useRef<string | null>(null)
  const { camera, gl } = useThree()
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const defaultPosition = useMemo(
    () => new THREE.Vector3(...DEFAULT_CAMERA_POSITION),
    [],
  )
  const fallbackOffset = useMemo(
    () => new THREE.Vector3(...DEFAULT_CAMERA_POSITION),
    [],
  )

  useEffect(() => {
    const element = gl.domElement
    const markUserAdjustedCamera = () => {
      hasUserAdjustedCameraRef.current = true
    }

    element.addEventListener('wheel', markUserAdjustedCamera, { passive: true })
    element.addEventListener('pointerdown', markUserAdjustedCamera)

    return () => {
      element.removeEventListener('wheel', markUserAdjustedCamera)
      element.removeEventListener('pointerdown', markUserAdjustedCamera)
    }
  }, [gl])

  useFrame(() => {
    const controls = controlsRef.current
    const selectedPosition = selectedPositionRef.current
    const selectedRadius = selectedRadiusRef.current
    const focusTarget = selectedPosition
      ? new THREE.Vector3(...selectedPosition)
      : defaultTarget
    const focusDistance = Math.max((selectedRadius ?? 1) * 7, 7)

    if (previousFocusKeyRef.current !== focusKey) {
      hasUserAdjustedCameraRef.current = false
      previousFocusKeyRef.current = focusKey
    }

    if (!controls) {
      return
    }

    const previousTarget = controls.target.clone()
    controls.target.lerp(focusTarget, 0.08)

    const shiftedCameraPosition = getCameraPositionAfterTargetShift(
      camera.position.toArray() as Vector3Tuple,
      previousTarget.toArray() as Vector3Tuple,
      controls.target.toArray() as Vector3Tuple,
    )
    camera.position.set(...shiftedCameraPosition)

    if (!hasUserAdjustedCameraRef.current) {
      const offset = camera.position.clone().sub(controls.target)
      const desiredDistance = selectedPosition
        ? focusDistance
        : defaultPosition.distanceTo(defaultTarget)
      const direction =
        offset.lengthSq() > 0.0001 ? offset.normalize() : fallbackOffset.clone().normalize()
      const cameraTarget = controls.target
        .clone()
        .add(direction.multiplyScalar(desiredDistance))

      camera.position.lerp(cameraTarget, 0.055)
    }

    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxDistance={95}
      minDistance={7}
      onStart={() => {
        hasUserAdjustedCameraRef.current = true
      }}
    />
  )
}
