import { Html, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Vector3Tuple } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { PlanetDatum, PlanetId } from '../data/planets'
import {
  getPlanetDisplayRadius,
  getPlanetPosition,
  getScaledOrbitRadius,
} from './orbitMath'

type SolarSystemSceneProps = {
  planets: PlanetDatum[]
  elapsedDays: number
  selectedPlanetId: PlanetId | null
  onSelectPlanet: (planetId: PlanetId) => void
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

export function SolarSystemScene({
  planets,
  elapsedDays,
  selectedPlanetId,
  onSelectPlanet,
}: SolarSystemSceneProps) {
  const selectedPlanet = planets.find((planet) => planet.id === selectedPlanetId)
  const selectedPosition = selectedPlanet
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
          onSelectPlanet={onSelectPlanet}
          planets={planets}
          selectedPlanetId={selectedPlanetId}
        />
        <CameraFocus
          selectedPosition={selectedPosition}
          selectedRadius={
            selectedPlanet
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
  selectedPlanetId,
  onSelectPlanet,
}: SolarSystemSceneProps) {
  return (
    <group>
      <Sun />
      {planets.map((planet) => (
        <group key={planet.id}>
          <OrbitRing radius={getScaledOrbitRadius(planet.distanceAu)} />
          <PlanetBody
            elapsedDays={elapsedDays}
            isSelected={planet.id === selectedPlanetId}
            onSelectPlanet={onSelectPlanet}
            planet={planet}
          />
        </group>
      ))}
    </group>
  )
}

function Sun() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[3.2, 72, 72]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      <mesh>
        <sphereGeometry args={[3.85, 72, 72]} />
        <meshBasicMaterial color="#ff9f1c" transparent opacity={0.12} />
      </mesh>
      <Html center distanceFactor={16} position={[0, 4.8, 0]}>
        <span className="scene-label scene-label--sun">태양</span>
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
  onSelectPlanet,
}: {
  planet: PlanetDatum
  elapsedDays: number
  isSelected: boolean
  onSelectPlanet: (planetId: PlanetId) => void
}) {
  const radius = getPlanetDisplayRadius(planet.diameterKm)
  const surfaceTexture = usePlanetTexture(planet)
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
          onSelectPlanet(planet.id)
        }}
        rotation={[0, rotation, 0]}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={planet.color}
          emissiveIntensity={isSelected ? 0.24 : 0.08}
          map={surfaceTexture}
          metalness={0.05}
          roughness={0.78}
        />
      </mesh>
      {planet.id === 'saturn' ? <SaturnRing radius={radius} /> : null}
      {isSelected ? <SelectionHalo radius={radius} /> : null}
      <Html center distanceFactor={11} position={[0, radius + 0.72, 0]}>
        <button
          className={`scene-label ${isSelected ? 'is-active' : ''}`}
          onClick={() => onSelectPlanet(planet.id)}
          type="button"
        >
          {planet.nameKo}
        </button>
      </Html>
    </group>
  )
}

function usePlanetTexture(planet: PlanetDatum) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128

    const context = canvas.getContext('2d')
    if (!context) {
      return null
    }

    paintPlanetSurface(context, planet)

    const canvasTexture = new THREE.CanvasTexture(canvas)
    canvasTexture.colorSpace = THREE.SRGBColorSpace
    canvasTexture.wrapS = THREE.RepeatWrapping
    canvasTexture.wrapT = THREE.ClampToEdgeWrapping
    canvasTexture.anisotropy = 4

    return canvasTexture
  }, [planet])

  useEffect(() => {
    return () => texture?.dispose()
  }, [texture])

  return texture
}

function paintPlanetSurface(
  context: CanvasRenderingContext2D,
  planet: PlanetDatum,
) {
  const { width, height } = context.canvas
  const base = new THREE.Color(planet.color)
  const dark = base.clone().multiplyScalar(0.58).getStyle()
  const light = base.clone().lerp(new THREE.Color('#ffffff'), 0.34).getStyle()

  const gradient = context.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, light)
  gradient.addColorStop(0.5, planet.color)
  gradient.addColorStop(1, dark)
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)

  if (planet.id === 'jupiter' || planet.id === 'saturn') {
    for (let y = 8; y < height; y += 13) {
      context.fillStyle =
        y % 26 === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(47,31,18,0.18)'
      context.fillRect(0, y, width, 5)
    }
  } else if (planet.id === 'earth') {
    context.fillStyle = 'rgba(32, 128, 76, 0.72)'
    context.beginPath()
    context.ellipse(78, 48, 34, 16, -0.28, 0, Math.PI * 2)
    context.ellipse(168, 74, 44, 18, 0.34, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = 'rgba(255, 255, 255, 0.5)'
    context.fillRect(0, 16, width, 6)
    context.fillRect(0, 104, width, 6)
  } else {
    const seed = planet.id
      .split('')
      .reduce((total, char) => total + char.charCodeAt(0), 0)
    for (let index = 0; index < 80; index += 1) {
      const x = (Math.sin(seed * (index + 1)) * 10_000) % width
      const y = (Math.cos(seed * (index + 3)) * 10_000) % height
      const size = 1.5 + ((seed + index) % 5)
      context.fillStyle =
        index % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.12)'
      context.beginPath()
      context.arc(Math.abs(x), Math.abs(y), size, 0, Math.PI * 2)
      context.fill()
    }
  }
}

function SaturnRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[Math.PI / 2.45, 0.2, 0]}>
      <ringGeometry args={[radius * 1.32, radius * 2.12, 96]} />
      <meshBasicMaterial
        color="#f3dca4"
        opacity={0.44}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  )
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
