import type { PlanetId } from './planets'

export type PlanetMaterial = {
  tint: string
  roughness: number
  metalness: number
  emissiveIntensity: number
}

export type PlanetAtmosphere = {
  color: string
  opacity: number
  scale: number
}

export type PlanetVisual = {
  texturePath: string
  textureCredit: string
  textureSourceUrl: string
  material: PlanetMaterial
  atmosphere?: PlanetAtmosphere
}

export const PLANET_VISUALS: Record<PlanetId, PlanetVisual> = {
  mercury: {
    texturePath: 'textures/planets/mercury.webp',
    textureCredit: 'Caltech/JPL/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/mercury.html',
    material: {
      tint: '#f0ede7',
      roughness: 0.92,
      metalness: 0.02,
      emissiveIntensity: 0.03,
    },
  },
  venus: {
    texturePath: 'textures/planets/venus.webp',
    textureCredit: 'JPL/Caltech',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/venus/',
    material: {
      tint: '#fff1d5',
      roughness: 0.82,
      metalness: 0.01,
      emissiveIntensity: 0.07,
    },
    atmosphere: {
      color: '#ffc46b',
      opacity: 0.22,
      scale: 1.08,
    },
  },
  earth: {
    texturePath: 'textures/planets/earth.webp',
    textureCredit: 'USGS & NASA/JPL',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/earth-a/',
    material: {
      tint: '#ffffff',
      roughness: 0.68,
      metalness: 0.02,
      emissiveIntensity: 0.04,
    },
    atmosphere: {
      color: '#7dd3fc',
      opacity: 0.18,
      scale: 1.07,
    },
  },
  mars: {
    texturePath: 'textures/planets/mars.webp',
    textureCredit: 'NASA/JPL & Caltech',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/mars/',
    material: {
      tint: '#ffd7b5',
      roughness: 0.9,
      metalness: 0.01,
      emissiveIntensity: 0.04,
    },
    atmosphere: {
      color: '#fb923c',
      opacity: 0.1,
      scale: 1.045,
    },
  },
  jupiter: {
    texturePath: 'textures/planets/jupiter.webp',
    textureCredit: 'JPL & Caltech',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/jupiter/',
    material: {
      tint: '#fff7e7',
      roughness: 0.62,
      metalness: 0,
      emissiveIntensity: 0.08,
    },
    atmosphere: {
      color: '#f8d79a',
      opacity: 0.09,
      scale: 1.04,
    },
  },
  saturn: {
    texturePath: 'textures/planets/saturn.webp',
    textureCredit: 'Don Davis & JPL/Caltech',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/saturn/',
    material: {
      tint: '#fff4ce',
      roughness: 0.66,
      metalness: 0,
      emissiveIntensity: 0.08,
    },
    atmosphere: {
      color: '#f7d894',
      opacity: 0.1,
      scale: 1.04,
    },
  },
  uranus: {
    texturePath: 'textures/planets/uranus.webp',
    textureCredit: 'JPL/Caltech',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/uranus.html',
    material: {
      tint: '#e2fcff',
      roughness: 0.58,
      metalness: 0,
      emissiveIntensity: 0.1,
    },
    atmosphere: {
      color: '#a5f3fc',
      opacity: 0.18,
      scale: 1.08,
    },
  },
  neptune: {
    texturePath: 'textures/planets/neptune.webp',
    textureCredit: 'Don Davis & JPL/Caltech',
    textureSourceUrl: 'https://science.nasa.gov/3d-resources/neptune/',
    material: {
      tint: '#dbeafe',
      roughness: 0.56,
      metalness: 0,
      emissiveIntensity: 0.11,
    },
    atmosphere: {
      color: '#60a5fa',
      opacity: 0.16,
      scale: 1.07,
    },
  },
}
