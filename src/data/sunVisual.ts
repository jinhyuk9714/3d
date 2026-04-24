import type { PlanetMaterial } from './planetVisuals'

export type SunVisual = {
  texturePath: string
  textureCredit: string
  textureSourceUrl: string
  material: PlanetMaterial
}

export const SUN_VISUAL: SunVisual = {
  texturePath: 'textures/sun/sun.webp',
  textureCredit: 'NASA Science',
  textureSourceUrl: 'https://science.nasa.gov/learn/heat/resource/sun-3d-model/',
  material: {
    tint: '#fff4c2',
    roughness: 0.76,
    metalness: 0,
    emissiveIntensity: 1.16,
  },
}
