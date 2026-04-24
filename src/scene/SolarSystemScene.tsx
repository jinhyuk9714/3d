import { Html, OrbitControls, Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { PlanetDatum, PlanetId, SolarBodyId } from '../data/planets'
import { PLANET_VISUALS } from '../data/planetVisuals'
import type { PlanetAtmosphere, PlanetVisual } from '../data/planetVisuals'
import {
  getPlanetDisplayRadius,
  getPlanetPosition,
  getScaledOrbitRadius,
} from './orbitMath'

type SolarSystemSceneProps = {
  planets: PlanetDatum[]
  elapsedDays: number
  selectedBodyId: SolarBodyId | null
  onSelectBody: (bodyId: SolarBodyId) => void
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

const preserveDrawingBuffer =
  import.meta.env.VITE_PRESERVE_DRAWING_BUFFER === 'true'
const SUN_DISPLAY_RADIUS = 3.2

export function SolarSystemScene({
  planets,
  elapsedDays,
  selectedBodyId,
  onSelectBody,
}: SolarSystemSceneProps) {
  const selectedPlanet =
    selectedBodyId === 'sun'
      ? null
      : planets.find((planet) => planet.id === selectedBodyId) ?? null
  const selectedPosition =
    selectedBodyId === 'sun'
      ? ([0, 0, 0] satisfies Vector3Tuple)
      : selectedPlanet
        ? getPlanetPosition(
            selectedPlanet.distanceAu,
            selectedPlanet.orbitPeriodDays,
            elapsedDays,
            PLANET_PHASES[selectedPlanet.id],
          )
        : null

  return (
    <div
      aria-label="3D 태양계 캔버스"
      className="simulator-canvas"
      data-testid="solar-canvas"
    >
      <Canvas
        camera={{ position: [0, 30, 52], fov: 48, near: 0.1, far: 220 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer,
        }}
      >
        <color attach="background" args={['#02040a']} />
        <fog attach="fog" args={['#02040a', 52, 118]} />
        <ambientLight intensity={0.34} />
        <pointLight color="#fff3ce" intensity={4.3} position={[0, 0, 0]} />
        <Stars
          radius={90}
          depth={42}
          count={2_400}
          factor={4}
          saturation={0}
          fade
          speed={0.18}
        />
        <SolarSystem
          elapsedDays={elapsedDays}
          onSelectBody={onSelectBody}
          planets={planets}
          selectedBodyId={selectedBodyId}
        />
        <CameraFocus
          selectedPosition={selectedPosition}
          selectedRadius={
            selectedBodyId === 'sun'
              ? SUN_DISPLAY_RADIUS
              : selectedPlanet
                ? getPlanetDisplayRadius(selectedPlanet.diameterKm)
                : null
          }
        />
      </Canvas>
    </div>
  )
}

function SolarSystem({
  planets,
  elapsedDays,
  selectedBodyId,
  onSelectBody,
}: SolarSystemSceneProps) {
  return (
    <group>
      <Sun
        isSelected={selectedBodyId === 'sun'}
        onSelectBody={onSelectBody}
      />
      {planets.map((planet) => (
        <group key={planet.id}>
          <OrbitRing radius={getScaledOrbitRadius(planet.distanceAu)} />
          <PlanetBody
            elapsedDays={elapsedDays}
            isSelected={planet.id === selectedBodyId}
            onSelectBody={onSelectBody}
            planet={planet}
          />
        </group>
      ))}
    </group>
  )
}

function Sun({
  isSelected,
  onSelectBody,
}: {
  isSelected: boolean
  onSelectBody: (bodyId: SolarBodyId) => void
}) {
  const selectSun = () => onSelectBody('sun')

  return (
    <group>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          selectSun()
        }}
      >
        <sphereGeometry args={[SUN_DISPLAY_RADIUS, 72, 72]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          selectSun()
        }}
      >
        <sphereGeometry args={[3.85, 72, 72]} />
        <meshBasicMaterial color="#ff9f1c" transparent opacity={0.12} />
      </mesh>
      {isSelected ? <SelectionHalo radius={SUN_DISPLAY_RADIUS} /> : null}
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

function OrbitRing({ radius }: { radius: number }) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius)
    const points = curve
      .getPoints(192)
      .map((point) => new THREE.Vector3(point.x, 0, point.y))

    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius])

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#8fb3d9" transparent opacity={0.28} />
    </lineLoop>
  )
}

function PlanetBody({
  planet,
  elapsedDays,
  isSelected,
  onSelectBody,
}: {
  planet: PlanetDatum
  elapsedDays: number
  isSelected: boolean
  onSelectBody: (bodyId: SolarBodyId) => void
}) {
  const radius = getPlanetDisplayRadius(planet.diameterKm)
  const visual = PLANET_VISUALS[planet.id]
  const surfaceTexture = usePlanetTexture(visual)
  const position = getPlanetPosition(
    planet.distanceAu,
    planet.orbitPeriodDays,
    elapsedDays,
    PLANET_PHASES[planet.id],
  )
  const rotation = (elapsedDays / Math.abs(planet.rotationPeriodHours / 24)) * 0.5

  return (
    <group position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          onSelectBody(planet.id)
        }}
        rotation={[0, rotation, 0]}
      >
        <sphereGeometry args={[radius, 48, 48]} />
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
        <AtmosphereShell atmosphere={visual.atmosphere} radius={radius} />
      ) : null}
      {planet.id === 'saturn' ? <SaturnRing radius={radius} /> : null}
      {isSelected ? <SelectionHalo radius={radius} /> : null}
      <Html center distanceFactor={11} position={[0, radius + 0.72, 0]}>
        <button
          className={`scene-label ${isSelected ? 'is-active' : ''}`}
          onClick={() => onSelectBody(planet.id)}
          type="button"
        >
          {planet.nameKo}
        </button>
      </Html>
    </group>
  )
}

function usePlanetTexture(visual: PlanetVisual) {
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
}: {
  atmosphere: PlanetAtmosphere
  radius: number
}) {
  return (
    <mesh scale={atmosphere.scale}>
      <sphereGeometry args={[radius, 48, 48]} />
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

function SaturnRing({ radius }: { radius: number }) {
  const ringTexture = useSaturnRingTexture()

  return (
    <mesh rotation={[Math.PI / 2.45, 0.2, 0]}>
      <ringGeometry args={[radius * 1.36, radius * 2.22, 160]} />
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

function SelectionHalo({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 1.65, radius * 1.78, 96]} />
      <meshBasicMaterial
        color="#7dd3fc"
        opacity={0.86}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
}

function CameraFocus({
  selectedPosition,
  selectedRadius,
}: {
  selectedPosition: Vector3Tuple | null
  selectedRadius: number | null
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const { camera } = useThree()
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const defaultPosition = useMemo(() => new THREE.Vector3(0, 30, 52), [])

  useFrame(() => {
    const focusTarget = selectedPosition
      ? new THREE.Vector3(...selectedPosition)
      : defaultTarget
    const focusDistance = Math.max((selectedRadius ?? 1) * 7, 7)
    const cameraTarget = selectedPosition
      ? new THREE.Vector3(
          selectedPosition[0] + focusDistance,
          5 + focusDistance * 0.35,
          selectedPosition[2] + focusDistance,
        )
      : defaultPosition

    camera.position.lerp(cameraTarget, 0.055)
    controlsRef.current?.target.lerp(focusTarget, 0.08)
    controlsRef.current?.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxDistance={95}
      minDistance={7}
    />
  )
}
