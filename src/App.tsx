import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import './App.css'
import { PLANETS } from './data/planets'
import type { PlanetDatum, PlanetId } from './data/planets'

type SimulationState = {
  isPlaying: boolean
  speedDaysPerSecond: number
  selectedPlanetId: PlanetId | null
  elapsedDays: number
}

const DEFAULT_SIMULATION: SimulationState = {
  isPlaying: true,
  speedDaysPerSecond: 40,
  selectedPlanetId: null,
  elapsedDays: 0,
}

const isTestMode = import.meta.env.MODE === 'test'
const SolarSystemScene = lazy(async () => {
  const module = await import('./scene/SolarSystemScene')

  return { default: module.SolarSystemScene }
})

function App() {
  const [simulation, setSimulation] =
    useState<SimulationState>(DEFAULT_SIMULATION)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const selectedPlanet = useMemo(
    () =>
      PLANETS.find((planet) => planet.id === simulation.selectedPlanetId) ??
      null,
    [simulation.selectedPlanetId],
  )

  useEffect(() => {
    if (!simulation.isPlaying) {
      return
    }

    let previousTime = performance.now()
    const intervalId = window.setInterval(() => {
      const now = performance.now()
      const elapsedSeconds = (now - previousTime) / 1_000
      previousTime = now

      setSimulation((current) => ({
        ...current,
        elapsedDays:
          current.elapsedDays + elapsedSeconds * current.speedDaysPerSecond,
      }))
    }, 50)

    return () => window.clearInterval(intervalId)
  }, [simulation.isPlaying])

  const selectPlanet = (planetId: PlanetId) => {
    setSimulation((current) => ({ ...current, selectedPlanetId: planetId }))
  }

  const setSpeed = (speedDaysPerSecond: number) => {
    setSimulation((current) => ({ ...current, speedDaysPerSecond }))
  }

  const togglePlayback = () => {
    setSimulation((current) => ({ ...current, isPlaying: !current.isPlaying }))
  }

  const resetSimulation = () => {
    setSimulation((current) => ({ ...current, elapsedDays: 0 }))
  }

  return (
    <main className={`observatory-shell ${isGuideOpen ? 'is-guide-open' : ''}`}>
      <section className="scene-stage" aria-label="태양계 3D 시뮬레이션">
        {isTestMode ? (
          <div
            aria-label="3D 태양계 캔버스"
            className="simulator-canvas simulator-canvas--test"
            data-testid="solar-canvas"
          />
        ) : (
          <Suspense
            fallback={
              <div
                aria-label="3D 태양계 캔버스"
                className="simulator-canvas simulator-canvas--test"
                data-testid="solar-canvas"
              />
            }
          >
            <SolarSystemScene
              elapsedDays={simulation.elapsedDays}
              onSelectPlanet={selectPlanet}
              planets={PLANETS}
              selectedPlanetId={simulation.selectedPlanetId}
            />
          </Suspense>
        )}
        <div className="scene-vignette" aria-hidden="true" />
      </section>

      <header className="topbar">
        <div>
          <p className="eyebrow">Solar System Explorer</p>
          <h1>태양계 관측실</h1>
        </div>
        <div className="topbar-meta">
          <div className="demo-actions">
            <span className="demo-badge">공개 데모</span>
            <button
              aria-controls="demo-guide"
              aria-expanded={isGuideOpen}
              aria-label={isGuideOpen ? '도움말 닫기' : '도움말 열기'}
              className="help-toggle"
              onClick={() => setIsGuideOpen((isOpen) => !isOpen)}
              type="button"
            >
              {isGuideOpen ? '닫기' : '도움말'}
            </button>
          </div>
          <div className="mission-time" aria-label="현재 시뮬레이션 시간">
            <span>{Math.floor(simulation.elapsedDays).toLocaleString('ko-KR')}</span>
            <small>일 경과</small>
          </div>
        </div>
      </header>

      {isGuideOpen ? (
        <section
          aria-label="사용 도움말"
          className="help-panel"
          id="demo-guide"
        >
          <p>마우스로 회전하고 휠로 확대하세요.</p>
          <p>행성 또는 목록을 선택하면 카메라가 이동합니다.</p>
          <p>속도 슬라이더로 공전 시간을 빠르게 훑을 수 있습니다.</p>
        </section>
      ) : null}

      <aside className="control-panel" aria-label="시뮬레이션 제어">
        <div className="panel-section">
          <div className="control-row">
            <button className="primary-action" onClick={togglePlayback} type="button">
              {simulation.isPlaying ? '일시정지' : '재생'}
            </button>
            <button className="secondary-action" onClick={resetSimulation} type="button">
              리셋
            </button>
          </div>

          <label className="speed-control" htmlFor="simulation-speed">
            <span>시뮬레이션 속도</span>
            <strong>{simulation.speedDaysPerSecond}일/초</strong>
          </label>
          <input
            aria-label="시뮬레이션 속도"
            id="simulation-speed"
            max="220"
            min="5"
            onChange={(event) => setSpeed(Number(event.currentTarget.value))}
            step="5"
            type="range"
            value={simulation.speedDaysPerSecond}
          />
        </div>

        <div className="panel-section">
          <h2>행성 바로가기</h2>
          <div className="planet-list">
            {PLANETS.map((planet) => (
              <PlanetButton
                isSelected={planet.id === simulation.selectedPlanetId}
                key={planet.id}
                onSelectPlanet={selectPlanet}
                planet={planet}
              />
            ))}
          </div>
        </div>
      </aside>

      <aside className="info-panel" aria-live="polite">
        {selectedPlanet ? (
          <PlanetDetails planet={selectedPlanet} />
        ) : (
          <div className="empty-state">
            <h2>행성을 선택하세요</h2>
            <p>행성이나 왼쪽 목록을 선택하면 카메라가 이동하고 실제 수치를 보여줍니다.</p>
          </div>
        )}
      </aside>
    </main>
  )
}

function PlanetButton({
  planet,
  isSelected,
  onSelectPlanet,
}: {
  planet: PlanetDatum
  isSelected: boolean
  onSelectPlanet: (planetId: PlanetId) => void
}) {
  return (
    <button
      aria-label={`${planet.nameKo} 선택`}
      aria-pressed={isSelected}
      className={`planet-button ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelectPlanet(planet.id)}
      type="button"
    >
      <span className="planet-swatch" style={{ backgroundColor: planet.color }} />
      <span>{planet.nameKo}</span>
      <small>{planet.distanceAu} AU</small>
    </button>
  )
}

function PlanetDetails({ planet }: { planet: PlanetDatum }) {
  return (
    <div className="planet-details">
      <p className="eyebrow">Selected Planet</p>
      <h2>{planet.nameKo}</h2>
      <p className="latin-name">{planet.nameEn}</p>
      <p className="planet-summary">{planet.descriptionKo}</p>

      <dl className="metric-list">
        <div>
          <dt>태양 거리</dt>
          <dd>{planet.distanceAu.toLocaleString('ko-KR')} AU</dd>
        </div>
        <div>
          <dt>지름</dt>
          <dd>{planet.diameterKm.toLocaleString('ko-KR')} km</dd>
        </div>
        <div>
          <dt>공전 주기</dt>
          <dd>{planet.orbitPeriodDays.toLocaleString('ko-KR')}일</dd>
        </div>
        <div>
          <dt>자전 주기</dt>
          <dd>{Math.abs(planet.rotationPeriodHours).toLocaleString('ko-KR')}시간</dd>
        </div>
      </dl>
    </div>
  )
}

export default App
