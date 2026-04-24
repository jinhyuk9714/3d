# 3D Solar System Simulator

한국어로 조작할 수 있는 3D 태양계 관측 데모입니다. 태양, 8개 행성, 대표 위성, 궤도, 자전축, NASA/JPL/LRO 계열 텍스처를 한 화면에서 살펴볼 수 있습니다.

**Live Demo:** [https://jinhyuk9714.github.io/3d/](https://jinhyuk9714.github.io/3d/)

## 스크린샷

### 데스크톱

<img src="public/screenshots/solar-desktop.png" alt="태양계 관측실 데스크톱 화면" width="900" />

### 모바일

<img src="public/screenshots/solar-mobile.png" alt="태양계 관측실 모바일 화면" width="320" />

## 해볼 수 있는 것

- 마우스 또는 터치로 3D 장면을 회전, 확대, 이동합니다.
- 태양, 8개 행성, 대표 위성을 클릭하거나 왼쪽 바로가기에서 선택합니다.
- 선택한 천체로 카메라가 이동하고, 오른쪽 패널에서 실제 지름, 거리, 공전/자전 정보를 확인합니다.
- 재생, 일시정지, 리셋, 속도 조절로 공전 흐름을 관찰합니다.
- 왼쪽 제어 패널을 접어 3D 장면을 더 넓게 볼 수 있습니다.

## 현재 기능

- 태양과 8개 행성의 압축 스케일 3D 궤도
- 달, 이오, 유로파, 가니메데, 칼리스토, 타이탄, 엔셀라두스, 트리톤 표시
- 행성 자전축 기울기와 선택 시 축 가이드
- NASA/JPL/LRO 계열 공개 텍스처 기반 표면
- 기본 속도 1일/초, 재생/일시정지/리셋/속도 조절
- 로딩 진행률, WebGL 미지원 안내, 모바일 렌더링 최적화
- GitHub Pages 자동 배포

## 기술 스택

- Vite
- React + TypeScript
- Three.js
- React Three Fiber
- Drei
- Vitest
- Playwright

## 로컬 실행

```bash
npm install
npm run dev
```

## 검증 명령

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 정적 빌드를 만들고 GitHub Pages에 배포합니다.

- Demo: [https://jinhyuk9714.github.io/3d/](https://jinhyuk9714.github.io/3d/)
- Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

## 텍스처 출처

태양, 행성, 위성 표면은 NASA 3D Resources, NASA SVS CGI Moon Kit, JPL Solar System Simulator texture maps의 공개 자료를 로컬 WebP로 변환해 사용합니다.

자세한 출처와 변환 방식은 [`public/textures/README.md`](public/textures/README.md)에 정리되어 있습니다. 일부 외행성 맵은 관측 자료를 바탕으로 한 대표/가공/fictional 성격이 있으므로, 이 앱의 렌더링은 교육용 시각화이며 과학 분석용 데이터가 아닙니다.

## 현재 범위

이 데모는 관찰형 교육 앱입니다. 실제 N-body 물리, 실시간 ephemeris, 모든 위성/소행성, 식 현상은 아직 포함하지 않습니다.
