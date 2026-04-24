export type PlanetId =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

export type PlanetDatum = {
  id: PlanetId
  nameKo: string
  nameEn: string
  diameterKm: number
  distanceAu: number
  orbitPeriodDays: number
  rotationPeriodHours: number
  color: string
  descriptionKo: string
}

export const PLANETS: PlanetDatum[] = [
  {
    id: 'mercury',
    nameKo: '수성',
    nameEn: 'Mercury',
    diameterKm: 4_879,
    distanceAu: 0.39,
    orbitPeriodDays: 88,
    rotationPeriodHours: 1_407.6,
    color: '#a9a39a',
    descriptionKo:
      '태양에 가장 가까운 암석 행성입니다. 낮과 밤의 온도 차가 매우 크고, 대기가 거의 없습니다.',
  },
  {
    id: 'venus',
    nameKo: '금성',
    nameEn: 'Venus',
    diameterKm: 12_104,
    distanceAu: 0.72,
    orbitPeriodDays: 224.7,
    rotationPeriodHours: -5_832.5,
    color: '#d7b56d',
    descriptionKo:
      '두꺼운 이산화탄소 대기와 강한 온실 효과를 가진 행성입니다. 자전 방향이 대부분의 행성과 반대입니다.',
  },
  {
    id: 'earth',
    nameKo: '지구',
    nameEn: 'Earth',
    diameterKm: 12_742,
    distanceAu: 1,
    orbitPeriodDays: 365.25,
    rotationPeriodHours: 23.9,
    color: '#5d9cec',
    descriptionKo:
      '액체 상태의 물과 생명체가 확인된 유일한 행성입니다. 한 천문단위는 지구와 태양 사이의 평균 거리입니다.',
  },
  {
    id: 'mars',
    nameKo: '화성',
    nameEn: 'Mars',
    diameterKm: 6_779,
    distanceAu: 1.52,
    orbitPeriodDays: 687,
    rotationPeriodHours: 24.6,
    color: '#c66b4e',
    descriptionKo:
      '산화철이 많은 표면 때문에 붉게 보입니다. 계절과 극관이 있으며 과거 물의 흔적이 발견되었습니다.',
  },
  {
    id: 'jupiter',
    nameKo: '목성',
    nameEn: 'Jupiter',
    diameterKm: 139_820,
    distanceAu: 5.2,
    orbitPeriodDays: 4_331,
    rotationPeriodHours: 9.9,
    color: '#d8b384',
    descriptionKo:
      '태양계에서 가장 큰 가스 행성입니다. 빠르게 자전하며 대적점이라는 거대한 폭풍을 가지고 있습니다.',
  },
  {
    id: 'saturn',
    nameKo: '토성',
    nameEn: 'Saturn',
    diameterKm: 116_460,
    distanceAu: 9.58,
    orbitPeriodDays: 10_747,
    rotationPeriodHours: 10.7,
    color: '#ecd38f',
    descriptionKo:
      '넓고 밝은 고리로 잘 알려진 가스 행성입니다. 고리는 얼음과 암석 조각이 모여 만든 얇은 구조입니다.',
  },
  {
    id: 'uranus',
    nameKo: '천왕성',
    nameEn: 'Uranus',
    diameterKm: 50_724,
    distanceAu: 19.2,
    orbitPeriodDays: 30_589,
    rotationPeriodHours: -17.2,
    color: '#8ed6dc',
    descriptionKo:
      '자전축이 크게 기울어진 얼음 거대 행성입니다. 태양 주위를 거의 옆으로 누워 도는 것처럼 보입니다.',
  },
  {
    id: 'neptune',
    nameKo: '해왕성',
    nameEn: 'Neptune',
    diameterKm: 49_244,
    distanceAu: 30.07,
    orbitPeriodDays: 59_800,
    rotationPeriodHours: 16.1,
    color: '#496fe3',
    descriptionKo:
      '가장 바깥쪽의 주요 행성입니다. 강한 바람과 푸른 대기, 긴 공전 주기를 가진 얼음 거대 행성입니다.',
  },
]
