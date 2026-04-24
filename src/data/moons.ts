import type { PlanetId } from './planets'

export type MoonId =
  | 'moon'
  | 'io'
  | 'europa'
  | 'ganymede'
  | 'callisto'
  | 'titan'
  | 'enceladus'
  | 'triton'

export type MoonDatum = {
  id: MoonId
  parentPlanetId: PlanetId
  nameKo: string
  nameEn: string
  diameterKm: number
  orbitRadiusKm: number
  orbitPeriodDays: number
  orbitDirection: 1 | -1
  color: string
  descriptionKo: string
}

export const MOONS: MoonDatum[] = [
  {
    id: 'moon',
    parentPlanetId: 'earth',
    nameKo: '달',
    nameEn: 'Moon',
    diameterKm: 3_475,
    orbitRadiusKm: 384_400,
    orbitPeriodDays: 27.3,
    orbitDirection: 1,
    color: '#c8c6bd',
    descriptionKo:
      '지구의 유일한 자연 위성입니다. 조석을 만들고 지구 자전축 안정에도 중요한 역할을 합니다.',
  },
  {
    id: 'io',
    parentPlanetId: 'jupiter',
    nameKo: '이오',
    nameEn: 'Io',
    diameterKm: 3_643,
    orbitRadiusKm: 421_800,
    orbitPeriodDays: 1.769,
    orbitDirection: 1,
    color: '#e7c45c',
    descriptionKo:
      '목성의 갈릴레이 위성 중 하나입니다. 강한 조석 가열 때문에 태양계에서 화산 활동이 가장 활발한 천체입니다.',
  },
  {
    id: 'europa',
    parentPlanetId: 'jupiter',
    nameKo: '유로파',
    nameEn: 'Europa',
    diameterKm: 3_122,
    orbitRadiusKm: 671_100,
    orbitPeriodDays: 3.551,
    orbitDirection: 1,
    color: '#d9d0b7',
    descriptionKo:
      '밝은 얼음 표면 아래에 바다가 있을 가능성이 큰 목성의 위성입니다. 생명체 탐사의 주요 관심 대상입니다.',
  },
  {
    id: 'ganymede',
    parentPlanetId: 'jupiter',
    nameKo: '가니메데',
    nameEn: 'Ganymede',
    diameterKm: 5_262,
    orbitRadiusKm: 1_070_400,
    orbitPeriodDays: 7.155,
    orbitDirection: 1,
    color: '#9f9384',
    descriptionKo:
      '태양계에서 가장 큰 위성입니다. 수성보다 크며, 자체 자기장을 가진 것으로 알려져 있습니다.',
  },
  {
    id: 'callisto',
    parentPlanetId: 'jupiter',
    nameKo: '칼리스토',
    nameEn: 'Callisto',
    diameterKm: 4_821,
    orbitRadiusKm: 1_882_700,
    orbitPeriodDays: 16.689,
    orbitDirection: 1,
    color: '#6f675f',
    descriptionKo:
      '오래된 충돌구가 빽빽한 목성의 큰 위성입니다. 표면 변화가 비교적 적어 초기 태양계의 흔적을 간직합니다.',
  },
  {
    id: 'titan',
    parentPlanetId: 'saturn',
    nameKo: '타이탄',
    nameEn: 'Titan',
    diameterKm: 5_149,
    orbitRadiusKm: 1_221_870,
    orbitPeriodDays: 15.945,
    orbitDirection: 1,
    color: '#d8a35b',
    descriptionKo:
      '두꺼운 질소 대기와 메탄 호수를 가진 토성의 가장 큰 위성입니다. 지구와 다른 방식의 복잡한 기상 현상을 보입니다.',
  },
  {
    id: 'enceladus',
    parentPlanetId: 'saturn',
    nameKo: '엔셀라두스',
    nameEn: 'Enceladus',
    diameterKm: 504,
    orbitRadiusKm: 238_020,
    orbitPeriodDays: 1.37,
    orbitDirection: 1,
    color: '#e7eef2',
    descriptionKo:
      '작지만 밝은 얼음 위성입니다. 남극 부근에서 물기둥이 분출되어 내부 바다 가능성을 보여줍니다.',
  },
  {
    id: 'triton',
    parentPlanetId: 'neptune',
    nameKo: '트리톤',
    nameEn: 'Triton',
    diameterKm: 2_707,
    orbitRadiusKm: 354_800,
    orbitPeriodDays: 5.877,
    orbitDirection: -1,
    color: '#d9d5c8',
    descriptionKo:
      '해왕성의 가장 큰 위성입니다. 큰 위성 중 드물게 역행 공전을 하며, 포획된 천체였을 가능성이 큽니다.',
  },
]
