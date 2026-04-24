import type { MoonId } from './moons'
import type { PlanetMaterial } from './planetVisuals'

export type MoonVisual = {
  texturePath: string
  textureCredit: string
  textureSourceUrl: string
  material: PlanetMaterial
}

export const MOON_VISUALS: Record<MoonId, MoonVisual> = {
  moon: {
    texturePath: 'textures/moons/moon.webp',
    textureCredit: 'NASA/GSFC/SVS/LRO',
    textureSourceUrl: 'https://svs.gsfc.nasa.gov/4720/',
    material: {
      tint: '#f2f0e8',
      roughness: 0.94,
      metalness: 0,
      emissiveIntensity: 0.025,
    },
  },
  io: {
    texturePath: 'textures/moons/io.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/jupiter.html',
    material: {
      tint: '#fff0a8',
      roughness: 0.86,
      metalness: 0,
      emissiveIntensity: 0.045,
    },
  },
  europa: {
    texturePath: 'textures/moons/europa.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/jupiter.html',
    material: {
      tint: '#fff8e4',
      roughness: 0.74,
      metalness: 0,
      emissiveIntensity: 0.04,
    },
  },
  ganymede: {
    texturePath: 'textures/moons/ganymede.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/jupiter.html',
    material: {
      tint: '#ded4c8',
      roughness: 0.84,
      metalness: 0,
      emissiveIntensity: 0.035,
    },
  },
  callisto: {
    texturePath: 'textures/moons/callisto.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/jupiter.html',
    material: {
      tint: '#cfc2b1',
      roughness: 0.88,
      metalness: 0,
      emissiveIntensity: 0.03,
    },
  },
  titan: {
    texturePath: 'textures/moons/titan.webp',
    textureCredit: 'JPL/Caltech',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/saturn.html',
    material: {
      tint: '#ffd08a',
      roughness: 0.68,
      metalness: 0,
      emissiveIntensity: 0.08,
    },
  },
  enceladus: {
    texturePath: 'textures/moons/enceladus.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/saturn.html',
    material: {
      tint: '#f6fbff',
      roughness: 0.72,
      metalness: 0,
      emissiveIntensity: 0.05,
    },
  },
  triton: {
    texturePath: 'textures/moons/triton.webp',
    textureCredit: 'JPL/Caltech/USGS',
    textureSourceUrl: 'https://space.jpl.nasa.gov/tmaps/neptune.html',
    material: {
      tint: '#f2eee4',
      roughness: 0.82,
      metalness: 0,
      emissiveIntensity: 0.04,
    },
  },
}
