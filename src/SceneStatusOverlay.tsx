type SceneStatusOverlayProps =
  | {
      status: 'loading'
      progress: number
    }
  | {
      status: 'error'
      message?: string
      onReload?: () => void
    }

export function SceneStatusOverlay(props: SceneStatusOverlayProps) {
  if (props.status === 'error') {
    const handleReload = props.onReload ?? (() => window.location.reload())

    return (
      <div
        className="scene-status-overlay scene-status-overlay--error"
        data-testid="scene-error-overlay"
        role="alert"
      >
        <div className="scene-status-panel">
          <p className="scene-status-title">브라우저/WebGL을 확인해 주세요</p>
          <p className="scene-status-copy">
            {props.message ?? '3D 장면을 불러오지 못했습니다.'}
          </p>
          <button
            className="scene-status-action"
            onClick={handleReload}
            type="button"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }

  const progress = normalizeSceneProgress(props.progress)

  return (
    <div
      aria-label="3D 장면 로딩 상태"
      className="scene-status-overlay"
      data-testid="scene-loading-overlay"
      role="status"
    >
      <div className="scene-status-panel">
        <div className="scene-status-row">
          <p className="scene-status-title">3D 장면 준비 중</p>
          <strong>{progress}%</strong>
        </div>
        <div
          aria-label="3D 장면 로딩률"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="scene-progress-track"
          role="progressbar"
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

function normalizeSceneProgress(progress: number) {
  if (!Number.isFinite(progress)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(progress)))
}
